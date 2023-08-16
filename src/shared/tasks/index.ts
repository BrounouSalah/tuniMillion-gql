import { CronJob } from 'cron'
import { Logger } from '@nestjs/common'
import { userLimitationCron } from 'utils/cronJobs/userLimitationsCron'
import { docVerificationCron } from 'utils/cronJobs/docVerificationCron'
import { accountReactivation } from 'utils/cronJobs/accountReactivationCron'	

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
	const userLimitJob = new CronJob({
		cronTime: '0 0 * * *',
		onTick: async () => {
			await userLimitationCron()
		},
		start: false
	})
	const verificationJob = new CronJob({
		cronTime: '30 0 * * *',
		onTick: async () => {
			await docVerificationCron()
		},
		start: false
	})

	const reactivationJob = new CronJob({
		cronTime: '0 8 * * *',
		onTick: async () => {
			await accountReactivation()
		}
	})
	reactivationJob.start()
	userLimitJob.start()
	verificationJob.start()
}
