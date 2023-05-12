import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { HttpService } from '@nestjs/axios'
import { map, firstValueFrom } from 'rxjs/operators'

@Resolver()
export class PaymentMethodResolver {
	constructor(private httpService: HttpService) {}

	@Query('getPaymentDetails')
	async getPaymentDetails(@Args('id') id: string) {
		const response = await this.httpService
			.get(`https://psp.paymaster.tn/api/v2/payments/${id}`, {
				headers: {
					Authorization: 'Bearer QdvdwiXKFm='
				}
			})
			.pipe(map((response) => response.data))
			.toPromise()

		return response
	}

	@Mutation('createPayment')
	async createPayment(@Args('paymentInput') paymentInput: any) {
		const response = await this.httpService
			.post('https://psp.paymaster.tn/api/v2/invoices', paymentInput, {
				headers: {
					Authorization: 'Bearer QdvdwiXKFm=',
					'Content-Type': 'application/json'
				}
			})
			.pipe(map((response) => response.data))
			.toPromise()

		return response
	}

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
