import { CacheModule, Module, Injectable,Logger } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule, Cron } from '@nestjs/schedule'

import { CacheService, GraphqlService, TypeOrmService } from './config'
import { AppController } from './app.controller'

import { DateScalar } from './config/graphql/scalars/date.scalar'
import { UploadScalar } from './config/graphql/scalars/upload.scalar'

import * as Resolvers from './resolvers'
import { AppService } from 'app.service'
import { HttpModule } from '@nestjs/axios'
import { TypeLimit, UpdateUserLimitationInput } from './generator/graphql.schema'


@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly userLimitationResolver: Resolvers.UserLimitationResolver) {}

  @Cron('0 0 1 * *') // Exécuter chaque mois à 1h00
  async handleCron() {
   
    try {
		console.log("cron")
      const userLimitations = await this.userLimitationResolver.getAllUserLimitations();

      if (userLimitations.length > 0) {
        const initialLimit = userLimitations[0].limit; 

        for (const userLimitation of userLimitations) {
          const updateInput: UpdateUserLimitationInput = {
            type: TypeLimit.MOIS,
            rest: null,
            limit: initialLimit 
          };

          await this.userLimitationResolver.updateUserLimitation(userLimitation._id, updateInput);
        }
      }
    } catch (error) {
      console.error('An error occurred while executing getAllUserLimitations:', error);
    }
  }
}




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
		HttpModule,
		
	],
	controllers: [AppController],
	providers: [DateScalar, UploadScalar, ...Object.values(Resolvers), AppService, TasksService],
})
// @Injectable()
// export class TasksService {
//   private readonly logger = new Logger(TasksService.name);
//   constructor(private readonly userLimitationResolver: Resolvers.UserLimitationResolver) {}

//   @Cron('0 0 1 * *')
//   async handleCron() {
//     this.logger.debug('Called');
//     try {
//       const userLimitations = await this.userLimitationResolver.getAllUserLimitations();
// 	   if(userLimitations.length > 0){
// 	for (let x of userLimitations) {
// 		await this.userLimitationResolver.updateUserLimitation(x._id, { rest: null })
//    }
//       console.log(userLimitations);
//     } catch (error) {
//       console.error('An error occurred while executing getAllUserLimitations:', error);
//     }
//   }
//   }
// }



export class AppModule {}
