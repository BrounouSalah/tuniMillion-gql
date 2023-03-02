import {
	Resolver,
	Query,
	Mutation,
	Args,
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

import { User } from '@models'
import { comparePassword, hashPassword } from '@utils'
import { EmailResolver } from './email.resolver'
import { FileResolver } from './file.resolver'
import {
	CreateUserInput,
	UpdateUserInput,
	LoginUserInput,
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
	async me(@Context('currentUser') currentUser: User): Promise<User> {
		return currentUser
	}
	@Query()
	async users(
		@Args('offset') offset: number,
		@Args('limit') limit: number
	): Promise<User[]> {
		const users = await getMongoRepository(User).find({
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
					...input,
					isVerified: false,
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

			await sendMail('verifyEmail', createdUser, emailToken)

			return createdUser
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
		const user = await verifyToken(emailToken, 'emailToken')

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
	async changePassword(
		@Args('_id') _id: string,
		@Args('currentPassword') currentPassword: string,
		@Args('password') password: string
	): Promise<boolean> {
		const user = await getMongoRepository(User).findOne({ _id })

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
}
