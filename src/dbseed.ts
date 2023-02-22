import { MongoClient } from 'mongodb'

import { MONGO_URL, MONGO_DB } from './environments'

async function main() {
	console.log('🚀  Server ready')

	const url = MONGO_URL!

	const dbName = MONGO_DB!

	const client = new MongoClient(url, {
		useUnifiedTopology: true
	})

	try {
		await client.connect()

		console.log('🌱  Database seeder is running')

		const db = client.db(dbName)

		// const tests = [...Array(10000).keys()].map(item => ({
		// 	_id: item,
		// 	userId: 'c30c0730-be4f-11e9-9f04-f72d443f7ef2',
		// 	description: 'test' + item,
		// 	createdAt: new Date(),
		// 	updatedAt: new Date()
		// }))

		// await db.collection('history').insertMany(tests)

		const users = [
			{
				_id: 'ffbdd890-f8bd-11e9-9806-8b914d623ae9',
				firstName: 'Chin',
				lastName: 'Trinh',
				gender: 'MALE',
				google: {
					_id: '107178666920276184612',
					email: 'trinhchinchin@gmail.com'
				}
			},
			{
				_id: 'd9dacf10-edb5-11e9-ba96-217967694746',
				firstName: 'Chin Chin',
				lastName: 'Trinh',
				gender: 'MALE',
				local: {
					email: 'nhocpo.juzo@gmail.com',
					password:
						'$2b$10$fcew2jC4VYtB1/tz/L6sA.pTxkqmjL2t7eXQzU19kr.mMnkhGpjsS'
				}
			},
			{
				_id: '964879b0-ee4f-11e9-8659-0d1c206c3c76',
				firstName: 'Hung',
				lastName: 'Luu',
				gender: 'MALE',
				local: {
					email: 'luuvinhhung159@gmail.com',
					password:
						'$2b$10$fcew2jC4VYtB1/tz/L6sA.pTxkqmjL2t7eXQzU19kr.mMnkhGpjsS'
				}
			},
			{
				_id: '284b98b0-0ab6-11ea-8f2a-3967714b286f',
				firstName: 'Hieu',
				lastName: 'Tran',
				gender: 'MALE',
				local: {
					email: 'hieuhutieu98@gmail.com',
					password:
						'$2b$10$fcew2jC4VYtB1/tz/L6sA.pTxkqmjL2t7eXQzU19kr.mMnkhGpjsS'
				}
			},
			{
				_id: 'b0053a50-0a9c-11ea-84d9-2b143e93bb9e',
				firstName: 'Chin',
				lastName: 'Trinh',
				gender: 'MALE',
				local: {
					email: 'trinhchin.innos@gmail.com',
					password:
						'$2b$10$dIYDOSkHYv4lwEEDIdF3aedBDZvKNtsrweQuDyXiwTOIarrwSksBe'
				}
			}
		]

		users.map(async item => {
			await db.collection('users').findOneAndUpdate(
				{ _id: item._id },
				{
					$setOnInsert: {
						_id: item._id
					},
					$set: {
						local: item.local,
						google: item.google,
						firstName: item.firstName,
						lastName: item.lastName,
						gender: item.gender,
						isVerified: true,
						isOnline: false,
						isLocked: false,
						reason: '',
						isActive: true,
						type: 'BASIC',
						createdAt: +new Date(),
						updatedAt: +new Date()
					}
				},
				{ upsert: true }
			)
		})

		const permissions = [
			{
				_id: 'f1dbbda0-be4d-11e9-bc7c-2117bce2f37c',
				code: 'FORM_READ',
				description: 'Xem biên bản'
			},
			{
				_id: 'ad5a65e0-be4e-11e9-a6ad-c109fb49072b',
				code: 'FORM_CREATE',
				description: 'Tạo biên bản'
			},
			{
				_id: '6ca4ffb0-be4e-11e9-b75c-d915f7b6e00b',
				code: 'FORM_ACCEPT_1ST',
				description: 'Duyệt biên bản lần 1'
			},
			{
				_id: 'a6957510-be4e-11e9-a6ad-c109fb49072b',
				code: 'FORM_ACCEPT_2ND',
				description: 'Duyệt biên bản lần 2'
			}
		]

		permissions.map(async item => {
			await db.collection('permissions').findOneAndUpdate(
				{ code: item.code },
				{
					$setOnInsert: {
						_id: item._id
					},
					$set: {
						code: item.code,
						description: item.description,
						isActive: true,
						createdAt: +new Date(),
						updatedAt: +new Date()
					}
				},
				{ upsert: true }
			)
		})

		const roles = [
			{
				_id: '6d592f10-0aae-11ea-9935-f578ac4d70fd',
				code: 'LT_EMPLOYEE',
				description: 'Nhân viên Lập Trình',
				permissions: ['ad5a65e0-be4e-11e9-a6ad-c109fb49072b']
			},
			{
				_id: 'a0ef0e30-0aae-11ea-9935-f578ac4d70fd',
				code: 'CHA_MANAGER',
				description: 'Trưởng của hàng A',
				permissions: ['6ca4ffb0-be4e-11e9-b75c-d915f7b6e00b']
			},
			{
				_id: 'eb8c01f0-0aae-11ea-9935-f578ac4d70fd',
				code: 'HR',
				description: 'Bộ phận HR',
				permissions: ['f1dbbda0-be4d-11e9-bc7c-2117bce2f37c']
			},
			{
				_id: 'be45e3a0-0aae-11ea-9935-f578ac4d70fd',
				code: 'LT_MANAGER',
				description: 'Trưởng bộ phân Lập Trình',
				permissions: [
					'a6957510-be4e-11e9-a6ad-c109fb49072b',
					'f1dbbda0-be4d-11e9-bc7c-2117bce2f37c'
				]
			}
		]

		roles.map(async item => {
			await db.collection('roles').findOneAndUpdate(
				{ _id: item._id },
				{
					$setOnInsert: {
						_id: item._id
					},
					$set: {
						code: item.code,
						description: item.description,
						isActive: true,
						createdAt: +new Date(),
						updatedAt: +new Date()
					}
				},
				{ upsert: true }
			)
		})

		const userRoles = [
			{
				_id: '43fbcd90-0ab7-11ea-bcbf-675de3f924a3',
				userId: 'd9dacf10-edb5-11e9-ba96-217967694746',
				roleId: 'eb8c01f0-0aae-11ea-9935-f578ac4d70fd'
			},
			{
				_id: '6c6e1cb0-0ab7-11ea-bcbf-675de3f924a3',
				userId: '284b98b0-0ab6-11ea-8f2a-3967714b286f',
				roleId: 'be45e3a0-0aae-11ea-9935-f578ac4d70fd'
			},
			{
				_id: '93e2aae0-0ab7-11ea-bcbf-675de3f924a3',
				userId: 'b0053a50-0a9c-11ea-84d9-2b143e93bb9e',
				roleId: 'a0ef0e30-0aae-11ea-9935-f578ac4d70fd'
			},
			{
				_id: 'b6a48670-0ab7-11ea-bcbf-675de3f924a3',
				userId: '964879b0-ee4f-11e9-8659-0d1c206c3c76',
				roleId: '6d592f10-0aae-11ea-9935-f578ac4d70fd'
			}
		]

		userRoles.map(async item => {
			await db.collection('user_role').findOneAndUpdate(
				{ _id: item._id },
				{
					$setOnInsert: {
						_id: item._id
					},
					$set: {
						userId: item.userId,
						roleId: item.roleId,
						createdAt: +new Date(),
						updatedAt: +new Date()
					}
				},
				{ upsert: true }
			)
		})

		// const companies = [
		// 	{
		// 		_id: '828ffd60-0454-11ea-a419-df3cbac30251',
		// 		name: 'Acexis',
		// 		manager: 'Le Si Phu'
		// 	}
		// ]

		// companies.map(async item => {
		// 	await db.collection('companies').findOneAndUpdate(
		// 		{ _id: item._id },
		// 		{
		// 			$setOnInsert: {
		// 				_id: item._id
		// 			},
		// 			$set: {
		// 				name: item.name,
		// 				manager: item.manager,
		// 				createdAt: +new Date(),
		// 				updatedAt: +new Date()
		// 			}
		// 		},
		// 		{ upsert: true }
		// 	)
		// })

		// const cities = [
		// 	{
		// 		_id: 'e3be2790-0456-11ea-9cc4-fde334d55778',
		// 		name: 'Ho Chi Minh'
		// 	},
		// 	{
		// 		_id: 'f6361720-0456-11ea-9cc4-fde334d55778',
		// 		name: 'Ha Noi'
		// 	}
		// ]

		// cities.map(async item => {
		// 	await db.collection('cities').findOneAndUpdate(
		// 		{ _id: item._id },
		// 		{
		// 			$setOnInsert: {
		// 				_id: item._id
		// 			},
		// 			$set: {
		// 				name: item.name,
		// 				createdAt: +new Date(),
		// 				updatedAt: +new Date()
		// 			}
		// 		},
		// 		{ upsert: true }
		// 	)
		// })

		client.close()
		console.log('💤  Server off')
	} catch (err) {
		console.log('❌  Server error', err.stack)
	}
}

main()
