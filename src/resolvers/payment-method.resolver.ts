import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { HttpService } from '@nestjs/axios'
import { map } from 'rxjs/operators'
import { firstValueFrom } from 'rxjs';
import { AmountInput , PaymentInput } from 'generator/graphql.schema';
import {  getMongoRepository } from 'typeorm';
import { PaymentMethod } from 'models/payment-method.entity';
import { ForbiddenError } from 'apollo-server-express';
import { NotFoundException } from '@nestjs/common';


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
			const details=await getMongoRepository (PaymentMethod).findOne({where: {runPayId:id }})
		return details
	}

	@Mutation('createPayment')
	async createPayment(@Args('PaymentInput') PaymentInput: PaymentInput ){
	
		console.log("PaymentInput" , PaymentInput)
		const response = await firstValueFrom(
			this.httpService
			.post('https://psp.paymaster.tn/api/v2/invoices', {...PaymentInput,merchantId:process.env.MERCHANT_ID}, {
				headers: {
					Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`,
					'Content-Type': 'application/json',
					'Idempotency-Key': new Date().toISOString()
				}
			})
		) 
			if (response) {
				const res = await getMongoRepository (PaymentMethod).save(new PaymentMethod({...PaymentInput,runPayId:response.data.paymentId }))
				return({ id :response.data.paymentId , url:response.data.url})
			}
			if(!response) throw new ForbiddenError("Payment Failed")
	}



	@Mutation('completePayment')
	async completePayment(@Args('id') _id: string ) {
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
		console.log('Response Data:', response.data);
		if (response.status === 200 ) {
			const details=await getMongoRepository (PaymentMethod).findOne({where: {runPayId:_id }})
			console.log("details",details)
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
			amount: amount
		}
		console.log("data",data)

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
		const payment = await getMongoRepository (PaymentMethod).findOne({runPayId:_id})
		console.log("payment",payment)
		if (!payment) 
		{
		 throw new NotFoundException('payment not found');
		}
		payment.deletedAt = new Date(Date.now())
		if (response.status === 200) {
		const updatePayment = await getMongoRepository(PaymentMethod).findOneAndUpdate(
		 { _id:payment._id },
		 { $set: payment },
		 { returnOriginal: false }
		
	 )
		return updatePayment ? true : false
		}
		if(!response) throw new ForbiddenError("Payment Failed")
	}
}
