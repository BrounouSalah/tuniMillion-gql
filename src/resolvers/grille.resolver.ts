import { Args, Mutation, Query, Context } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { Grille } from '../models/grille.entity'
import {
	Amount,
	CreateGrilleInput,
	PayGrilleInput,
	PaymentStatus,
	RemoveAmountInput,
	Status,
	UpdateGrilleInput
} from 'generator/graphql.schema'
import { ApolloError, ForbiddenError } from 'apollo-server-express'
import { Inject, NotFoundException, forwardRef } from '@nestjs/common'
import { AmountOfWallet, User } from '@models'

import { AmountOfWalletResolver } from './amount-of-wallet.resolver'
import { generateCombinations, gridPrices } from 'utils/helpers/grille'

export class GrilleResolver {
	constructor(
		@Inject(forwardRef(() => AmountOfWalletResolver))
		private walletResolver: AmountOfWalletResolver
	) {}
	@Mutation()
	async createGrille(
		@Args('input') input: CreateGrilleInput,
		@Context('currentUser') currentUser: User
	): Promise<Grille> {
		const { _id } = currentUser
		input.userId = _id

		const gridPrice = gridPrices
		const { numbers, stars } = input

		if (
			numbers.some((number) => number < 1 || number > 50) ||
			new Set(numbers).size !== numbers.length ||
			numbers.length > 10
		) {
			throw new ForbiddenError(
				'Invalid numbers. Please provide a unique set of numbers between 1 and 50 and a maximum of 10 numbers..'
			)
		}

		if (
			stars.some((star) => star < 1 || star > 12) ||
			new Set(stars).size !== stars.length
		) {
			throw new ForbiddenError(
				'Invalid stars. Please provide a unique set of stars between 1 and 12.'
			)
		}

		if (!(numbers.length > 4 && stars.length > 1))
			throw new ForbiddenError('invalid input')
		if (numbers.length > 4 && stars.length > 1) {
			const object = gridPrice[stars.length - 2][numbers.length - 5]
			if (!object) throw new ForbiddenError('invalid input')

			const lastPlayedGrille = await getMongoRepository(Grille).findOne({
				where: {
					deletedAt: null,
					prise: object.prise > 10 ? { $gt: 10 } : { $lte: 10 }
				},
				order: {
					createdAt: 'DESC'
				}
			})
			const combinations: any = await generateCombinations(
				stars,
				numbers,
				object.prise,
				lastPlayedGrille
			)

			return await getMongoRepository(Grille).save(
				new Grille({
					...input,
					prise: object.prise,
					price: object.price,
					combinations
				})
			)
		}
	}

	@Query()
	async getAllGrilles(
		@Args('offSet') offSet?: number,
		@Args('limit') limit?: number
	): Promise<Grille[]> {
		return getMongoRepository(Grille).find({
			cache: true,
			where: {
				deletedAt: null
			},
			order: {
				createdAt: 'DESC'
			},
			skip: offSet,
			take: limit
		})
	}

	@Query()
	async getAllGrillesByStatus(
		@Args('status') status: Status
	): Promise<Grille[]> {
		return getMongoRepository(Grille).find({
			cache: true,
			where: {
				deletedAt: null,
				status
			},
			order: {
				createdAt: 'DESC'
			}
		})
	}

	@Query()
	async getAllGrillesByUserId(
		@Args('userId') userId: string,
		@Args('offSet') offSet?: number,
		@Args('limit') limit?: number
	): Promise<Grille[]> {
		return await getMongoRepository(Grille).find({
			cache: true,
			where: {
				deletedAt: null,
				userId
			},
			order: {
				createdAt: 'DESC'
			},
			skip: offSet,
			take: limit
		})
	}

	@Query()
	async getGrille(@Args('id') id: string): Promise<Grille> {
		const res = await getMongoRepository(Grille).findOne({
			where: {
				_id: id,
				deletedAt: null
			}
		})
		console.log(res)
		return res
	}

	@Mutation()
	async deleteGrille(@Args('_id') _id: string): Promise<boolean> {
		const grille = await getMongoRepository(Grille).findOne({ _id })

		if (!grille) {
			throw new NotFoundException('Grille not found')
		}
		grille.deletedAt = new Date(Date.now())

		const updateGrille = await getMongoRepository(Grille).findOneAndUpdate(
			{ _id: grille._id },
			{ $set: grille },
			{ returnOriginal: false }
		)
		return updateGrille ? true : false
	}

	@Mutation()
	async updateGrille(
		@Args('userId') userId: string,
		@Args('input') input: UpdateGrilleInput
	): Promise<boolean> {
		const grille = await getMongoRepository(User).findOne({ _id: userId })
		if (!grille) {
			throw new ForbiddenError('Grille not found.')
		}
		const updateGrille = await getMongoRepository(Grille).findOneAndUpdate(
			{ userId: grille._id },
			{ $set: input },
			{ returnOriginal: false }
		)
		return updateGrille ? true : false
	}

	@Mutation()
	async payGrille(@Args('id') id: string): Promise<Grille> {
		const grille = await getMongoRepository(Grille).findOne({ _id: id })
		if (!grille) {
			throw new NotFoundException('Grille not found')
		}

		const wallet = await this.walletResolver.getWalletByUserId(grille.userId)

		if (!wallet) {
			throw new ForbiddenError('Wallet not found')
		}
		const userId = grille.userId
		const amount = grille.price
		const input: RemoveAmountInput = {
			userId,
			amount,
			grillId: grille._id
		}
		const removeWallet = await this.walletResolver.removeAmount(input)
		if (!removeWallet) {
			throw new ForbiddenError('something happened payment failed')
		}
		const updategrille = await getMongoRepository(Grille).findOneAndUpdate(
			{ _id: grille._id },
			{ $set: { paymentStatus: PaymentStatus.PAID } },
			{ returnOriginal: false }
		)

		return updategrille.value
	}

	@Query()
	async getGrilleByPaymentStatusAndUserId(
		@Context('currentUser') currentUser: User,
		@Args('paymentStatus') paymentStatus: PaymentStatus,
		@Args('offSet') offSet?: number,
		@Args('limit') limit?: number
	): Promise<Grille[]> {
		console.log(currentUser)
		const where = {
			deletedAt: null,
			paymentStatus,
			userId: currentUser._id
		}
		return await getMongoRepository(Grille).find({
			cache: true,
			where,
			order: {
				createdAt: 'DESC'
			},
			skip: offSet,
			take: limit
		})
	}

	@Query()
	async getGrilleByPaymentStatus(
		@Args('paymentStatus') paymentStatus: PaymentStatus,
		@Args('offSet') offSet?: number,
		@Args('limit') limit?: number
	): Promise<Grille[]> {
		const where = {
			deletedAt: null,
			paymentStatus
		}

		return await getMongoRepository(Grille).find({
			cache: true,
			where,
			order: {
				createdAt: 'DESC'
			},
			skip: offSet,
			take: limit
		})
	}
}
