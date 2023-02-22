import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
	Logger
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import { PRIMARY_COLOR } from 'environments'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		if (context.getArgs()[3]) {
			const parentType = context.getArgs()[3]['parentType']
			const fieldName = `${context.getArgs()[3]['fieldName']}`
			return next.handle().pipe(
				tap(() => {
					console.debug(`⛩  ${parentType} » ${fieldName}`, 'GraphQL')
				})
			)
		} else {
			const parentType = `${context.getArgs()[0].route.path}`
			const fieldName = `${context.getArgs()[0].route.stack[0].method}`
			return next.handle().pipe(
				tap(() => {
					console.debug(`⛩  ${parentType} » ${fieldName}`, 'GraphQL')
				})
			)
		}
	}
}
