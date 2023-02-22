import { CronJob } from 'cron'
import { Logger } from '@nestjs/common'

/**
 * Returns any.
 *
 * @remarks
 * This method is part of the {@link shared/tasks}.
 *
 * @returns any
 *
 * @beta
 */
export const timeout = () => {
	const taskID = setTimeout(() => {
		console.debug('Task completed', 'Timeout', false)
	}, 1000)
	// clearTimeout(taskID)
}

/**
 * Returns any.
 *
 * @remarks
 * This method is part of the {@link shared/tasks}.
 *
 * @returns any
 *
 * @beta
 */
export const interval = () => {
	const intervalID = setInterval(() => {
		console.debug('Task executed', 'Interval', false)
	}, 2000)
	// clearInterval(intervalID)
}

/**
 * Returns any.
 *
 * @remarks
 * This method is part of the {@link shared/tasks}.
 *
 * @returns any
 *
 * @beta
 */
export const cron = () => {
	const job = new CronJob({
		cronTime: '0 0 12 * * MON-FRI',
		onTick: () => {
			console.debug('Cron job completed', 'Cron', false)
		},
		start: false,
		timeZone: 'Asia/Ho_Chi_Minh'
	})
	job.start()
}
