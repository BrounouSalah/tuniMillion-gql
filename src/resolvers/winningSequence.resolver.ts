import { Inject, NotFoundException, forwardRef } from '@nestjs/common'
import { Args, Mutation, Query } from '@nestjs/graphql'
import { ApolloError, ForbiddenError } from 'apollo-server-express'
import {
	CreateWinningSequenceInput,
	PaymentStatus,
	SimulationInput,
	SimulationResponse,
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
import { simulation } from 'utils/helpers/simultation'
import { GetRandomCombination } from 'utils/helpers/getRandomCombination'
import { UserNotificationsResolver } from './userNotifications.resolver'
import { generateToken } from '@auth'
import { sendMail } from '@shared'
import { UserResolver } from './user.resolver'

export class WinningSequenceResolver {
	constructor(
		@Inject(forwardRef(() => GrilleResolver))
		private grilleResolver: GrilleResolver,
		@Inject(forwardRef(() => AmountOfWalletResolver))
		private walletResolver: AmountOfWalletResolver,
		@Inject(forwardRef(() => PaymentTaxeResolver))
		private cagnoteResolver: PaymentTaxeResolver,
		@Inject(forwardRef(() => UserNotificationsResolver))
		private notificationResolver: UserNotificationsResolver,
		@Inject(forwardRef(() => UserResolver))
		private userResolver: UserResolver
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

		const paidGrilles =
			await this.grilleResolver.getGrilleByPaymentStatusAndStatus(
				Status.PENDING,
				PaymentStatus.PAID
			)
		const winningCode = GetRandomCombination(paidGrilles)
		/// this is for updating MyMillion Code user wallet
		//const winningAmout = totalCagnote.totalCAG_CUMM * 0.14
		// const winningCodeWallet = await this.walletResolver.getWalletByUserId(
		// 	winningCode.userId
		// )
		// await getMongoRepository(AmountOfWallet).findOneAndUpdate(
		// 	{ _id: winningCodeWallet._id },
		// 	{
		// 		$set: {
		// 			totalAmount: winningCodeWallet.totalAmount + winningAmout
		// 		}
		// 	},
		// 	{ returnOriginal: false }
		// )
		const winningCod = {
			tunimillionCode: winningCode.winningCode,
			userId: winningCode.userId,
			grilleId: winningCode.grilleId
		}
		const response = await getMongoRepository(WinningSequence).save(
			new WinningSequence({
				...input,
				metaData: totalCagnote,
				winningCode: winningCod
			})
		)

		const jackpotWinners: any[] = []
		const winners: any[] = []
		const losers: any[] = []

		for (const grille of paidGrilles) {
			const result = compareGrille(grille, response)

			// Update the grille's status
			await getMongoRepository(Grille).findOneAndUpdate(
				{ _id: grille._id },
				{ $set: { status: result.grilleStatus } },
				{ returnOriginal: false }
			)

			switch (result.grilleStatus) {
				case Status.JACKPOT:
					jackpotWinners.push(grille)
					break
				case Status.WIN:
					winners.push(grille)
					break
				default:
					losers.push(grille)
					break
			}
		}

		// Process jackpot winners
		if (jackpotWinners.length > 0) {
			const jackpotAmountPerWinner =
				totalCagnote.totalCAG_CUMM / jackpotWinners.length

			for (const grille of jackpotWinners) {
				const result = compareGrille(grille, response)
				await this.updateGrille(
					grille,
					result,
					response,
					jackpotAmountPerWinner
				)
				await this.updateUserWallet(grille.userId, jackpotAmountPerWinner)
				await this.notifyUser(grille.userId)
			}

			// Update other grilles with 0 amount
			for (const grille of [...winners, ...losers]) {
				const result = compareGrille(grille, response)
				await this.updateGrille(grille, result, response, 0)
			}
		} else if (winners.length > 0) {
			// Process regular winners
			for (const grille of winners) {
				const result = compareGrille(grille, response)
				const winningAmount = calculateMoneyAmout(
					totalCagnote.totalCAG_CUMM,
					result.winningNumbers.length,
					result.winningStars.length
				)
				await this.updateGrille(grille, result, response, winningAmount)
				await this.updateUserWallet(grille.userId, winningAmount)
				await this.notifyUser(grille.userId)
			}

			// Update losers with 0 amount
			for (const grille of losers) {
				const result = compareGrille(grille, response)
				await this.updateGrille(grille, result, response, 0)
			}
		} else {
			// No winners or jackpot winners, so just update losers with 0 amount
			for (const grille of losers) {
				const result = compareGrille(grille, response)
				await this.updateGrille(grille, result, response, 0)
			}
		}

		return response
	}
	async updateGrille(
		grille: any,
		result,
		response: any,
		winningAmount: number
	) {
		const data = {
			...grille,
			winningSequenceId: response._id,
			winningNumbers: result.winningNumbers,
			winningStars: result.winningStars,
			status: result.grilleStatus,
			winningPrice: winningAmount
		}

		await getMongoRepository(Grille).findOneAndUpdate(
			{ _id: grille._id },
			{ $set: { ...data } },
			{ returnOriginal: false }
		)
	}
	async updateUserWallet(userId: string, amount: number) {
		console.log('*******', userId)
		const userWallet = await this.walletResolver.getWalletByUserId(userId)
		console.log('wallet*******', userWallet)
		await getMongoRepository(AmountOfWallet).findOneAndUpdate(
			{ _id: userWallet._id },
			{ $set: { totalAmount: userWallet.totalAmount + amount } },
			{ returnOriginal: false }
		)
	}
	async notifyUser(userId: string) {
		const input = {
			title: 'Félicitations! Vous avez gagné sur Tunimillions!',
			message: `Cher(e) gagnant(e),
			Bravo pour votre victoire! Contactez-nous pour réclamer votre prix et continuez à jouer pour plus de chances et de succès.
			"L'équipe Tunimillions".`,
			userId: userId
		}

		await this.notificationResolver.createUserNotification(input)

		const user = await this.userResolver.user(userId)
		const emailToken = await generateToken(user, 'emailToken')
		await sendMail('gagnant', user, emailToken)
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
	@Query()
	async getLastPlayedWinningSequence(): Promise<any> {
		const winningSequnences = await getMongoRepository(WinningSequence).findOne(
			{
				where: {
					deletedAt: null
				},
				order: {
					createdAt: 'DESC'
				}
			}
		)
		return winningSequnences
	}
	@Mutation()
	async getSimulation(
		@Args('input') input: SimulationInput
	): Promise<SimulationResponse> {
		const { numbers, stars } = input
		try {
			const winningSequence = await getMongoRepository(WinningSequence).findOne(
				{
					where: { deletedAt: null },
					order: {
						createdAt: 'DESC'
					}
				}
			)
			console.log(winningSequence)
			if (!winningSequence) {
				throw new ForbiddenError('winningSequence not found.')
			}
			const response = simulation(
				numbers,
				stars,
				winningSequence.metaData.totalCAG_CUMM,
				winningSequence
			)
			return response
		} catch (error) {
			throw new ApolloError(error)
		}
	}
}
