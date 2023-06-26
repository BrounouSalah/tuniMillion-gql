import { PaymentMethod } from "@models"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { AppModule } from "app.module"
import { AmountOfWalletResolver, AuthResolver, GrilleResolver, PaymentMethodResolver, UserLimitationResolver, UserResolver } from "resolvers"
import { Repository } from "typeorm"
import * as request from 'supertest'
import { END_POINT } from '../../src/environments'
import { HttpService } from "@nestjs/axios"
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';


describe('PaymentModule (e2e)', () => {
	let app: INestApplication
	let paymentMethodResolver
  
	beforeEach(async () => {
  
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
                        "id": "12769",
                        "created":"2021-09-01T08:20:00Z",
                        "testMode": false,
                        "status": "Confirmation",
                        "resultCode": "Success",
                        "merchantId": "96e809e9-8bce-40fd-86cb-d34db39b4668",
                        "amount": {
                          "value": 10.5000,
                          "currency": "TND"
                        },
                        "invoice": {
                          "description": "test payment",
                          "params": {
                            "BT_USR": "34"
                          }
                        },
                        "paymentData": {
                          "paymentMethod": "BankCard"
                        },
                        "confirmation": {
                          "type": "ThreeDSv1",
                          "acsUrl": "https://psp.paymaster.tn/acs/pareq",
                          "PAReq": "eJxVUtuO0...v4BOrji7g=="
                        }
                      } as unknown as AxiosResponse)),
                      // You can define other methods and their mock behavior as needed
                    },
                  },
				UserLimitationResolver,
                AmountOfWalletResolver,
                
                
			]
		}).compile()

		paymentMethodResolver = module.get<PaymentMethodResolver>(PaymentMethodResolver)

		app = module.createNestApplication()
		await app.init()
	})

    // it('QUERY › getPaymentDetails', () => {
	// 	return request(app.getHttpServer())
	// 		.post(`/${END_POINT}`)
	// 		.send({
	// 			operationName: null,
	// 			variables: {
    //              id:"123"

    //             },
	// 			query:
	// 				// tslint:disable-next-line:max-line-length
	// 				'query getPaymentDetails ($id: String!) {getPaymentDetails(id: $id ){id }'
	// 		})
	// 		.expect(200)
	// })

    it('QUERY › getPaymentDetails without input', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'query getPaymentDetails ($id: String!) {getPaymentDetails(id: $id ){id created status merchantId amount{value currency} invoice{description params} paymentData{paymentMethod} resultCode  } }'
			})
			.expect(400)
	})

    afterAll(async () => {
		await app.close()
	})

})
