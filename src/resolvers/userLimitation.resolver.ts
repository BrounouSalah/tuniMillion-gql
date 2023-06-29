import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
	CreateUserLimitationInput,
	Grille,
	UpdateUserLimitationInput
} from 'generator/graphql.schema'
import { UserLimitation } from 'models/UserLimitation.entity'
import { User } from '@models'
import { getMongoRepository } from 'typeorm'

import { ForbiddenError } from 'apollo-server-express'
import { Inject, NotFoundException, forwardRef } from '@nestjs/common'

export class UserLimitationResolver {
	@Mutation()
	async createUserLimitation(
		@Args('input') input: CreateUserLimitationInput
	): Promise<UserLimitation> {
		const { userId } = input
		const existingLimitation = await getMongoRepository(UserLimitation).findOne(
			{
				userId
			}
		)
		if (existingLimitation) {
			return existingLimitation
		}
		const res = await getMongoRepository(UserLimitation).save(
			new UserLimitation(input)
		)
		return res
	}

	@Mutation()
	async updateUserLimitation(
		@Args('id') id: string,
		@Args('input') input: UpdateUserLimitationInput
	): Promise<boolean> {
		const userLimitation = await getMongoRepository(UserLimitation).findOne({
			_id: id
		})

		if (!userLimitation) {
			throw new ForbiddenError('userLimitation not found.')
		}
		userLimitation.updatedAt = new Date()
		userLimitation.limit = input.limit ?? userLimitation.limit
		userLimitation.type = input.type ?? userLimitation.type
		userLimitation.rest = input.rest ?? userLimitation.rest
		const updateUserLimitation = await getMongoRepository(
			UserLimitation
		).findOneAndUpdate(
			{ _id: userLimitation._id },
			{ $set: userLimitation },
			{ returnOriginal: false }
		)
		return updateUserLimitation ? true : false
	}

	@Mutation()
	async deleteUserLimitation(@Args('id') id: string): Promise<boolean> {
		const userLimitation = await getMongoRepository(UserLimitation).findOne({
			_id: id
		})

		if (!userLimitation) {
			throw new NotFoundException('UserLimitation not found')
		}
		userLimitation.deletedAt = new Date(Date.now())

		const updateUserLimitation = await getMongoRepository(
			UserLimitation
		).findOneAndUpdate(
			{ _id: userLimitation._id },
			{ $set: userLimitation },
			{ returnOriginal: false }
		)
		return updateUserLimitation ? true : false
	}

	@Query()
	async getUserLimitation(@Args('id') id: string): Promise<UserLimitation> {
		const userlimitation = await getMongoRepository(UserLimitation).findOne({
			where: {
				_id: id,
				deletedAt: null
			}
		})

		return userlimitation
	}
	@Query()
	async getUserLimitationByUserId(
		@Args('userId') userId: string
	): Promise<UserLimitation> {
		return await getMongoRepository(UserLimitation).findOne({
			where: { userId, deletedAt: null }
		})
	}

	@Query()
	async getAllUserLimitations(): Promise<UserLimitation[]> {
		const oneMonthAgo = new Date()
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
		const userLimitations = await getMongoRepository(UserLimitation).find({
			where: {
				updatedAt: {
					$lte: oneMonthAgo
				},
				deletedAt: null
			}
		})

		return userLimitations
	}
}
