import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { getMongoRepository } from 'typeorm'
import { Grille, PaymentTaxe } from '@models'
import { CagnoteAmount, PaymentStatus, Status } from 'generator/graphql.schema'
import { Inject, forwardRef } from '@nestjs/common'
import { GrilleResolver } from './grille.resolver'
import { TotalCagnoteAmount } from 'utils/helpers/cagnoteAmount'

@Resolver()
export class PaymentTaxeResolver {
	constructor(private httpService: HttpService) {}
	@Query()
	async getMethods() {
		const response = await firstValueFrom(
			this.httpService.get(
				`https://mymillion-elmostathmer.tunimillions.com/wallet/payment_methods`,
				{}
			)
		)

		return response.data.data
	}

	@Mutation()
	async getValuesFromAmount(
		@Args('paymentMethodId') paymentMethodId: number,
		@Args('amount') amount: number,
		@Args('userId') userId: string
	): Promise<PaymentTaxe> {
		const response = await firstValueFrom(
			this.httpService.post(
				`https://mymillion-elmostathmer.tunimillions.com/wallet/ht/${paymentMethodId}/${amount}`,
				{}
			)
		)

		return { ...response.data }
	}

	@Query()
	async getCagnoteAmount(): Promise<CagnoteAmount> {
		const grilles = await getMongoRepository(Grille).find({
			where: {
				status: Status.PENDING,
				paymentStatus: PaymentStatus.PAID,
				deletedAt: null
			}
		})
		const totalCagnoteAmount = TotalCagnoteAmount(grilles)

		return { ...totalCagnoteAmount }
	}
}
