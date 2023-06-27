import { AmountOfWallet } from "@models"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { AppModule } from "app.module"
import { AmountOfWalletResolver, AuthResolver } from "resolvers"
import { Repository } from "typeorm"
import * as request from 'supertest'
import { END_POINT } from '../../src/environments'
import { Currency } from "generator/graphql.schema"


describe('WalletModule (e2e)', () => {
	let app: INestApplication
	let amountOfWalletResolver

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
			providers: [
				AmountOfWalletResolver,
				{
					provide: getRepositoryToken(AmountOfWallet),
					useClass: Repository
				},
				
				AuthResolver,
			
			]
		}).compile()

		amountOfWalletResolver = module.get<AmountOfWalletResolver>(AmountOfWalletResolver)

		app = module.createNestApplication()
		await app.init()
	})

    it('QUERY › getWalletById', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                  id:"123"

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getWalletById ($id: ID!) {getWalletById(id: $id ){_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt   } }'
			})
			.expect(200)
	})

    
    it('QUERY › getWalletById without input', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                 

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getWalletById ($id: ID!) {getWalletById(id: $id ){_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt   } }'
			})
			.expect(400)
	})

    it('QUERY › getWalletByUserId', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                  userId:"123"

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getWalletByUserId ($userId: ID!) {getWalletByUserId(userId: $userId ){_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt   } }'
			})
			.expect(200)
	})

    it('QUERY › getWalletByUserId without input ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getWalletByUserId ($userId: ID!) {getWalletByUserId(userId: $userId ){_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt   } }'
			})
			.expect(400)
	})

    it('QUERY › getAllWallets', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{getAllWallets{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt }}'
			})
			.expect(200)
	})

    it('QUERY › getAllWallets with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{getAllWallets{_id totalAmoun currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt }}'
			})
			.expect(400)
	})

    it('MUTATION › createWallet', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
                        userId: "123",
						totalAmount:11.0,
                        currency:Currency.TND
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation createWallet ($input: CreateWalletInput!) {createWallet(input:$input) {_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt }}'
			})
			.expect(200)
	}) 

    it('MUTATION › createWallet without input', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation createWallet ($input: CreateWalletInput!) {createWallet(input:$input) {_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt  }}'
			})
			.expect(400)
	}) 

    it('MUTATION › addAmount', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
                        userId: "123",
						amount:11.0,
                        currency:Currency.TND,
                        transactionId:"123"
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation addAmount ($input: AddAmountInput!) {addAmount(input:$input) {_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt }}'
			})
			.expect(200)
	}) 

    it('MUTATION › addAmount with bad fields as response ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
                        userId: "123",
						amount:11.0,
                        currency:Currency.TND,
                        transactionId:"123"
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation addAmount ($input: AddAmountInput!) {addAmount(input:$input) {_id totalAmoun currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt }}'
			})
			.expect(400)
	}) 

    it('MUTATION › removeAmount', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
                        userId: "123",
						amount:11.0,
                        currency:Currency.TND,
                        grillId:"123"
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation addAremoveAmountmount ($input: RemoveAmountInput!) {removeAmount(input:$input) {_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt }}'
			})
			.expect(200)
	})


    it('MUTATION › removeAmount with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
                        userId: "123",
						amount:11.0,
                        currency:Currency.TND,
                        grillId:"123"
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation addAremoveAmountmount ($input: RemoveAmountInput!) {removeAmount(input:$input) {_id totalAmoun currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt }}'
			})
			.expect(400)
	})

    it('MUTATION › deleteWallet', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					id:"123"
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation deleteWallet ($id: ID!) {deleteWallet(id:$id)}'
			})
			.expect(200)
	}) 

    it('MUTATION › deleteWallet without input', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation deleteWallet ($id: ID!) {deleteWallet(id:$id)}'
			})
			.expect(400)
	})

    afterAll(async () => {
		await app.close()
	})


})