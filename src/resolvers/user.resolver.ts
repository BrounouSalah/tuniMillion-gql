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

import { User, UserLimitation } from '@models'
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
	UserFilterInput,
	FilterInput,
	VerificationTypeFilter
} from '../generator/graphql.schema'
import { generateToken, verifyToken, tradeToken } from '@auth'
import { sendMail } from '@shared'
import { generate } from 'generate-password'
import { USER_SUBSCRIPTION } from '../environments'

import { forwardRef, Inject } from '@nestjs/common'

import { sendSms } from 'shared/sms'
import { GrilleResolver } from './grille.resolver'
import * as crypto from 'crypto'
import { AmountOfWallet } from '@models'
import { AmountOfWalletResolver } from './amount-of-wallet.resolver'


@Resolver('User')
export class UserResolver {
	constructor(
		// private readonly emailResolver: EmailResolver,

		@Inject(forwardRef(() => EmailResolver))
		private emailResolver: EmailResolver,

		@Inject(forwardRef(() => FileResolver))
		private fileResolver: FileResolver,

		@Inject(forwardRef(() => AmountOfWalletResolver))
		private walletResolver: AmountOfWalletResolver,

		@Inject(forwardRef(() => GrilleResolver))
		private grilleResolver: GrilleResolver
	) {}

	// @Query()
	// async hello(): Promise<string> {
	// 	return uuid.v1()
	// }

	// @Query()
	// async today(): Promise<Date> {
	// 	return new Date()
	// }
	@Query()
	async me(@Context('currentUser') currentUser: User): Promise<User> {
		const grille = await this.grilleResolver.getAllGrillesByUserId(
			currentUser._id
		)
		// let grilles = [{
		// 	_id:grille._id,
		// 	userId: currentUser._id,
		// 	Numbers:grille.Numbers,
		// 	Stars: [5,3]
		// }]
		// currentUser.grilles = grilles
		return { ...currentUser, grilles: grille }
	}

	// @Query()
	// async search(@Args('conditions') conditions: SearchInput): Promise<Result[]> {
	// 	let result

	// 	const { select, where, order, skip, take } = conditions

	// 	if (Object.keys(where).length > 1) {
	// 		throw new UserInputError('Your where must be 1 collection.')
	// 	}

	// 	const type = Object.keys(where)[0]

	// 	// const createdAt = { $gte: 0, $lte: new Date().getTime() }

	// 	result = await getMongoRepository(type).find({
	// 		where: where[type] && JSON.parse(JSON.stringify(where[type])),
	// 		order: order && JSON.parse(JSON.stringify(order)),
	// 		skip,
	// 		take
	// 	})

	// 	// console.log(result)

	// 	if (result.length === 0) {
	// 		throw new ForbiddenError('Not found.')
	// 	}

	// 	return result
	// }

	@Query()
	async users(
		@Args('filter') filter: FilterInput,
		@Args('offset') offset: number,
		@Args('limit') limit: number
	): Promise<User[]> {
		if (
			filter &&
			filter.type === undefined &&
			filter.isVerified === undefined
		) {
			const users = await getMongoRepository(User).find({
				skip: offset,
				take: limit,
				cache: true // 1000: 60000 / 1 minute
			})

			return users
		} else if (filter && filter.type === VerificationTypeFilter.IDENTITY) {
			const users = await getMongoRepository(User).find({
				where: {
					identityVerified: filter.isVerified
				},

				skip: offset,
				take: limit,
				cache: true // 1000: 60000 / 1 minute
			})

			return users
		} else {
			const users = await getMongoRepository(User).find({
				where: {
					isVerified: filter.isVerified
				},
				skip: offset,
				take: limit,
				cache: true // 1000: 60000 / 1 minute
			})

			return users
		}
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
		
		//@Context('idLimitation') idLimitation: UserLimitation
	
	): Promise<User> {
		//const { _id } = idLimitation
		//input.IdUserLimitation = _id
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

			//call create wallet from  amount of wallet and update user with walletId
			const wallet = await this.walletResolver.createWallet({userId:createdUser._id})
			createdUser.walletId = wallet._id;
			const updateUser = await getMongoRepository(User).findOneAndUpdate(
				{ _id: createdUser._id },
				{ $set: {...createdUser, walletId:wallet._id} },
				{ returnOriginal: false }
			)

			//get user and return it with new walletId
			

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

	// @Mutation()

	// async createUserAuth(@Args('input') input: string): Promise<User> {
	// 	try {
	// 		let existedUser

	// 		existedUser = await getMongoRepository(User).findOne({
	// 			where: {
	// 				'local.email': input.toLocaleLowerCase()
	// 			}
	// 		})

	// 		if (
	// 			existedUser &&
	// 			existedUser.accountState == AccountStateType.FINALIZED
	// 		) {
	// 			return existedUser
	// 		} else if (
	// 			existedUser &&
	// 			existedUser.accountState == AccountStateType.PENDING
	// 		) {
	// 			await sendMail(
	// 				'finalizeRegistration',
	// 				existedUser,
	// 				existedUser.local.password
	// 			)
	// 			return existedUser
	// 		} else {
	// 			let password = generate({
	// 				length: 10,
	// 				numbers: true
	// 			})
	// 			const createdUser = await getMongoRepository(User).save(
	// 				new User({

	// 					isVerified: true,
	// 					local: {
	// 						email: input.toLocaleLowerCase(),
	// 						password: await hashPassword(password)
	// 					},

	// 				})
	// 			)
	// 			await this.emailResolver.createEmail({
	// 				userId: createdUser._id,
	// 				type: Type.FINALIZE_REGISTRATION
	// 			}),

	// 			await sendMail('finalizeRegistration', createdUser, password)
	// 			return createdUser
	// 		}
	// 	} catch (error) {
	// 		throw new ApolloError(error)
	// 	}
	// }

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
