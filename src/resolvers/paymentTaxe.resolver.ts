import {  Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { firstValueFrom } from "rxjs";
import { HttpService } from '@nestjs/axios'




@Resolver()
export class PaymentTaxeResolver {
    constructor(private httpService: HttpService) {}
    @Query()
	async getMethods() {
		
		const response = await firstValueFrom(
			this.httpService.get(
				`https://mymillion-elmostathmer.tunimillions.com/wallet/payment_methods`,
				{},
                
				
			)
		)
       
        return response.data.data
	
	}

    @Mutation()
	async getValuesFromAmount(@Args('paymentMethodId') paymentMethodId: number, @Args('amount') amount: number,@Args('userId') userId: string) {


		
		const response = await firstValueFrom(
			this.httpService.post(
				`https://mymillion-elmostathmer.tunimillions.com/wallet/ht/${paymentMethodId}/${amount}`,
				{},
                
				
			)
		)
       
        return {...response.data, userId: userId}
	
	}

  


}