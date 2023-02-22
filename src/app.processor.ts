import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'

@Processor('app')
export class AppProcessor {
	@Process('transcode')
	handleTranscode(job: Job) {
		console.log('Start transcoding...', 'Bull')
		console.log(job.data, 'Bull')
		console.log('Transcoding completed', 'Bull')
	}
}
