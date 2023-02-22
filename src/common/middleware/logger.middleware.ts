// import { logger } from '../wiston'
import { Logger } from '@nestjs/common'

export function LoggerMiddleware(req, res, next) {
	// logger.debug(`💬  ${req.headers['user-agent']}`)
	console.debug(
		`💬  ${
			req.headers['user-agent']
				? req.headers['user-agent'].split(') ')[0]
				: req.headers
		})`,
		'Bootstrap',
		false
	)
	next()
}
