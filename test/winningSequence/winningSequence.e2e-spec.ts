import { END_POINT } from '../../src/environments'
import { WinningSequence } from "@models"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { AppModule } from "app.module"
import * as request from 'supertest'
import { AmountOfWalletResolver, AuthResolver, GrilleResolver, WinningSequenceResolver } from "resolvers"
import { Repository } from "typeorm"

describe('WinningSequenceModule (e2e)', () => {
	let app: INestApplication
	let winningSequenceResolver

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
			providers: [
				WinningSequenceResolver,
				{
					provide: getRepositoryToken(WinningSequence),
					useClass: Repository
				},
				
				AuthResolver,
				GrilleResolver,
                AmountOfWalletResolver
			]
		}).compile()

		winningSequenceResolver = module.get<WinningSequenceResolver>(WinningSequenceResolver)

		app = module.createNestApplication()
		await app.init()
	})

    it('QUERY › getAllWinningSequences', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{ getAllWinningSequences {_id numbers stars createdAt updatedAt deletedAt userContsByRang{rank count} } }'
			})
			.expect(200)
	})

    it('QUERY › getAllWinningSequences with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{ getAllWinningSequences {_id number stars createdAt updatedAt deletedAt userContsByRang{rank count} } }'
			})
			.expect(400)
	})

    it('QUERY › getAllWinningSequencesByDate', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    createdAt:"1999-04-25"
                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getAllWinningSequencesByDate ($createdAt: String ) {getAllWinningSequencesByDate(createdAt: $createdAt ){_id numbers stars createdAt updatedAt deletedAt userContsByRang{rank count}   } }'
			})
			.expect(200)
	})

    
    it('QUERY › getAllWinningSequencesByDate with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    createdAt:"1999-04-25"
                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getAllWinningSequencesByDate ($createdAt: String ) {getAllWinningSequencesByDate(createdAt: $createdAt ){_id number stars createdAt updatedAt deletedAt userContsByRang{rank count}   } }'
			})
			.expect(400)
	})

    it('QUERY › getAllWinningSequencesByRange', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    startedAt:"2022-05-12",
                    endedAt:"2022-04-12"

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getAllWinningSequencesByRange ($startedAt: String , $endedAt: String ) {getAllWinningSequencesByRange(startedAt: $startedAt, endedAt: $endedAt ){_id numbers stars createdAt updatedAt deletedAt userContsByRang{rank count}   } }'
			})
			.expect(200)
	})


    it('QUERY › getAllWinningSequencesByRange with bad fields as response ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    startedAt:"2022-05-12",
                    endedAt:"2022-04-12"

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getAllWinningSequencesByRange ($startedAt: String , $endedAt: String ) {getAllWinningSequencesByRange(startedAt: $startedAt, endedAt: $endedAt ){_id number stars createdAt updatedAt deletedAt userContsByRang{rank count}   } }'
			})
			.expect(400)
	})

    it('QUERY › getWinningSequneceById', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                  _id:"123"

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getWinningSequneceById ($_id: ID!) {getWinningSequneceById(_id: $_id ){_id numbers stars createdAt updatedAt deletedAt userContsByRang{rank count}   } }'
			})
			.expect(200)
	})

    it('QUERY › getWinningSequneceById without input', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                 

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getWinningSequneceById ($_id: ID!) {getWinningSequneceById(_id: $_id ){_id numbers stars createdAt updatedAt deletedAt userContsByRang{rank count}   } }'
			})
			.expect(400)
	})

    it('QUERY › getStaticWinningSequence', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                  _id:"123"

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getStaticWinningSequence ($_id: ID!) {getStaticWinningSequence(_id: $_id ){_id numbers stars createdAt updatedAt deletedAt userContsByRang{rank count}   } }'
			})
			.expect(200)
	})


    it('QUERY › getStaticWinningSequence without input', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                  

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getStaticWinningSequence ($_id: ID!) {getStaticWinningSequence(_id: $_id ){_id numbers stars createdAt updatedAt deletedAt userContsByRang{rank count}   } }'
			})
			.expect(400)
	})

    it('MUTATION › createWinningSequence', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
                       
						numbers: [1, 2, 3, 4, 5],
						stars : [1, 2],
                        
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation createWinningSequence ($input: CreateWinningSequenceInput!) {createWinningSequence(input:$input) {_id numbers stars createdAt updatedAt deletedAt userContsByRang{rank count} }}'
			})
			.expect(200)
	}) 

    it('MUTATION › createWinningSequence with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
                       
						numbers: [1, 2, 3, 4, 5],
						stars : [1, 2],
                        
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation createWinningSequence ($input: CreateWinningSequenceInput!) {createWinningSequence(input:$input) {_id number stars createdAt updatedAt deletedAt userContsByRang{rank count} }}'
			})
			.expect(400)
	}) 

    it('MUTATION › deleteWinningSequence', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					_id:"123"
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation deleteWinningSequence ($_id: ID!) {deleteWinningSequence(_id:$_id)}'
			})
			.expect(200)
	}) 

    it('MUTATION › deleteWinningSequence without input', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation deleteWinningSequence ($_id: ID!) {deleteWinningSequence(_id:$_id)}'
			})
			.expect(400)
	}) 

    it('MUTATION › updateWinningSequence', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					_id:"123",
					input:{
						numbers: [1, 2, 3, 4, 5],
						stars : [1, 2],
					
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation updateWinningSequence($_id: ID!, $input: UpdateWinningSequenceInput) {updateWinningSequence(_id: $_id, input: $input)}'
			})
			.expect(200)
	}) 

    
    it('MUTATION › updateWinningSequence with bad input ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					
					input:{
						numbers: [1, 2, 3, 4, 5],
						stars : [1, 2],
					
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation updateWinningSequence($_id: ID!, $input: UpdateWinningSequenceInput) {updateWinningSequence(_id: $_id, input: $input)}'
			})
			.expect(400)
	}) 





    afterAll(async () => {
		await app.close()
	})
})
