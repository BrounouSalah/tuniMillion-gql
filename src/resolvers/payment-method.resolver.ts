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
import { Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { UserLimitationResolver } from './userLimitation.resolver';
import { User, UserLimitation } from '@models';
import { update } from 'lodash'

@Resolver()
export class PaymentMethodResolver {
	
	constructor(private httpService: HttpService,
		@Inject(forwardRef(() => UserLimitationResolver))
		private userLimitation: UserLimitationResolver
) {}
	

	@Query('getPaymentDetails')
	async getPaymentDetails(@Args('id') id: string) {
		
		const runPayResponse = await this.httpService
			.get(`https://psp.paymaster.tn/api/v2/payments/${id}`, {
				headers: {
					Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`
				}
			})
			.pipe(map((runPayResponse) => runPayResponse.data))
			.toPromise()
		const paymentMethodResult = await getMongoRepository(PaymentMethod).findOne({
			where: { runPayId: id }
		})
	

		const userLimitation=await this.userLimitation.getUserLimitationByUserId(paymentMethodResult.userId)
		const reste: number | null = userLimitation.rest;
        const limit: number = userLimitation.limit;
		const montantPaiement: number= paymentMethodResult.amount.value
		const newRest = this.compareValues(reste, montantPaiement, limit);

		const runPayResult=runPayResponse
		if (paymentMethodResult.resultCode!=null){
			return paymentMethodResult
		}else{
			 
		
		const updatedPaymentMethod = {...paymentMethodResult, ...runPayResult}
	
		 await getMongoRepository(PaymentMethod).findOneAndUpdate(
			{ _id: updatedPaymentMethod._id },
			{
				$set: new PaymentMethod({...updatedPaymentMethod})
			},
			{ returnOriginal: false }
		)
		

		if (updatedPaymentMethod.resultCode === PaymentStatusEnum.Success || updatedPaymentMethod.status == PaymentStatusEnum.Success) {
			
			await getMongoRepository(UserLimitation).findOneAndUpdate(
		  { _id: userLimitation._id },
	 		  { $set: { rest: newRest } },
	 		  { returnOriginal: false }
	 		);
		}
	
	
		return updatedPaymentMethod
		}
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

		const userLimitation=await this.userLimitation.getUserLimitationByUserId(currentUser._id)
		const reste: number | null = userLimitation.rest;
        const limit: number = userLimitation.limit;
		const montantPaiement: number= paymentInput.amount.value
		
		
		const newRest = this.compareValues(reste, montantPaiement, limit);
		console.log("resultat",newRest)
		if (newRest <0 ) {
			throw new ForbiddenError('Your payment amount exceeded the limit your can only play with '+reste+' TND');
		  } else {
			console.log("paymentMethod:", paymentMethodInput)
			let runPayResponse
			try{
				 runPayResponse = await firstValueFrom(
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
			}catch(e){
				console.log((e.response))
			}
			
			console.log('Response Data:', runPayResponse.data)
			if (runPayResponse && runPayResponse.status !== 200)
				throw new ForbiddenError(runPayResponse.data)
	
			const updatePaymentMethod = await getMongoRepository(PaymentMethod).findOneAndUpdate(
				{ _id: paymentMethod._id },
				{
					$set: new PaymentMethod({
						...paymentMethod,
						runPayId: runPayResponse.data.paymentId,
						status: PaymentStatusEnum.Pending
					})
				},
				{ returnOriginal: false }
			)
			console.log('updatePaymentMethod:', updatePaymentMethod)
			
			return { id: runPayResponse.data.paymentId, url: runPayResponse.data.url }
			
		  }
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

	
		}
	}

	// @Mutation(() => Boolean)
	// async confirmPayment(
	// 	@Args('id') _id: string,
	// 	@Args('amount') amount: AmountInput
	// ) {
	// 	const headers = {
	// 		Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`,
	// 		'Content-Type': 'application/json',
	// 		Accept: 'application/json'
	// 	}

	// 	const data = {
	// 		paymentId: _id,
	// 		amount
	// 	}
	// 	console.log('data', data)

	// 	const response = await firstValueFrom(
	// 		this.httpService.put(
	// 			`https://psp.paymaster.tn/api/v2/payments/${_id}/confirm`,
	// 			data,
	// 			{ headers }
	// 		)
	// 	)
	// 	//add test on the response if it is successfull and we can retrieve the payment details 
	// 	if (response) {
	// 		await getMongoRepository(UserLimitation).findOneAndUpdate(
	// 		  { userId: currentUser._id },
	// 		  { $set: { rest: resultat } },
	// 		  { returnOriginal: false }
	// 		);
	// 	  }
	// 	// Assuming a successful confirmation is indicated by status 200
	// 	return response.status === 200
	// }

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

	compareValues(reste: number | null, montantPaiement: number, limit:number){
		
		if (reste === null) {
			if (montantPaiement > limit){
				return -1;
			}
			return limit - montantPaiement;
		  } else {
			if (montantPaiement > reste){
				return -1;
			}
			return reste - montantPaiement;
		  }
  }
  
}
