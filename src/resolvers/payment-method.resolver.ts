import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { HttpService } from '@nestjs/axios'
import { map } from 'rxjs/operators'
import { firstValueFrom } from 'rxjs';
import { AmountInput , PaymentInput } from 'generator/graphql.schema';


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

		return response
	}

	@Mutation('createPayment')
	async createPayment(@Args('PaymentInput') PaymentInput: PaymentInput) {
	
		console.log("PaymentInput" , PaymentInput)
		const response = await firstValueFrom(
			this.httpService
			.post('https://psp.paymaster.tn/api/v2/invoices', {...PaymentInput,merchantId:process.env.MERCHANT_ID}, {
				headers: {
					Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`,
					'Content-Type': 'application/json',
					'Idempotency-Key': +new Date().toISOString()
				}
			})
		) 
	
			console.log(response.data)
		return {id:response.data.paymentId,url:response.data.url}
	}

	// @Mutation('createPayment')
	// async createPayment(@Args('paymentInput') paymentInput: any) {
	//   try {
	// 	const response = await this.httpService
	// 	  .post('https://psp.paymaster.tn/api/v2/invoices', paymentInput, {
	// 		headers: {
	// 		  Authorization: `Bearer QdvdwiXKFm=`,
	// 		  'Content-Type': 'application/json',
	// 		  'Idempotency-Key': '86cf125c',
	// 		},
	// 	  })
	// 	  .toPromise();
	
	// 	if (response.data && response.data.url) {
	// 	  return {
	// 		id: response.data.paymentId,
	// 		url: response.data.url,
	// 	  };
	// 	} else {
	// 	  console.error('Invalid response:', response.data);
	// 	  throw new HttpException(
	// 		'Failed to create payment',
	// 		HttpStatus.INTERNAL_SERVER_ERROR,
	// 	  );
	// 	}
	//   } catch (error) {
	// 	console.error('API request error:', error);
	// 	throw new HttpException(
	// 	  'Failed to create payment',
	// 	  HttpStatus.INTERNAL_SERVER_ERROR,
	// 	);
	//   }
	// }
	


	@Mutation('completePayment')
	async completePayment(@Args('id') id: string) {
		const headers = {
			Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		}

		const response = await firstValueFrom(
			this.httpService.post(
				`https://psp.paymaster.tn/api/v2/payments/${id}/complete`,
				{},
				{ headers }
			)
		)

		// Assuming a successful completion is indicated by status 200
		return response.status === 200
	}
	@Mutation(() => Boolean)
	async confirmPayment(
		@Args('id') id: string,
		@Args('amount') amount: AmountInput
	) {
		const headers = {
			Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		}

		const data = {
			paymentId: id,
			amount: amount
		}

		const response = await firstValueFrom(
			this.httpService.post(
				'https://psp.paymaster.tn/api/v2/payments/confirm',
				data,
				{ headers }
			)
		)

		// Assuming a successful confirmation is indicated by status 200
		return response.status === 200
	}

	@Mutation(() => Boolean)
	async cancelPayment(@Args('id') id: string) {
		const headers = {
			Authorization: `Bearer ${process.env.PAYMASTER_TOKEN}`,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		}

		const response = await firstValueFrom(
			this.httpService.post(
				`https://psp.paymaster.tn/api/v2/payments/${id}/cancel`,
				{},
				{ headers }
			)
		)

		// Assuming a successful cancellation is indicated by status 200
		return response.status === 200
	}
}
