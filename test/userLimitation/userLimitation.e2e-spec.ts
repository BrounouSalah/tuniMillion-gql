import { UserLimitation } from '@models'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AppModule } from 'app.module'
import { UserLimitationResolver } from 'resolvers'
import { Repository } from 'typeorm'
import * as request from 'supertest'
import { END_POINT } from '../../src/environments'
import { TypeLimit } from 'generator/graphql.schema'



describe('LimitationModule (e2e)', () => {
	let app: INestApplication
	let userLimitationResolver

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
			providers: [
				UserLimitationResolver,
				{
					provide: getRepositoryToken(UserLimitation),
					useClass: Repository
				},


			]
		}).compile()

		userLimitationResolver = module.get<UserLimitationResolver>(UserLimitationResolver)

		app = module.createNestApplication()
		await app.init()
	})

    it('QUERY › getUserLimitation', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                 id: '123'

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getUserLimitation ($id: ID!) {getUserLimitation(id: $id ){_id limit type userId  } }'
			})
			.expect(200)
	})

    it('QUERY › getUserLimitation without input', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {


                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getUserLimitation ($id: ID!) {getUserLimitation(id: $id ){_id limit type userId  } }'
			})
			.expect(400)
	})

    it('QUERY › getUserLimitationByUserId', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    userId: '123'

                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getUserLimitationByUserId ($userId: ID!) {getUserLimitationByUserId(userId: $userId ){_id limit type userId  } }'
			})
			.expect(200)
	})


    it('QUERY › getUserLimitationByUserId without input', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {


                },
				query:
					// tslint:disable-next-line:max-line-length
					'query getUserLimitationByUserId ($userId: ID!) {getUserLimitationByUserId(userId: $userId ){_id limit type userId  } }'
			})
			.expect(400)
	})

    it('QUERY › getAllUserLimitations', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{getAllUserLimitations{_id limit type userId  } }'
			})
			.expect(200)
	})

    it('QUERY › getAllUserLimitations with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{getAllUserLimitations{_id limi type userId  } }'
			})
			.expect(400)
	})

    it('MUTATION › createUserLimitation', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
                        userId: '123',
						limit: 10.0
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation createUserLimitation ($input: CreateUserLimitationInput!) {createUserLimitation(input:$input) {_id limit type userId  }}'
			})
			.expect(200)
	})

    it('MUTATION › createUserLimitation with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
                        userId: '123',
						limit: 10.0
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation createUserLimitation ($input: CreateUserLimitationInput!) {createUserLimitation(input:$input) {_id limi type userId  }}'
			})
			.expect(400)
	})


    it('MUTATION › updateUserLimitation', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    id: '123',
					input: {

						limit: 10.0,
                        type: TypeLimit.SEMAINE,
                        rest: 5
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation updateUserLimitation ($id:ID! , $input: UpdateUserLimitationInput!) {updateUserLimitation(id: $id, input:$input)}'
			})
			.expect(200)
	})

    it('MUTATION › updateUserLimitation with bad input', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {

					input: {

						limit: 10.0,
                        type: TypeLimit.SEMAINE,
                        rest: 5
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation updateUserLimitation ($id:ID! , $input: UpdateUserLimitationInput!) {updateUserLimitation(id: $id, input:$input)}'
			})
			.expect(400)
	})

    it('MUTATION › deleteUserLimitation', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
                    id: '123',

				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation deleteUserLimitation ($id:ID! ) {deleteUserLimitation(id: $id)}'
			})
			.expect(200)
	})

    it('MUTATION › deleteUserLimitation without input ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {

				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation deleteUserLimitation ($id:ID! ) {deleteUserLimitation(id: $id)}'
			})
			.expect(400)
	})

})