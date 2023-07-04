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
	VerificationTypeFilter,
	AddFavoritesInput,
	Favorites,
	User as UserGraph,
	VerificationStatus,
	VerificationProcessInput,
	AdminCreateUserInput,
	AdminUpdateUserInput
} from '../generator/graphql.schema'
import { generateToken, verifyToken, tradeToken } from '@auth'
import { sendMail } from '@shared'
import { generate } from 'generate-password'
import { USER_SUBSCRIPTION } from '../environments'

import { forwardRef, Inject } from '@nestjs/common'

import { sendSms } from 'shared/sms'
import { GrilleResolver } from './grille.resolver'

import { AmountOfWalletResolver } from './amount-of-wallet.resolver'
import { UserLimitationResolver } from './userLimitation.resolver'
import { UserNotificationsResolver } from './userNotifications.resolver'

const DEFAULTUSERLIMITAMAOUNT = 5940

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

		@Inject(forwardRef(() => UserLimitationResolver))
		private userLimitationResolver: UserLimitationResolver,

		@Inject(forwardRef(() => GrilleResolver))
		private grilleResolver: GrilleResolver,
		@Inject(forwardRef(() => UserNotificationsResolver))
		private notificationReolver: UserNotificationsResolver
	) {}
	@Query()
	async me(@Context('currentUser') currentUser: User): Promise<UserGraph> {
		const grilles = await this.grilleResolver.getAllGrillesByUserId(
			currentUser._id
		)
		const userLimitation =
			await this.userLimitationResolver.getUserLimitationByUserId(
				currentUser._id
			)
		const wallet = await this.walletResolver.getWalletByUserId(currentUser._id)
		const notifications =
			await this.notificationReolver.getUserNotificationByUserId(
				currentUser._id
			)

		return {
			...currentUser,
			grilles,
			wallet,
			userLimitation,
			notifications: notifications.data
		}
	}

	@Query()
	async searchUsersByDate(
		@Args('createdAt') createdAt: string
	): Promise<User[]> {
		return await getMongoRepository(User).find({
			cache: true,
			where: {
				createdAt: { $gte: new Date(createdAt) },
				deletedAt: null
			}
		})
	}

	@Query()
	async getUsersByVerificationStatus(
		@Args('input') input: VerificationStatus
	): Promise<User[]> {
		return await getMongoRepository(User).find({
			cache: true,
			where: {
				'verificationDoc.verificationStatus': input,
				deletedAt: null
			}
		})
	}

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

	// @Query()
	// async finalizedUsers(
	// 	@Args('offset') offset: number,
	// 	@Args('limit') limit: number,
	// 	@Context('currentUser') currentUser: User
	// ): Promise<User[]> {
	// 	const { _id } = currentUser
	// 	const users = await getMongoRepository(User).find({
	// 		where: {
	// 			accountState: AccountStateType.FINALIZED,
	// 			deletedAt: null
	// 		},

	// 		skip: offset,
	// 		take: limit,
	// 		cache: true
	// 	})

	// 	return users
	// }

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

	// @Query()
	// async finalizedUser(
	// 	@Args('_id') _id: string,
	// 	@Args('filter') filter: UserFilterInput
	// ): Promise<User> {
	// 	try {
	// 		const user = await getMongoRepository(User).findOne({
	// 			where: {
	// 				$and: [
	// 					{ _id },
	// 					{ accountState: AccountStateType.FINALIZED },
	// 					{
	// 						...(filter.firstName
	// 							? { type: { $regex: filter.firstName, $options: 'i' } }
	// 							: {})
	// 					},
	// 					{
	// 						...(filter.lastName
	// 							? { type: { $regex: filter.lastName, $options: 'i' } }
	// 							: {})
	// 					},
	// 					{ deletedAt: null }
	// 				]
	// 			}
	// 		})

	// 		if (!user) {
	// 			throw new ForbiddenError('User not found.')
	// 		}

	// 		return user
	// 	} catch (error) {
	// 		throw new ApolloError(error)
	// 	}
	// }

	@Mutation()
	async createUser(
		@Args('input') input: CreateUserInput,
		@Context('pubsub') pubsub: any,
		@Context('req') req: any
	): Promise<User> {
		try {
			let { email } = input
			const { password } = input
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
					isVerified: true,
					local: {
						email,
						password: await hashPassword(password)
					}
				})
			)

			// call create wallet from  amount of wallet and update user with walletId
			const wallet = await this.walletResolver.createWallet({
				userId: createdUser._id
			})
			// call create user limitation and update user with userLimitationId
			const defaultUserLimitationInput = {
				userId: createdUser._id,
				limit: DEFAULTUSERLIMITAMAOUNT
			}
			const userLimitation =
				await this.userLimitationResolver.createUserLimitation(
					defaultUserLimitationInput
				)
			createdUser.walletId = wallet._id
			createdUser.userLimitationId = userLimitation._id
			if (createdUser.userVerificationData.verificationImage.length > 0) {
				createdUser.verificationDoc = {
					verificationStatus: VerificationStatus.PROCESSING,
					verificationMessage: 'Documents are being processed'
				}
			} else {
				createdUser.verificationDoc = {
					verificationStatus: VerificationStatus.NO_DOCUMENTS,
					verificationMessage: 'No Documents are uploaded to verify the account'
				}
			}
			const updateUser = await getMongoRepository(User).findOneAndUpdate(
				{ _id: createdUser._id },
				{ $set: { ...createdUser, walletId: wallet._id } },
				{ returnOriginal: false }
			)

			// get user and return it with new walletId

			pubsub.publish(USER_SUBSCRIPTION, { userCreated: createdUser })

			// const emailToken = await generateEmailToken(createdUser)

			const emailToken = await generateToken(createdUser, 'emailToken')

			const existedEmail = await this.emailResolver.createEmail({
				userId: createdUser._id,
				type: Type.VERIFY_EMAIL
			})

			// await sendSms(input.phoneNumber, emailToken)

			// await sendMail('verifyEmail', createdUser, emailToken)

			return createdUser
		} catch (error) {
			throw new ApolloError(error)
		}
	}
	@Mutation()
	async adminCreateUser(
		@Args('input') input: AdminCreateUserInput,
		@Context('pubsub') pubsub: any,
		@Context('req') req: any
	): Promise<User> {
		try {
			let { email } = input
			const { password } = input
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
					isVerified: true,
					local: {
						email,
						password: await hashPassword(password)
					}
				})
			)

			// call create wallet from  amount of wallet and update user with walletId
			const wallet = await this.walletResolver.createWallet({
				userId: createdUser._id
			})
			// call create user limitation and update user with userLimitationId
			const defaultUserLimitationInput = {
				userId: createdUser._id,
				limit: DEFAULTUSERLIMITAMAOUNT
			}
			const userLimitation =
				await this.userLimitationResolver.createUserLimitation(
					defaultUserLimitationInput
				)
			createdUser.walletId = wallet._id
			createdUser.userLimitationId = userLimitation._id
			if (createdUser.userVerificationData.verificationImage.length > 0) {
				createdUser.verificationDoc = {
					verificationStatus: VerificationStatus.PROCESSING,
					verificationMessage: 'Documents are being processed'
				}
			} else {
				createdUser.verificationDoc = {
					verificationStatus: VerificationStatus.NO_DOCUMENTS,
					verificationMessage: 'No Documents are uploaded to verify the account'
				}
			}
			const updateUser = await getMongoRepository(User).findOneAndUpdate(
				{ _id: createdUser._id },
				{ $set: { ...createdUser, walletId: wallet._id } },
				{ returnOriginal: false }
			)

			return createdUser
		} catch (error) {
			throw new ApolloError(error)
		}
	}
	@Mutation()
	async verifyUserDocuments(
		@Args('input') input: VerificationProcessInput
	): Promise<boolean> {
		try {
			const { userId, status, message } = input
			const user = await getMongoRepository(User).findOne({
				where: {
					deletedAt: null,
					_id: userId
				}
			})
			if (!user) {
				throw new ForbiddenError('User not found.')
			}
			user.verificationDoc = {
				verificationStatus: status,
				verificationMessage: message
			}

			const updatedUser = await getMongoRepository(User).findOneAndUpdate(
				{ _id: user._id },
				{
					$set: {
						...user,
						identityVerified: status === VerificationStatus.ACCEPTED
					}
				},
				{ returnOriginal: false }
			)
			return updatedUser ? true : false
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

	@Mutation()
	async adminUpdateUser(
		@Args('_id') _id: string,
		@Args('input') input: AdminUpdateUserInput
	): Promise<boolean> {
		try {
			const user = await getMongoRepository(User).findOne({ _id })

			if (!user) {
				throw new ForbiddenError('User not found.')
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
		const { email, password, birthDate } = input
		const user = await getMongoRepository(User).findOne({
			where: {
				'local.email': email.toLocaleLowerCase()
			}
		})

		if (user && (await comparePassword(password, user.local.password))) {
			if (user.birthDate === birthDate) {
				return await tradeToken(user)
			} else {
				throw new AuthenticationError('Incorrect birthdate.')
			}
		}
		throw new AuthenticationError('Login failed.')
	}

	@Mutation()
	async adminLogin(
		@Args('input') input: LoginUserInput
	): Promise<LoginResponse> {
		const { email, password } = input
		const user = await getMongoRepository(User).findOne({
			where: {
				'local.email': email.toLocaleLowerCase()
			}
		})

		if (user && (await comparePassword(password, user.local.password))) {
			if (user.userRole === 'ADMIN') {
				return await tradeToken(user)
			} else {
				throw new AuthenticationError('Your dont have authorization')
			}
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
	async adminChangeUserPassword(
		@Args('_id') _id: string,
		@Args('password') password: string
	): Promise<boolean> {
		const user = await getMongoRepository(User).findOne({ _id })

		if (!user) {
			throw new ForbiddenError('User not found.')
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
				'local.email': email
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

	@Mutation()
	async addFavorites(
		@Args('input') input: AddFavoritesInput,
		@Context('currentUser') currentUser: User
	): Promise<User> {
		const { numbers, stars } = input
		const user = await getMongoRepository(User).findOne({
			_id: currentUser._id
		})

		if (!user) {
			throw new ForbiddenError('User not found.')
		}

		if (!user.favorites) user.favorites = []
		const existingFavorites = user.favorites.findIndex((el) => {
			return JSON.stringify(el) === JSON.stringify({ numbers, stars })
		})

		if (existingFavorites !== -1) {
			const newFav = [...user.favorites]
			newFav.splice(existingFavorites, 1)

			await getMongoRepository(User).findOneAndUpdate(
				{ _id: user._id },
				{ $set: { favorites: newFav } },
				{ returnOriginal: false }
			)
		} else {
			const favorite = [...user.favorites]
			favorite.push({ numbers, stars })
			const updateUser = await getMongoRepository(User).findOneAndUpdate(
				{ _id: user._id },
				{ $set: { favorites: favorite } },
				{ returnOriginal: false }
			)
		}

		return user
	}

	@Query()
	async checkUserByEmail(@Args('email') email: string): Promise<boolean> {
		try {
			const user = await getMongoRepository(User).findOne({
				where: {
					'local.email': email
				}
			})
			if (user) {
				return true
			}
			return false
		} catch (error) {
			throw new ForbiddenError(error)
		}
	}
}
