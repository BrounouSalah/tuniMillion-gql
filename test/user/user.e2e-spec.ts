import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User, Email, File } from '../../src/models'

import { AppModule } from '../../src/app.module'

import { UserResolver } from '../../src/resolvers/user.resolver'
import { EmailResolver } from '../../src/resolvers/email.resolver'
import { FileResolver } from '../../src/resolvers/file.resolver'
import { AuthResolver } from '../../src/resolvers/auth.resolver'

import { END_POINT } from '../../src/environments'
import {
	AmountOfWalletResolver,
	GrilleResolver,
	UserLimitationResolver
} from '../../src/resolvers'

describe('UserModule (e2e)', () => {
	let app: INestApplication
	let userResolver

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
			providers: [
				UserResolver,
				{
					provide: getRepositoryToken(User),
					useClass: Repository
				},
				EmailResolver,
				{
					provide: getRepositoryToken(Email),
					useClass: Repository
				},
				FileResolver,
				{
					provide: getRepositoryToken(File),
					useClass: Repository
				},
				AuthResolver,
				GrilleResolver,
				UserLimitationResolver,
				AmountOfWalletResolver
			]
		}).compile()

		userResolver = module.get<UserResolver>(UserResolver)

		app = module.createNestApplication()
		await app.init()
	})

	it('QUERY › users', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{ users { _id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt } }'
			})
			.expect(200)
	})
	it('QUERY › me', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{ me { _id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt } }'
			})
			.expect(200)
	})
	it('MUTATION › createUser', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					input: {
						firstName: 'John',
						lastName: 'Doe',
						email: 'JhonDaoe@gmail.com',
						password: 'string',
						birthDate: 'string',
						phoneNumber: 'string',
						address: { city: 'string', town: 'string', postalAddress: 'string' }
					}
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation createUser ($input: CreateUserInput!) {createUser(input:$input) {_id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt}}'
			})
			.expect(200)
	})
	afterAll(async () => {
		await app.close()
	})
})
