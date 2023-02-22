import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { createWriteStream } from 'fs'
import * as uuid from 'uuid'
import { stringify } from 'flatted'
import { File } from '@models'
import { uploadFile } from '@shared'
import { ApolloError } from 'apollo-server-core'

@Resolver('File')
export class FileResolver {
	constructor() {}

	// @Mutation()
	// async uploadFile(@Args('file') file: any): Promise<File> {
	// 	const { filename } = file

	// 	console.log(file)

	// 	const path = await uploadFile(file)

	// 	const newFile = await getMongoRepository(File).save(
	// 		new File({ filename, path })
	// 	)

	// 	return newFile
	// }

	@Mutation()
	async uploadFileLocal(
		@Args('file') file: any,
		@Context('req') req: any
	): Promise<any> {
		const { filename, createReadStream, mimetype } = file
		const convertFilename = `${uuid.v1()}.${mimetype.split('/')[1]}`
		let path
		path = await new Promise(async (resolve, reject) =>
			createReadStream(file).pipe(
				createWriteStream(`./static/${convertFilename}`)
					.on('error', (err) => {
						console.log('Error upload ', err)

						reject(err)
					})
					.on('finish', async () => {
						const link = `https://${req.headers.host}/static/${convertFilename}`
						resolve(link)
					})
			)
		)
		const newFile = await getMongoRepository(File).save(
			new File({ filename, path })
		)
		return newFile
	}
}
