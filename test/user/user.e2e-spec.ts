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

	it('QUERY › me', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{ me {_id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } } }'
			})
			.expect(200)
	})

	it('QUERY › me with bad fields as response ' , () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{ me {_id firstName lastNam resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } } }'
			})
			.expect(400)
	})


	it('QUERY › users', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{ users { _id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt }} }'
			})
			.expect(200)
	})

	it('QUERY › users with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {},
				query:
					// tslint:disable-next-line:max-line-length
					'{ users { _id firstName lastNam resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt }} }'
			})
			.expect(400)
	})


	it('QUERY › searchUsersByDate', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					createdAt: "2000-05-22"
				},
				query:
					// tslint:disable-next-line:max-line-length
					' query searchUsersByDate($createdAt: String) {searchUsersByDate(createdAt: $createdAt) {_id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } }}'
			})
			.expect(200)
	})

	it('QUERY › searchUsersByDate with bad fields as response ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					createdAt: "2000-05-22"
				},
				query:
					// tslint:disable-next-line:max-line-length
					' query searchUsersByDate($createdAt: String) {searchUsersByDate(createdAt: $createdAt) {_id firstName lastNam resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } }}'
			})
			.expect(400)
	})

	it('QUERY › finalizedUsers', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					offset: 1,
					limit: 10
				},
				query:
					// tslint:disable-next-line:max-line-length
					' query finalizedUsers($offset: Int  $limit:Int) {finalizedUsers(offset: $offset, limit: $limit) {_id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } }}'
			})
			.expect(200)
	})

	it('QUERY › finalizedUsers with bad fields as response ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					offset: 1,
					limit: 10
				},
				query:
					// tslint:disable-next-line:max-line-length
					' query finalizedUsers($offset: Int  $limit:Int) {finalizedUsers(offset: $offset, limit: $limit) {_id firstName lastNam resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } }}'
			})
			.expect(400)
	})

	it('QUERY › finalizedUser', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					_id: '123',
					filter:{
						firstName: 'rihab',
						lastName: 'methnani',
					}
				},
				query:
					// tslint:disable-next-line:max-line-length
					' query finalizedUser($_id: ID!, $filter: UserFilterInput) {finalizedUser(_id: $_id, filter: $filter) {_id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt }}}'
			})
			.expect(200)
	})

	it('QUERY › finalizedUser with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					_id: '123',
					filter:{
						firstName: 'rihab',
						lastName: 'methnani',
					}
				},
				query:
					// tslint:disable-next-line:max-line-length
					' query finalizedUser($_id: ID!, $filter: UserFilterInput) {finalizedUser(_id: $_id, filter: $filter) {_id firstName lastNam resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt }}}'
			})
			.expect(400)
	})

	it('QUERY › user', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					_id: '123',
					
				},
				query:
					// tslint:disable-next-line:max-line-length
					' query user($_id: ID!) {user(_id: $_id) {_id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } }}'
			})
			.expect(200)
	})

	it('QUERY › user with bad fields as response', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					_id: '123',
					
				},
				query:
					// tslint:disable-next-line:max-line-length
					' query user($_id: ID!) {user(_id: $_id) {_id firstName lastNam resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } }}'
			})
			.expect(400)
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
					'mutation createUser ($input: CreateUserInput!) {createUser(input:$input) {_id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } }}'
			})
			.expect(200)
	})

	it('MUTATION › createUser with bad fields as response', () => {
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
					'mutation createUser ($input: CreateUserInput!) {createUser(input:$input) {_id firstName lastNam resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } }}'
			})
			.expect(400)
	}) 

	it('MUTATION › updateUser', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: 'updateUser',
                variables: {
                    _id: '19f71290-f017-11ed-95e0-3db9c0341994',
                    input: {
                        firstName: 'Test',
                        lastName: 'Test2',
                        email: 'JhonDaoe@gmail.com',
                        password: 'string',
                        birthDate: 'string',
                        phoneNumber: 'string',
                        address: {
                            city: 'string',
                            town: 'string',
                            postalAddress: 'string'
                        },
                        gender: 'MALE',
                        termsOfUse: true
                    }
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation updateUser ($_id: ID! , $input: UpdateUserInput!) {updateUser(_id: $_id, input:$input) }'
            })
            .expect(200)
    })

	it('MUTATION › updateUser with bad input', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: 'updateUser',
                variables: {
                    _id: '19f71290-f017-11ed-95e0-3db9c0341994',
                    input: {
                        firstName: 'Test',
                        lastName: 'Test2',
                        email: 'JhonDaoe@gmail.com',
                        password: 'string',
                        birthDate: 'string',
                        phoneNumber: 'string',
                        address: {
                            city: 'string',
                            town: 'string',
                            postalAddress: 'string'
                        },
                        gender: 'MALE',
                       
                    }
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation updateUser ($_id: ID! , $input: UpdateUserInput!) {updateUser(_id: $_id, input:$input) }'
            })
            .expect(400)
    })

	it('MUTATION › deleteUser ', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                    _id: '123',
                   
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation deleteUser ($_id: ID! ) {deleteUser(_id: $_id) }'
            })
            .expect(200)
    })

	it('MUTATION › deleteUser without input', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                   
                   
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation deleteUser ($_id: ID! ) {deleteUser(_id: $_id) }'
            })
            .expect(400)
    })


	it('MUTATION › verifyEmail', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                    emailToken:"1111111"
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation verifyEmail ($emailToken: String!) {verifyEmail(emailToken : $emailToken) }'
            })
            .expect(200)
    })

	it('MUTATION › verifyEmail without input ', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                    
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation verifyEmail ($emailToken: String!) {verifyEmail(emailToken : $emailToken) }'
            })
            .expect(400)
    })

	it('MUTATION › login', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                    input:{
						email: "rihab@gmail.com",
						password: "string",
						birthDate: "1999-04-25"

					}
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation login ($input: LoginUserInput!) {login(input : $input){accessToken refreshToken} }'
            })
            .expect(200)
    })

	it('MUTATION › login with bad input', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                    input:{
						email: "rihab@gmail.com",
						password: "string",
						

					}
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation login ($input: LoginUserInput!) {login(input : $input){accessToken refreshToken} }'
            })
            .expect(400)
    })
    

	it('MUTATION › refreshToken', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                    refreshToken:"11111111"
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation refreshToken ($refreshToken: String!) {refreshToken(refreshToken : $refreshToken){accessToken} }'
            })
            .expect(200)
    })

	it('MUTATION › refreshToken without input ', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                   
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation refreshToken ($refreshToken: String!) {refreshToken(refreshToken : $refreshToken){accessToken} }'
            })
            .expect(400)
    })

	it('MUTATION › changePassword', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                    _id:"111",
					currentPassword:"123",
					password:"1234"
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation changePassword ($_id: ID!, $currentPassword: String! , $password: String! ) {changePassword(_id : $_id ,currentPassword: $currentPassword , password: $password) }'
            })
            .expect(200)
    })

	it('MUTATION › changePassword with bad input ', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                    _id:"111",
					currentPassword:"123",
					
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation changePassword ($_id: ID!, $currentPassword: String! , $password: String! ) {changePassword(_id : $_id ,currentPassword: $currentPassword , password: $password) }'
            })
            .expect(400)
    })

	it('MUTATION › forgotPassword without input', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                    
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation forgotPassword ($email: String!) {forgotPassword(email : $email) }'
            })
            .expect(400)
    })

	it('MUTATION › resetPassword', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                    resetPasswordToken:"111111111111",
					password:"123"
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation resetPassword ($resetPasswordToken: String!, $password:String!) {resetPassword(resetPasswordToken : $resetPasswordToken, password : $password) }'
            })
            .expect(200)
    })

	it('MUTATION › resetPassword with bad input', async () => {
        return await request(app.getHttpServer())
            .post(`/${END_POINT}`)
            .send({
                operationName: null,
                variables: {
                    resetPasswordToken:"111111111111",
					 
                },

                query:
                    // tslint:disable-next-line:max-line-length
                    'mutation resetPassword ($resetPasswordToken: String!, $password:String!) {resetPassword(resetPasswordToken : $resetPasswordToken, password : $password) }'
            })
            .expect(400)
    })




	it('MUTATION › addFavorites', () => {
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
					'mutation addFavorites ($input: AddFavoritesInput!) {addFavorites(input:$input) {_id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } }}'
			})
			.expect(200)
	}) 

	it('MUTATION › addFavorites with bad input ', () => {
		return request(app.getHttpServer())
			.post(`/${END_POINT}`)
			.send({
				operationName: null,
				variables: {
					
				},

				query:
					// tslint:disable-next-line:max-line-length
					'mutation addFavorites ($input: AddFavoritesInput!) {addFavorites(input:$input) {_id firstName lastName resetPasswordToken resetPasswordExpires createdAt updatedAt avatar walletId pseudoName secondeName thirdName termsOfUse birthDate phoneNumber fullName isVerified identityVerified isActive ccLast4 deletedAt userLimitationId local {email password} grilles {_id userId Numbers Stars DrawDate createdAt updatedAt deletedAt status randomCode prise  } favorites {numbers stars} gender address{city town postalAddress} userLimitation{_id limit type userId} wallet{_id totalAmount currency inCommingTransactions{transactionId amount currency createdAt} outCommingTransactions{grillId amount currency createdAt } createdAt updatedAt deletedAt } }}'
			})
			.expect(400)
	})

	afterAll(async () => {
		await app.close()
	})
})
