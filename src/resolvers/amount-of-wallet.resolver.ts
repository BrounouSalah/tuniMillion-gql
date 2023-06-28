import { User } from '@models'
import { Args, Context, Mutation, Query } from '@nestjs/graphql'
import { CreateWalletInput, AddAmountInput } from 'generator/graphql.schema'
import { getMongoRepository } from 'typeorm'
import { AmountOfWallet } from 'models/amount-of-wallet.entity'
import { ForbiddenError } from 'apollo-server-express'
import { NotFoundException } from '@nestjs/common'
import { RemoveAmountInput } from 'generator/graphql.schema'

export class AmountOfWalletResolver {
	@Mutation()
	async createWallet(
		@Args('input') input: CreateWalletInput
	): Promise<AmountOfWallet> {
		const { userId } = input

		const existingWallet = await getMongoRepository(AmountOfWallet).findOne({
			userId,
			deletedAt: null
		})
		console.log('existingWallet', existingWallet)

		if (existingWallet) {
			return existingWallet
		} else {
			input.userId = userId
			const res = await getMongoRepository(AmountOfWallet).save(
				new AmountOfWallet({ ...input })
			)
			return res
		}
	}

	@Mutation()
	async addAmount(
		@Args('input') input: AddAmountInput
	): Promise<AmountOfWallet> {
		const { userId, transactionId, amount } = input
		const wallet = await getMongoRepository(AmountOfWallet).findOne({
			userId,
			deletedAt: null
		})

		if (!wallet) {
			throw new ForbiddenError('wallet not found.')
		}
		const isNewTransactionIn = wallet.inCommingTransactions.find(
			(inCommingTransaction) =>
				inCommingTransaction.transactionId === input.transactionId
		)
		console.log('isNewTransactionIn', !isNewTransactionIn)
		if (isNewTransactionIn) {
			throw new ForbiddenError('transaction already added.')
		}
		wallet.totalAmount += amount
		const inCommingTransactions = wallet.inCommingTransactions.push({
			amount: input.amount,
			transactionId: input.transactionId,
			createdAt: new Date(),
			currency: input.currency
		})
		const updatedWallet = await getMongoRepository(
			AmountOfWallet
		).findOneAndUpdate(
			{ userId: wallet.userId },
			{
				$set: {
					totalAmount: wallet.totalAmount,
					inCommingTransactions: wallet.inCommingTransactions
				}
			},
			{ returnOriginal: false }
		)
		return wallet
	}

	@Mutation()
	async removeAmount(
		@Args('input') input: RemoveAmountInput
	): Promise<AmountOfWallet> {
		const { userId, amount } = input
		const wallet = await getMongoRepository(AmountOfWallet).findOne({
			userId,
			deletedAt: null
		})

		if (!wallet) {
			throw new ForbiddenError('wallet not found.')
		}
		const isNewTransactionOut = wallet.outGoingTransactions.find(
			(outGoingTransaction) => outGoingTransaction.grillId === input.grillId
		)
		console.log('isNewTransactionOut', !isNewTransactionOut)
		if (isNewTransactionOut) {
			throw new ForbiddenError('transactionOut already added.')
		}
		// wallet.totalAmount -= amount

		const updatedTotalAmount = wallet.totalAmount - amount

		if (updatedTotalAmount < 0) {
			throw new ForbiddenError('Insufficient funds.')
		}
		const outGoingTransactions = [
			...wallet.outGoingTransactions,
			{
				amount: input.amount,
				grillId: input.grillId,
				createdAt: new Date(),
				currency: input.currency
			}
		]

		const updatedWallet = await getMongoRepository(
			AmountOfWallet
		).findOneAndUpdate(
			{ userId: wallet.userId },
			{ $set: { totalAmount: updatedTotalAmount, outGoingTransactions } },
			{ returnOriginal: false }
		)
		return updatedWallet.value
	}

	@Mutation()
	async deleteWallet(@Args('id') id: string): Promise<boolean> {
		const wallet = await getMongoRepository(AmountOfWallet).findOne({ _id: id })

		if (!wallet) {
			throw new NotFoundException('wallet not found')
		}
		wallet.deletedAt = new Date(Date.now())

		const updateWallet = await getMongoRepository(
			AmountOfWallet
		).findOneAndUpdate(
			{ _id: wallet._id },
			{ $set: wallet },
			{ returnOriginal: false }
		)
		return updateWallet ? true : false
	}

	@Query()
	async getWalletById(@Args('id') id: string): Promise<AmountOfWallet> {
		const wallet = await getMongoRepository(AmountOfWallet).findOne({
			where: {
				_id: id,
				deletedAt: null
			}
		})
		return wallet
	}

	@Query()
	async getWalletByUserId(
		@Args('userId') userId: string
	): Promise<AmountOfWallet> {
		return await getMongoRepository(AmountOfWallet).findOne({
			where: { userId, deletedAt: null }
		})
	}

	@Query()
	async getAllWallets(): Promise<AmountOfWallet[]> {
		const wallet = await getMongoRepository(AmountOfWallet).find({
			where: {
				deletedAt: null
			}
		})

		return wallet
	}
}
