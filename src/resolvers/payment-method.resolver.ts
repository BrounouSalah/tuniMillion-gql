import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql'
import { HttpService } from '@nestjs/axios'
import { map } from 'rxjs/operators'
import { firstValueFrom } from 'rxjs'
import {
	AmountInput,
	PaymentInput,
	PaymentStatusEnum
} from 'generator/graphql.schema'
import { getMongoRepository } from 'typeorm'
import { PaymentMethod } from 'models/payment-method.entity'
import { ForbiddenError } from 'apollo-server-express'
import { NotFoundException } from '@nestjs/common'
import { User } from '@models'
import { stat } from 'fs'

@Resolver()
export class PaymentMethodResolver {
	constructor(private httpService: HttpService) {}

	@Query('getPaymentDetails')
	async getPaymentDetails(@Args('id') id: string) {
		const response = await this.httpService
			.get(`https://psp.paymaster.tn/api/v2/payments/${id}`, {
				headers: {
					Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`
				}
			})
			.pipe(map((response) => response.data))
			.toPromise()
		const details = await getMongoRepository(PaymentMethod).findOne({
			where: { runPayId: id }
		})
		return details
	}

	@Mutation('createPayment')
	async createPayment(
		@Args('PaymentInput') paymentInput: PaymentInput,
		@Context('currentUser') currentUser: User
	) {
		const paymentMethodInput: Partial<PaymentMethod> = {
			...paymentInput,
			invoice: { description: 'payment', params: { BT_USR: currentUser._id } },
			customer: {
				email: currentUser.local.email,
				phone: currentUser.phoneNumber
			},
			paymentData: { paymentMethod: paymentInput.paymentMethod }
		}

		const paymentMethod = await getMongoRepository(PaymentMethod).save(
			new PaymentMethod({
				...paymentMethodInput,
				status: PaymentStatusEnum.Initiated,
				userId: currentUser._id
			})
		)

		const response = await firstValueFrom(
			this.httpService.post(
				'https://psp.paymaster.tn/api/v2/invoices',
				{
					...paymentMethodInput,
					merchantId: process.env.MERCHANT_ID,
					protocol: {
						returnUrl: `https://tunimillions.com/tunimillions/payment/success/${paymentMethod._id}`,
						callbackUrl: `https://tunimillions.com/tunimillions/payment/cancel/${paymentMethod._id}`
					}
				},
				{
					headers: {
						Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`,
						'Content-Type': 'application/json',
						'Idempotency-Key': paymentMethod._id
					}
				}
			)
		)
		console.log('Response Data:', response.data)
		if (response && response.status !== 200)
			throw new ForbiddenError(response.data)

		const res = await getMongoRepository(PaymentMethod).findOneAndUpdate(
			{ _id: paymentMethod._id },
			{
				$set: new PaymentMethod({
					...paymentMethod,
					runPayId: response.data.paymentId,
					status: PaymentStatusEnum.Pending
				})
			},
			{ returnOriginal: false }
		)
		return { id: response.data.paymentId, url: response.data.url }
	}

	@Mutation('completePayment')
	async completePayment(@Args('id') _id: string) {
		const headers = {
			Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		}
		const response = await firstValueFrom(
			this.httpService.put(
				`https://psp.paymaster.tn/api/v2/payments/${_id}/complete`,
				{},
				{ headers }
			)
		)
		console.log('Response Data:', response.data)
		if (response.status === 200) {
			const details = await getMongoRepository(PaymentMethod).findOne({
				where: { runPayId: _id }
			})
			console.log('details', details)
			return details
			//   id: response.data.paymentId,
			//   url: response.data.url,
		}
	}

	@Mutation(() => Boolean)
	async confirmPayment(
		@Args('id') _id: string,
		@Args('amount') amount: AmountInput
	) {
		const headers = {
			Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		}

		const data = {
			paymentId: _id,
			amount
		}
		console.log('data', data)

		const response = await firstValueFrom(
			this.httpService.put(
				`https://psp.paymaster.tn/api/v2/payments/${_id}/confirm`,
				data,
				{ headers }
			)
		)

		// Assuming a successful confirmation is indicated by status 200
		return response.status === 200
	}

	@Mutation(() => Boolean)
	async cancelPayment(@Args('id') _id: string) {
		const headers = {
			Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`,
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'Idempotency-Key': +new Date().toISOString()
		}
		const response = await firstValueFrom(
			this.httpService.put(
				`https://psp.paymaster.tn/api/v2/payments/${_id}/cancel`,
				{},
				{ headers }
			)
		)
		const payment = await getMongoRepository(PaymentMethod).findOne({
			runPayId: _id
		})
		console.log('payment', payment)
		if (!payment) {
			throw new NotFoundException('payment not found')
		}
		payment.deletedAt = new Date(Date.now())
		if (response.status === 200) {
			const updatePayment = await getMongoRepository(
				PaymentMethod
			).findOneAndUpdate(
				{ _id: payment._id },
				{ $set: payment },
				{ returnOriginal: false }
			)
			return updatePayment ? true : false
		}
		if (!response) throw new ForbiddenError('Payment Failed')
	}
}
