import { User } from '@models'
import { NotFoundException } from '@nestjs/common'
import { Args, Context, Mutation, Query } from '@nestjs/graphql'
import { ForbiddenError } from 'apollo-server-express'
import {
	CreateGridSimulationInput,
	UpdateGridSimulationInput
} from 'generator/graphql.schema'
import { getMongoRepository } from 'typeorm'
import { GridSimulation } from 'models/grid-simulation.entity'
export class GridSimulationResolver {
	@Mutation()
	async createGridSimulation(
		@Args('input') input: CreateGridSimulationInput,
		@Context('currentUser') currentUser: User
	): Promise<GridSimulation> {
		const { _id } = currentUser
		input.userId = _id

		return await getMongoRepository(GridSimulation).save(
			new GridSimulation(input)
		)
	}

	@Mutation()
	async updateGridSimulation(
		@Args('id') id: string,
		@Args('input') input: UpdateGridSimulationInput
	): Promise<boolean> {
		const gridSimulation = await getMongoRepository(GridSimulation).findOne({
			_id: id
		})
		if (!gridSimulation) {
			throw new ForbiddenError('gridSimulation not found.')
		}
		const updateGrid = await getMongoRepository(
			GridSimulation
		).findOneAndUpdate(
			{ _id: gridSimulation._id },
			{ $set: input },
			{ returnOriginal: false }
		)
		return updateGrid ? true : false
	}

	@Mutation()
	async deleteGridSimulation(@Args('id') id: string): Promise<boolean> {
		const gridSimulation = await getMongoRepository(GridSimulation).findOne({
			_id: id
		})

		if (!gridSimulation) {
			throw new NotFoundException('wallet not found')
		}
		gridSimulation.deletedAt = new Date(Date.now())

		const updateGrid = await getMongoRepository(
			GridSimulation
		).findOneAndUpdate(
			{ _id: gridSimulation._id },
			{ $set: gridSimulation },
			{ returnOriginal: false }
		)
		return updateGrid ? true : false
	}

	@Query()
	async getAllgridSimulations(): Promise<GridSimulation[]> {
		const gridSimulation = await getMongoRepository(GridSimulation).find({
			where: {
				deletedAt: null
			}
		})

		return gridSimulation
	}

	@Query()
	async getgridSimulationById(
		@Args('_id') _id: string
	): Promise<GridSimulation> {
		const gridSimulation = await getMongoRepository(GridSimulation).findOne({
			where: {
				_id,
				deletedAt: null
			}
		})

		return gridSimulation
	}

	@Query()
	async getGridSimulationBuUserId(
		@Args('userId') userId: string
	): Promise<GridSimulation[]> {
		const gridSimulation = await getMongoRepository(GridSimulation).find({
			where: {
				userId,
				deletedAt: null
			}
		})

		return gridSimulation
	}
}
