import {
	Resolver,
	Query,
	Mutation,
	Args,
	Subscription,
	Context,
	ResolveProperty,
	Parent
} from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import {
	ApolloError,
	AuthenticationError,
	ForbiddenError,
	UserInputError
} from 'apollo-server-core'
import * as uuid from 'uuid'

import { User } from '@models'
import { comparePassword, hashPassword } from '@utils'
import { EmailResolver } from './email.resolver'
import { FileResolver } from './file.resolver'
import {
	CreateUserInput,
	UpdateUserInput,
	LoginUserInput,
	Result,
	SearchInput,
	UserResult,
	LoginResponse,
	RefreshTokenResponse,
	Type,
	AccountStateType,
	UserFilterInput
} from '../generator/graphql.schema'
import { generateToken, verifyToken, tradeToken } from '@auth'
import { sendMail } from '@shared'
import { generate } from 'generate-password'
import { USER_SUBSCRIPTION } from '../environments'

import { forwardRef, Inject } from '@nestjs/common'

import { sendSms } from 'shared/sms'

@Resolver('User')
export class UserResolver {
	constructor(
		// private readonly emailResolver: EmailResolver,

		@Inject(forwardRef(() => EmailResolver))
		private emailResolver: EmailResolver,

		@Inject(forwardRef(() => FileResolver))
		private fileResolver: FileResolver
	) {}

	@Query()
	async hello(): Promise<string> {
		return uuid.v1()
	}

	@Query()
	async today(): Promise<Date> {
		return new Date()
	}

	@Query()
	async search(@Args('conditions') conditions: SearchInput): Promise<Result[]> {
		let result

		const { select, where, order, skip, take } = conditions

		if (Object.keys(where).length > 1) {
			throw new UserInputError('Your where must be 1 collection.')
		}

		const type = Object.keys(where)[0]

		// const createdAt = { $gte: 0, $lte: new Date().getTime() }

		result = await getMongoRepository(type).find({
			where: where[type] && JSON.parse(JSON.stringify(where[type])),
			order: order && JSON.parse(JSON.stringify(order)),
			skip,
			take
		})

		// console.log(result)

		if (result.length === 0) {
			throw new ForbiddenError('Not found.')
		}

		return result
	}

	@Query()
	async searchUser(@Args('userIds') userIds: string[]): Promise<UserResult> {
		let result

		if (userIds.length === 0) {
			throw new UserInputError('userIds can not be blank.')
		}

		result = await getMongoRepository(User).find({
			where: {
				_id: { $in: userIds }
			}
		})

		// tslint:disable-next-line:prefer-conditional-expression
		if (result.length > 1) {
			result = { users: result }
		} else {
			result = result[0]
		}

		return result
	}

	@Query()
	async users(
		@Args('offset') offset: number,
		@Args('limit') limit: number
	): Promise<User[]> {
		const users = await getMongoRepository(User).find({
			// where: { email: { $nin: ['trinchinchin@gmail.com'] } },
			// order: { createdAt: -1 },
			skip: offset,
			take: limit,
			cache: true // 1000: 60000 / 1 minute
		})

		return users
	}

	@Query()
	async finalizedUsers(
		@Args('offset') offset: number,
		@Args('limit') limit: number,
		@Context('currentUser') currentUser: User
	): Promise<User[]> {
		const { _id } = currentUser
		const users = await getMongoRepository(User).find({
			where: {
				_id: { $ne: _id },
				accountState: AccountStateType.FINALIZED,
				deletedAt: null
			},
			// order: { createdAt: -1 },
			skip: offset,
			take: limit,
			cache: true // 1000: 60000 / 1 minute
		})

		return users
	}

	@Query()
	async user(@Args('_id') _id: string): Promise<User> {
		try {
			const user = await getMongoRepository(User).findOne({ _id })

			if (!user) {
				throw new ForbiddenError('User not found.')
			}

			return user
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Query()
	async finalizedUser(
		@Args('_id') _id: string,
		@Args('filter') filter: UserFilterInput
	): Promise<User> {
		try {
			const user = await getMongoRepository(User).findOne({
				where: {
					$and: [
						{ _id },
						{ accountState: AccountStateType.FINALIZED },
						{
							...(filter.firstName
								? { type: { $regex: filter.firstName, $options: 'i' } }
								: {})
						},
						{
							...(filter.lastName
								? { type: { $regex: filter.lastName, $options: 'i' } }
								: {})
						},
						{ deletedAt: null }
					]
				}
			})

			if (!user) {
				throw new ForbiddenError('User not found.')
			}

			return user
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async createUser(
		@Args('input') input: CreateUserInput,
		@Context('pubsub') pubsub: any,
		@Context('req') req: any
	): Promise<User> {
		try {
			let { email, password } = input
			email = email.toLocaleLowerCase()

			let existedUser

			existedUser = await getMongoRepository(User).findOne({
				where: {
					'local.email': email
				}
			})

			if (existedUser) {
				throw new ForbiddenError('User already exists.')
			}

			// Is there a Google account with the same email?
			existedUser = await getMongoRepository(User).findOne({
				where: {
					$or: [{ 'google.email': email }, { 'facebook.email': email }]
				}
			})

			if (existedUser) {
				// Let's merge them?

				const updateUser = await getMongoRepository(User).save(
					new User({
						...input,
						local: {
							email,
							password: await hashPassword(password)
						}
					})
				)

				return updateUser
			}

			const createdUser = await getMongoRepository(User).save(
				new User({
					accountState: AccountStateType.FINALIZED,
					...input,
					isVerified: true,
					local: {
						email,
						password: await hashPassword(password)
					}
				})
			)

			pubsub.publish(USER_SUBSCRIPTION, { userCreated: createdUser })

			// const emailToken = await generateEmailToken(createdUser)

			const emailToken = await generateToken(createdUser, 'emailToken')

			const existedEmail = await this.emailResolver.createEmail({
				userId: createdUser._id,
				type: Type.VERIFY_EMAIL
			})

			// await sendSms(input.phoneNumber, emailToken)

			//await sendMail('verifyEmail', createdUser, emailToken)

			return createdUser
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async createUserAuth(@Args('input') input: string): Promise<User> {
		try {
			let existedUser

			existedUser = await getMongoRepository(User).findOne({
				where: {
					'local.email': input.toLocaleLowerCase()
				}
			})

			if (
				existedUser &&
				existedUser.accountState == AccountStateType.FINALIZED
			) {
				return existedUser
			} else if (
				existedUser &&
				existedUser.accountState == AccountStateType.PENDING
			) {
				await sendMail(
					'finalizeRegistration',
					existedUser,
					existedUser.local.password
				)
				return existedUser
			} else {
				let password = generate({
					length: 10,
					numbers: true
				})
				const createdUser = await getMongoRepository(User).save(
					new User({
						accountState: AccountStateType.PENDING,
						isVerified: true,
						local: {
							email: input.toLocaleLowerCase(),
							password: await hashPassword(password)
						}
					})
				)
				await this.emailResolver.createEmail({
					userId: createdUser._id,
					type: Type.FINALIZE_REGISTRATION
				})
				await sendMail('finalizeRegistration', createdUser, password)
				return createdUser
			}
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async updateUser(
		@Args('_id') _id: string,
		@Args('input') input: UpdateUserInput
	): Promise<boolean> {
		try {
			const user = await getMongoRepository(User).findOne({ _id })

			if (!user) {
				throw new ForbiddenError('User not found.')
			} else {
				if (user.firstName == null && input.firstName != null) {
					await this.changeUserAccountState(user)
				}
			}
			const updateUser = await getMongoRepository(User).findOneAndUpdate(
				{ _id: user._id },
				{ $set: input },
				{ returnOriginal: false }
			)
			return updateUser ? true : false
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	async changeUserAccountState(user: User) {
		user.accountState = AccountStateType.FINALIZED
		await getMongoRepository(User).findOneAndUpdate(
			{ _id: user._id },
			{ $set: user },
			{ returnOriginal: false }
		)
	}

	@Mutation()
	async updateUserAvatar(
		@Args('_id') _id: string,
		@Args('file') file: any,
		@Context('req') req: any
	): Promise<boolean> {
		try {
			const user = await getMongoRepository(User).findOne({ _id })

			if (!user) {
				throw new ForbiddenError('User not found.')
			}

			const newFile = await this.fileResolver.uploadFileLocal(file, req)
			user.avatar = newFile.path

			const updateUser = await getMongoRepository(User).findOneAndUpdate(
				{ _id: user._id },
				{ $set: user },
				{ returnOriginal: false }
			)
			return updateUser ? true : false
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async updateUserBackgroundAvatar(
		@Args('_id') _id: string,
		@Args('file') file: any,
		@Context('req') req: any
	): Promise<boolean> {
		try {
			const user = await getMongoRepository(User).findOne({ _id })

			if (!user) {
				throw new ForbiddenError('User not found.')
			}

			const newFile = await this.fileResolver.uploadFileLocal(file, req)
			user.background = newFile.path

			const updateUser = await getMongoRepository(User).findOneAndUpdate(
				{ _id: user._id },
				{ $set: user },
				{ returnOriginal: false }
			)
			return updateUser ? true : false
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async deleteUser(@Args('_id') _id: string): Promise<boolean> {
		try {
			const user = await getMongoRepository(User).findOne({ _id })

			if (!user) {
				throw new ForbiddenError('User not found.')
			}
			user.deletedAt = new Date(Date.now())

			const updateUser = await getMongoRepository(User).findOneAndUpdate(
				{ _id: user._id },
				{ $set: user },
				{ returnOriginal: false }
			)
			return updateUser ? true : false
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async deleteUsers(): Promise<boolean> {
		try {
			return (await getMongoRepository(User).deleteMany({
				email: { $nin: ['trinhchinchin@gmail.com'] }
			}))
				? true
				: false
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async verifyEmail(@Args('emailToken') emailToken: string): Promise<boolean> {
		// const user = await verifyEmailToken(emailToken)
		const user = await verifyToken(emailToken, 'emailToken')

		console.log(user)

		if (!user.isVerified) {
			user.isVerified = true
			const updateUser = await getMongoRepository(User).findOneAndUpdate(
				{ _id: user._id },
				{ $set: user },
				{ returnOriginal: false }
			)
			return updateUser ? true : false
		} else {
			throw new ForbiddenError('Your email has been verified.')
		}
	}

	@Mutation()
	async login(@Args('input') input: LoginUserInput): Promise<LoginResponse> {
		const { email, password } = input
		const user = await getMongoRepository(User).findOne({
			where: {
				'local.email': email.toLocaleLowerCase()
			}
		})

		if (user && (await comparePassword(password, user.local.password))) {
			return await tradeToken(user)
		}
		throw new AuthenticationError('Login failed.')
	}

	@Mutation()
	async refreshToken(
		@Args('refreshToken') refreshToken: string
	): Promise<RefreshTokenResponse> {
		const user = await verifyToken(refreshToken, 'refreshToken')

		const accessToken = await generateToken(user, 'accessToken')

		return { accessToken }
	}

	@Mutation()
	async lockAndUnlockUser(
		@Args('_id') _id: string,
		@Args('reason') reason: string
	): Promise<boolean> {
		try {
			const user = await getMongoRepository(User).findOne({ _id })

			if (!user) {
				throw new ForbiddenError('User not found.')
			}
			user.reason = !user.isLocked ? reason : ''
			user.isLocked = !user.isLocked
			const updateUser = await getMongoRepository(User).findOneAndUpdate(
				{ _id: user._id },
				{ $set: user },
				{ returnOriginal: false }
			)
			return updateUser ? true : false
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async changePassword(
		@Args('_id') _id: string,
		@Args('currentPassword') currentPassword: string,
		@Args('password') password: string
	): Promise<boolean> {
		const user = await getMongoRepository(User).findOne({ _id })

		// console.log(currentPassword , password)

		if (!user) {
			throw new ForbiddenError('User not found.')
		}

		if (!(await comparePassword(currentPassword, user.local.password))) {
			throw new ForbiddenError('Your current password is missing or incorrect.')
		}

		if (await comparePassword(password, user.local.password)) {
			throw new ForbiddenError(
				'Your new password must be different from your previous password.'
			)
		}
		user.local.password = await hashPassword(password)
		const updateUser = await getMongoRepository(User).findOneAndUpdate(
			{ _id: user._id },
			{ $set: user },
			{ returnOriginal: false }
		)

		return updateUser ? true : false
	}

	@Mutation()
	async forgotPassword(
		@Args('email') email: string,
		@Context('req') req: any
	): Promise<boolean> {
		const user = await getMongoRepository(User).findOne({
			where: {
				'local.email': email,
				isVerified: true
			}
		})

		if (!user) {
			throw new ForbiddenError('User not found.')
		}

		const resetPassToken = await generateToken(user, 'resetPassToken')

		const existedEmail = await this.emailResolver.createEmail({
			userId: user._id,
			type: Type.FORGOT_PASSWORD
		})

		// console.log(existedEmail)

		await sendMail('forgotPassword', user, resetPassToken)

		const date = new Date()
		user.resetPasswordToken = resetPassToken
		user.resetPasswordExpires = date.setHours(date.getHours() + 1) // 1 hour
		const updateUser = await getMongoRepository(User).findOneAndUpdate(
			{ _id: user._id },
			{ $set: user },
			{ returnOriginal: false }
		)
		return updateUser ? true : false
	}

	@Mutation()
	async resetPassword(
		@Args('resetPasswordToken') resetPasswordToken: string,
		@Args('password') password: string
	): Promise<boolean> {
		const user = await getMongoRepository(User).findOne({
			resetPasswordToken
		})

		if (!user) {
			throw new ForbiddenError('User not found.')
		}

		if (user.resetPasswordExpires < Date.now()) {
			throw new AuthenticationError(
				'Reset password token is invalid, please try again.'
			)
		}
		user.local.password = await hashPassword(password)
		user.resetPasswordToken = null
		user.resetPasswordExpires = null
		const updateUser = await getMongoRepository(User).findOneAndUpdate(
			{ _id: user._id },
			{ $set: user },
			{ returnOriginal: false }
		)
		return updateUser ? true : false
	}

	// @Mutation()
	// async createSubscription(
	// 	@Args('source') source: string,
	// 	@Args('ccLast4') ccLast4: string,
	// 	@Context('currentUser') currentUser: User
	// ): Promise<User> {
	// 	// console.log(source)
	// 	if (currentUser.stripeId) {
	// 		throw new ForbiddenError('stripeId already existed.')
	// 	}
	// 	const email = currentUser.local
	// 		? currentUser.local.email
	// 		: currentUser.google
	// 		? currentUser.google.email
	// 		: currentUser.facebook.email

	// 	const customer = await stripe.customers.create({
	// 		email,
	// 		source,
	// 		plan: STRIPE_PLAN!
	// 	})

	// 	// console.log(customer)

	// 	const user = await getMongoRepository(User).save(
	// 		new User({
	// 			...currentUser,
	// 			stripeId: customer.id,
	// 			type: UserType.PREMIUM,
	// 			ccLast4
	// 		})
	// 	)

	// 	return user
	// }

	// @Mutation()
	// async changeCreditCard(
	// 	@Args('source') source: string,
	// 	@Args('ccLast4') ccLast4: string,
	// 	@Context('currentUser') currentUser: User
	// ): Promise<User> {
	// 	// console.log(source)
	// 	if (!currentUser.stripeId || currentUser.type !== UserType.PREMIUM) {
	// 		throw new ForbiddenError('User not found.')
	// 	}

	// 	await stripe.customers.update(currentUser.stripeId, {
	// 		source
	// 	})

	// 	const updateUser = await getMongoRepository(User).save(
	// 		new User({
	// 			...currentUser,
	// 			ccLast4
	// 		})
	// 	)

	// 	return updateUser
	// }

	// @Mutation()
	// async cancelSubscription(
	// 	@Context('currentUser') currentUser: User
	// ): Promise<User> {
	// 	// console.log(source)
	// 	if (!currentUser.stripeId || currentUser.type !== UserType.PREMIUM) {
	// 		throw new ForbiddenError('User not found.')
	// 	}

	// 	// console.log(currentUser.stripeId)

	// 	const stripeCustomer = await stripe.customers.retrieve(currentUser.stripeId)

	// 	// console.log(stripeCustomer.sources)

	// 	const [subscription] = stripeCustomer.subscriptions.data

	// 	// console.log(subscription)

	// 	await stripe.subscriptions.del(subscription.id)

	// 	await stripe.customers.deleteCard(
	// 		currentUser.stripeId,
	// 		stripeCustomer.default_source as string
	// 	)

	// 	currentUser.stripeId = null
	// 	currentUser.type = UserType.BASIC

	// 	const user = await getMongoRepository(User).save(currentUser)

	// 	return user
	// }

	@Subscription(() => Object, {
		filter: (payload: any, variables: any) => {
			// console.log('payload', payload)
			// console.log('variables', variables)
			// return payload.menuPublishByOrder.currentsite === variables.currentsite
			return true
		}
	})
	async newUser(@Context('pubsub') pubsub: any): Promise<User> {
		return pubsub.asyncIterator(USER_SUBSCRIPTION)
	}

	@ResolveProperty()
	async fullName(@Parent() user: User): Promise<string> {
		const { firstName, lastName } = user
		return `${firstName} ${lastName}`
	}

	// @ResolveProperty()
	// async local(@Parent() user: User): Promise<object> {
	// 	const { local } = user
	// 	local.password = ''
	// 	return local
	// }

	@Mutation()
	async validateUser(
		@Args('text') text: string,
		@Args('input') input: CreateUserInput
	): Promise<boolean> {
		return true
	}
}
