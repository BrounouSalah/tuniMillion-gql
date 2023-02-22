import { CacheModule, Module, HttpModule } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule } from '@nestjs/schedule'

import { CacheService, GraphqlService, TypeOrmService } from './config'
import { AppController } from './app.controller'

import { DateScalar } from './config/graphql/scalars/date.scalar'
import { UploadScalar } from './config/graphql/scalars/upload.scalar'

import * as Resolvers from './resolvers'
import { AppService } from 'app.service'

@Module({
	imports: [
		ScheduleModule.forRoot(),
		GraphQLModule.forRootAsync({
			useClass: GraphqlService
		}),
		TypeOrmModule.forRootAsync({
			useClass: TypeOrmService
		}),
		CacheModule.registerAsync({
			useClass: CacheService
		}),
		HttpModule
	],
	controllers: [AppController],
	providers: [DateScalar, UploadScalar, ...Object.values(Resolvers), AppService]
})
export class AppModule {}
