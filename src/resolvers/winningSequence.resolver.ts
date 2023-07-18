import { Inject, NotFoundException, forwardRef } from '@nestjs/common'
import { Args, Mutation, Query } from '@nestjs/graphql'
import { ApolloError, ForbiddenError } from 'apollo-server-express'
import {
	CreateWinningSequenceInput,
	PaymentStatus,
	Statique,
	Status,
	UpdateWinningSequenceInput,
	WinningRank,
	WinningRankCount
} from 'generator/graphql.schema'
import { WinningSequence } from 'models/winningSequence.entity'
import { getMongoRepository } from 'typeorm'
import { GrilleResolver } from './grille.resolver'

import { getStatistique } from 'utils/helpers/statistique'
import {
	compareGrille,
	compareGrilleWithWinningSequence
} from 'utils/helpers/winningSequence'
import { AmountOfWallet, Grille } from '@models'
import { TotalCagnoteAmount } from 'utils/helpers/cagnoteAmount'
import { AmountOfWalletResolver } from './amount-of-wallet.resolver'
import { calculateMoneyAmout } from 'utils/helpers/winningMoneyAmout'
import { PaymentTaxeResolver } from './paymentTaxe.resolver'

export class WinningSequenceResolver {
	constructor(
		@Inject(forwardRef(() => GrilleResolver))
		private grilleResolver: GrilleResolver,
		@Inject(forwardRef(() => AmountOfWalletResolver))
		private walletResolver: AmountOfWalletResolver,
		@Inject(forwardRef(() => PaymentTaxeResolver))
		private cagnoteResolver: PaymentTaxeResolver
	) {}

	@Mutation()
	async createWinningSequence(
		@Args('input') input: CreateWinningSequenceInput
	): Promise<WinningSequence> {
		const { numbers, stars } = input
		const totalCagnote = await this.cagnoteResolver.getCagnoteAmount()
		if (
			numbers.some((number) => number < 1 || number > 50) ||
			new Set(numbers).size !== numbers.length ||
			numbers.length !== 5
		) {
			throw new ForbiddenError(
				'Invalid numbers. Please provide a unique set of numbers between 1 and 50 and numbers = 5.'
			)
		}

		if (
			stars.some((star) => star < 1 || star > 12) ||
			new Set(stars).size !== stars.length ||
			stars.length !== 2
		) {
			throw new ForbiddenError(
				'Invalid stars. Please provide a unique set of stars between 1 and 12 and stars = 2.'
			)
		}

		const response = await getMongoRepository(WinningSequence).save(
			new WinningSequence({ ...input, metaData: totalCagnote })
		)

		const paidGrilles =
			await this.grilleResolver.getGrilleByPaymentStatusAndStatus(
				Status.PENDING,
				PaymentStatus.PAID
			)
		for (const grille of paidGrilles) {
			const result = compareGrille(grille, response)
			if (
				result.grilleStatus === Status.WIN ||
				result.grilleStatus === Status.JACKPOT
			) {
				const userWallet = await this.walletResolver.getWalletByUserId(
					grille.userId
				)

				const updateWallet = await getMongoRepository(
					AmountOfWallet
				).findOneAndUpdate(
					{ _id: userWallet._id },
					{
						$set: {
							totalAmount:
								userWallet.totalAmount +
								calculateMoneyAmout(
									totalCagnote.totalCAG_CUMM,
									result.winningNumbers.length,
									result.winningStars.length
								)
							//inCommingTransactions: wallet.inCommingTransactions
						}
					},
					{ returnOriginal: false }
				)
			}
			const singleGrille = await getMongoRepository(Grille).findOne({
				_id: grille._id
			})
			if (!singleGrille) {
				throw new ForbiddenError('Grille not found.')
			}
			let data = {
				...singleGrille,
				winningSequenceId: response._id,
				winningNumbers: result.winningNumbers,
				winningStars: result.winningStars,
				status: result.grilleStatus,
				winningPrice: calculateMoneyAmout(
					totalCagnote.totalCAG_CUMM,
					result.winningNumbers.length,
					result.winningStars.length
				)
			}

			await getMongoRepository(Grille).findOneAndUpdate(
				{ _id: grille._id },
				{ $set: { ...data } },
				{ returnOriginal: false }
			)
		}
		return response
	}

	@Query()
	async getStaticWinningSequence(
		@Args('_id') _id: string
	): Promise<WinningSequence> {
		const grilles = await this.grilleResolver.getAllGrilles(
			undefined,
			undefined,
			PaymentStatus.PAID
		)
		const winningsequence = await getMongoRepository(WinningSequence).findOne({
			cache: true,
			where: {
				_id,
				deletedAt: null
			}
		})
		const rankCounts = {
			[WinningRank.FIRST]: 0,
			[WinningRank.SECOND]: 0,
			[WinningRank.THIRD]: 0,
			[WinningRank.FOURTH]: 0,
			[WinningRank.FIFTH]: 0,
			[WinningRank.SIXTH]: 0,
			[WinningRank.SEVENTH]: 0,
			[WinningRank.EIGHTH]: 0,
			[WinningRank.NINTH]: 0,
			[WinningRank.TENTH]: 0,
			[WinningRank.ELEVENTH]: 0,
			[WinningRank.TWELFTH]: 0,
			[WinningRank.THIRTEENTH]: 0,
			[WinningRank.NONE]: 0
		}

		const userSet = new Set<string>() // Création d'un ensemble pour stocker les identifiants des utilisateurs

		grilles.forEach((grille) => {
			const userId = grille.userId // Récupération de l'identifiant de l'utilisateur de la grille

			if (userSet.has(userId)) {
				return
			}

			const winningRank = compareGrilleWithWinningSequence(
				grille,
				winningsequence
			)
			console.log(winningRank)
			if (winningRank) {
				rankCounts[winningRank] += 1 // Incrémentation du compteur correspondant au winningRank dans rankCounts
				userSet.add(userId) // Ajout de l'identifiant de l'utilisateur à l'ensemble pour éviter de les compter à nouveau
			}

			getMongoRepository(Grille).findOneAndUpdate(
				{ _id: grille._id },
				{ $set: { status: grille.status } },
				{ returnOriginal: false }
			)
		})

		const counts = Object.entries(rankCounts).map(([rank, count]) => ({
			rank: rank as WinningRank,
			count: Number.isNaN(count) ? 0 : count
		})) as WinningRankCount[]

		const updatedwinningsequence = await getMongoRepository(
			WinningSequence
		).findOneAndUpdate(
			{ _id: winningsequence._id },
			{ $set: { userContsByRang: counts } },
			{ returnOriginal: false }
		)

		return updatedwinningsequence.value
	}

	@Query()
	async getAllWinningSequences(): Promise<WinningSequence[]> {
		return getMongoRepository(WinningSequence).find({
			cache: true,
			where: {
				deletedAt: null
			}
		})
	}

	@Query()
	async getWinningSequneceById(
		@Args('_id') _id: string
	): Promise<WinningSequence> {
		return await getMongoRepository(WinningSequence).findOne({
			cache: true,
			where: {
				_id,
				deletedAt: null
			}
		})
	}

	@Query()
	async getAllWinningSequencesByDate(
		@Args('createdAt') createdAt: string
	): Promise<WinningSequence[]> {
		return await getMongoRepository(WinningSequence).find({
			cache: true,
			where: {
				createdAt: { $gte: new Date(createdAt) },
				// createdAt: +new Date(createdAt),
				deletedAt: null
			}
		})
	}

	@Query()
	async getAllWinningSequencesByRange(
		@Args('startedAt') startedAt: string,
		@Args('endedAt') endedAt: string
	): Promise<WinningSequence[]> {
		const starteddate = new Date(startedAt)
		const endeddate = new Date(endedAt)
		const dayStart = new Date(
			starteddate.getUTCFullYear(),
			starteddate.getUTCMonth(),
			starteddate.getUTCDay(),
			0,
			0,
			0
		)
		const dayEnd = new Date(
			endeddate.getUTCFullYear(),
			endeddate.getUTCMonth(),
			endeddate.getUTCDay(),
			0,
			0,
			0
		)

		return await getMongoRepository(WinningSequence).find({
			cache: true,
			where: {
				$and: [{ createdAt: { $gt: dayStart, $lt: dayEnd } }],
				deletedAt: null
			}
		})
	}

	@Mutation()
	async deleteWinningSequence(@Args('_id') _id: string): Promise<boolean> {
		const winningSequence = await getMongoRepository(WinningSequence).findOne({
			_id
		})

		if (!winningSequence) {
			throw new NotFoundException('winningSequence not found')
		}
		winningSequence.deletedAt = new Date(Date.now())

		const updateWinningSequnece = await getMongoRepository(
			WinningSequence
		).findOneAndUpdate(
			{ _id: winningSequence._id },
			{ $set: winningSequence },
			{ returnOriginal: false }
		)
		return updateWinningSequnece ? true : false
	}

	@Mutation()
	async updateWinningSequence(
		@Args('_id') _id: string,
		@Args('input') input: UpdateWinningSequenceInput
	): Promise<boolean> {
		try {
			const winningSequence = await getMongoRepository(WinningSequence).findOne(
				{ _id }
			)

			if (!winningSequence) {
				throw new ForbiddenError('winningSequence not found.')
			}

			const updateWinning = await getMongoRepository(
				WinningSequence
			).findOneAndUpdate({ _id }, { $set: input }, { returnOriginal: false })
			return updateWinning ? true : false
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Query()
	async getWinningStatique(): Promise<Statique> {
		const winningSequnences = await getMongoRepository(WinningSequence).find({
			where: {
				deletedAt: null
			}
		})
		return getStatistique(winningSequnences)
	}
}
