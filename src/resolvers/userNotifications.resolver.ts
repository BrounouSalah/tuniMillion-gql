import { Args, Mutation, Query } from '@nestjs/graphql'
import {
	CreateUserNotificationInput,
	GetNotificationsResponse,
	UpdateUserNotificationInput,
	UserNotification
} from 'generator/graphql.schema'

import { getMongoRepository } from 'typeorm'

import { ApolloError, ForbiddenError } from 'apollo-server-express'
import { NotFoundException, forwardRef } from '@nestjs/common'
import { UserNotifications } from 'models/user-notifications.entity'

export class UserNotificationsResolver {
	@Mutation()
	async createUserNotification(
		@Args('input') input: CreateUserNotificationInput
	): Promise<UserNotification> {
		try {
			const res = await getMongoRepository(UserNotifications).save(
				new UserNotifications(input)
			)
			return res
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async updateUserNotification(
		@Args('id') id: string,
		@Args('input') input: UpdateUserNotificationInput
	): Promise<boolean> {
		const userNotification = await getMongoRepository(
			UserNotifications
		).findOne({
			_id: id
		})
		if (!userNotification) {
			throw new ForbiddenError('userNotification not found.')
		}
		const updateUserNotification = await getMongoRepository(
			UserNotifications
		).findOneAndUpdate(
			{ _id: userNotification._id },
			{ $set: input },
			{ returnOriginal: false }
		)
		return updateUserNotification ? true : false
	}

	@Mutation()
	async deleteUserNotification(@Args('id') id: string): Promise<boolean> {
		const userNotification = await getMongoRepository(
			UserNotifications
		).findOne({
			_id: id
		})

		if (!userNotification) {
			throw new NotFoundException('userNotification not found')
		}
		userNotification.deletedAt = new Date(Date.now())

		const updateUserLimitation = await getMongoRepository(
			UserNotifications
		).findOneAndUpdate(
			{ _id: userNotification._id },
			{ $set: userNotification },
			{ returnOriginal: false }
		)
		return updateUserLimitation ? true : false
	}

	@Query()
	async getUserNotification(@Args('id') id: string): Promise<UserNotification> {
		const userNotification = await getMongoRepository(
			UserNotifications
		).findOne({
			where: {
				_id: id,
				deletedAt: null
			}
		})

		return userNotification
	}
	@Query()
	async getUserNotificationByUserId(
		@Args('userId') userId: string,
		@Args('limit') limit?: number,
		@Args('offSet') offSet?: number
	): Promise<GetNotificationsResponse> {
		const res = await getMongoRepository(UserNotifications).find({
			where: { userId, deletedAt: null },
			order: {
				createdAt: 'DESC'
			},
			skip: offSet,
			take: limit
		})
		const totalCount = await getMongoRepository(UserNotifications).findAndCount(
			{
				where: { userId, deletedAt: null }
			}
		)
		const totalClosed = await getMongoRepository(
			UserNotifications
		).findAndCount({
			where: { userId, deletedAt: null, isOpen: false }
		})
		return { data: res, totalNotif: totalCount[1], closedNotif: totalClosed[1] }
	}

	@Query()
	async getAllUserNotifications(): Promise<UserNotification[]> {
		const userNotifications = await getMongoRepository(UserNotifications).find({
			where: {
				deletedAt: null
			},
			order: {
				createdAt: 'DESC'
			}
		})

		return userNotifications
	}
	@Mutation()
	async openNotification(@Args('id') id: string): Promise<boolean> {
		const userNotification = await getMongoRepository(
			UserNotifications
		).findOne({
			_id: id
		})
		if (!userNotification) {
			throw new ForbiddenError('userNotification not found.')
		}
		userNotification.isOpen = true
		const updateUserNotification = await getMongoRepository(
			UserNotifications
		).findOneAndUpdate(
			{ _id: userNotification._id },
			{ $set: userNotification },
			{ returnOriginal: false }
		)
		return updateUserNotification.value
	}
	@Query()
	async getClosedUserNotificationNumbersByUserId(
		@Args('userId') userId: string
	): Promise<number> {
		const res = await getMongoRepository(UserNotifications).find({
			where: { userId, deletedAt: null, isOpen: false },
			order: {
				createdAt: 'DESC'
			}
		})

		return res.length ?? 0
	}
}
