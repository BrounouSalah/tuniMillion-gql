import {
	Controller,
	Get,
	Param,
	Res,
	Post,
	Inject,
	CACHE_MANAGER,
	UseInterceptors,
	CacheInterceptor
} from '@nestjs/common'

import { STATIC } from 'environments'

@Controller()
export class AppController {
	counter = 0
	constructor() {}
	@Get(`${STATIC!}/:fileId`)
	getUpload(@Param('fileId') fileId, @Res() res): any {
		return res.sendFile(fileId, {
			root: STATIC!
		})
	}

	@Post('/gitlab')
	postGitlab(@Res() res): any {
		return res.body
	}

	@Get('cache')
	@UseInterceptors(CacheInterceptor)
	incrementCounter() {
		this.counter++
		return this.counter
	}

	@Get('nocache')
	incrementCounterNoCache() {
		this.counter++
		return this.counter
	}
}
