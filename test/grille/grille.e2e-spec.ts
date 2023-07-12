import { Grille } from '@models'
import { INestApplication } from '@nestjs/common'
import { TestingModule, Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AppModule } from 'app.module'
import * as request from 'supertest'
import { AmountOfWalletResolver, AuthResolver, GrilleResolver, PaymentTaxeResolver } from 'resolvers'
import { Repository } from 'typeorm'
import { END_POINT } from '../../src/environments'


describe('GrilleModule (e2e)', () => {
	let app: INestApplication
	let grilleResolver

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
			providers: [
				GrilleResolver,
				{
					provide: getRepositoryToken(Grille),
					useClass: Repository
				},


				AmountOfWalletResolver,
				PaymentTaxeResolver
			]
		}).compile()

		grilleResolver = module.get<GrilleResolver>(GrilleResolver)

		app = module.createNestApplication()
		await app.init()
	})

    it('QUERY › getGrille', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    id: '123'
                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getGrille ($id: ID!) {getGrille(id: $id){_id userId numbers stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price  winningSequenceId } }'
			})
			.expect(200)
	})

    it('QUERY › getGrille without input ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getGrille ($id: ID!) {getGrille(id: $id){_id userId numbers stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price   } }'
			})
			.expect(400)
	})


    it('QUERY › getAllGrilles', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    offSet: 1,
                    limit: 2
                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getAllGrilles ($offSet: Int, $limit: Int ) {getAllGrilles(offSet: $offSet , limit: $limit ){_id userId numbers stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price  winningSequenceId } }'
			})
			.expect(200)
	})

    it('QUERY › getAllGrilles with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    offSet: 1,
                    limit: 2
                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getAllGrilles ($offSet: Int, $limit: Int ) {getAllGrilles(offSet: $offSet , limit: $limit ){_id userId number stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price winningSequenceId  } }'
			})
			.expect(400)
	})

    it('QUERY › getAllGrillesByStatus', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    status: 'PENDING'
                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getAllGrillesByStatus ($status: Status ) {getAllGrillesByStatus(status: $status ){_id userId numbers stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price winningSequenceId  } }'
			})
			.expect(200)
	})


    it('QUERY › getAllGrillesByStatus with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    status: 'PENDING'
                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getAllGrillesByStatus ($status: Status ) {getAllGrillesByStatus(status: $status ){_id userId number stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price winningSequenceId  } }'
			})
			.expect(400)
	})


    it('QUERY › getAllGrillesByUserId', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    userId: '123',
                    offSet: 1,
                    limit: 2

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getAllGrillesByUserId ($userId: ID!, $offSet: Int, $limit: Int ) {getAllGrillesByUserId(userId: $userId , offSet: $offSet, limit: $limit ){_id userId numbers stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price winningSequenceId  } }'
			})
			.expect(200)
	})

    it('QUERY › getAllGrillesByUserId with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    userId: '123',
                    offSet: 1,
                    limit: 2

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getAllGrillesByUserId ($userId: ID!, $offSet: Int, $limit: Int ) {getAllGrillesByUserId(userId: $userId , offSet: $offSet, limit: $limit ){_id userId number stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price   } }'
			})
			.expect(400)
	})

    it('QUERY ›  getGrilleByPaymentStatus', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    paymentStatus: 'PAID',
                    offSet: 1,
                    limit: 2

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getGrilleByPaymentStatus ($paymentStatus: PaymentStatus, $offSet: Int, $limit: Int ) {getGrilleByPaymentStatus(paymentStatus: $paymentStatus , offSet: $offSet, limit: $limit ){_id userId numbers stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price  winningSequenceId } }'
			})
			.expect(200)
	})

    it('QUERY ›  getGrilleByPaymentStatus with bad fields as response ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    paymentStatus: 'PAID',
                    offSet: 1,
                    limit: 2

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getGrilleByPaymentStatus ($paymentStatus: PaymentStatus, $offSet: Int, $limit: Int ) {getGrilleByPaymentStatus(paymentStatus: $paymentStatus , offSet: $offSet, limit: $limit ){_id userId number stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price   } }'
			})
			.expect(400)
	})

    it('QUERY ›  getGrilleByPaymentStatusAndUserId', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    paymentStatus: 'PAID',
                    offSet: 1,
                    limit: 2

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getGrilleByPaymentStatusAndUserId ($paymentStatus: PaymentStatus, $offSet: Int, $limit: Int ) {getGrilleByPaymentStatusAndUserId(paymentStatus: $paymentStatus , offSet: $offSet, limit: $limit ){_id userId numbers stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price winningSequenceId   } }'
			})
			.expect(200)
	})

    it('QUERY ›  getGrilleByPaymentStatusAndUserId with bad fields as response ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    paymentStatus: 'PAID',
                    offSet: 1,
                    limit: 2

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getGrilleByPaymentStatusAndUserId ($paymentStatus: PaymentStatus, $offSet: Int, $limit: Int ) {getGrilleByPaymentStatusAndUserId(paymentStatus: $paymentStatus , offSet: $offSet, limit: $limit ){_id userId number stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price   } }'
			})
			.expect(400)
	})

    it('MUTATION › createGrille', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
                        userId: '123',
						numbers: [1, 2, 3, 4, 5],
						stars : [1, 2],
                        
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation createGrille ($input: CreateGrilleInput!) {createGrille(input:$input) {_id userId numbers stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price winningSequenceId metaData{M75 TVA_CUMM RunpayCost CAG_CUMM benefiet total_ht} winningStars winningNumbers}}'
			})
			.expect(200)
	})

    it('MUTATION › createGrille with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
                        userId: '123',
						numbers: [1, 2, 3, 4, 5],
						stars : [1, 2],
                        drawDate: '2020-01-01',
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation createGrille ($input: CreateGrilleInput!) {createGrille(input:$input) {_id userId number stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price }}'
			})
			.expect(400)
	})

    it('MUTATION › deleteGrille', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					_id: '123'
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation deleteGrille ($_id: ID!) {deleteGrille(_id:$_id)}'
			})
			.expect(200)
	})

    it('MUTATION › deleteGrille without input ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {

				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation deleteGrille ($_id: ID!) {deleteGrille(_id:$_id)}'
			})
			.expect(400)
	})

	it('MUTATION › updateGrille', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					userId: '123',
					input: {
						userId: '123',
						numbers: [1, 2, 3, 4, 5],
						stars : [1, 2],
						status: 'WIN',
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation updateGrille($userId: ID!, $input: UpdateGrilleInput) {updateGrille(userId: $userId, input: $input)}'
			})
			.expect(200)
	})




    it('MUTATION › payGrille', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					id: '123'
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation payGrille ($id: ID!) {payGrille(id:$id){_id userId numbers stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price winningSequenceId }}'
			})
			.expect(200)
	})

	it('MUTATION › payGrille without input ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {

				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation payGrille ($id: ID!) {payGrille(id:$id){_id userId numbers stars createdAt updatedAt deletedAt status paymentStatus randomCode combinations{numbers stars tuniMillionsCode} prise price }}'
			})
			.expect(400)
	})




    afterAll(async () => {
		await app.close()
	})



})