import { TestingModule, Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AppModule } from '../../src/app.module'
import { AmountOfWalletResolver, GrilleResolver, PaymentMethodResolver, UserLimitationResolver } from '../../src/resolvers'
import { Repository } from 'typeorm'
import { PaymentMethod } from '../../src/models'
import { AxiosResponse } from 'axios'
import { HttpService } from '@nestjs/common'
import { of } from 'rxjs';
const initModule = async ()=> {
    const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        providers: [
            PaymentMethodResolver,
            {
                provide: getRepositoryToken(PaymentMethod),
                useClass: Repository
            },
            {
                provide: HttpService,
                useValue: {
                  get: jest.fn().mockReturnValue(of({
                    "success": true,
                  } as unknown as AxiosResponse)),
                  // You can define other methods and their mock behavior as needed
                },
              },
            
            UserLimitationResolver,
            AmountOfWalletResolver,
            
          
        ]
    }).compile()
    return module
}
describe('testing paymentMethod compareValues', () => {
	it('test compareValues when reste is null and montantPaiement is within limit', async () => {
        const res = await (await initModule())
			.get<PaymentMethodResolver>(PaymentMethodResolver)
            .compareValues(null,5,10) 
            expect(res).toEqual(5)
       
	})

    it('test compareValues when reste is null and montantPaiement exceeds limit', async () => {
        const res = await (await initModule())
			.get<PaymentMethodResolver>(PaymentMethodResolver)
            .compareValues(null,15,10) 
            expect(res).toEqual(-1)
       
	})

    
    it('test compareValues when reste is not null and montantPaiement is within reste', async () => {
        const res = await (await initModule())
			.get<PaymentMethodResolver>(PaymentMethodResolver)
            .compareValues(20,15,10) 
            expect(res).toEqual(5)
       
	})

    it('test compareValues when reste is not null and montantPaiement is exceeds reste', async () => {
        const res = await (await initModule())
			.get<PaymentMethodResolver>(PaymentMethodResolver)
            .compareValues(10,15,10) 
            expect(res).toEqual(-1)
       
	})

})