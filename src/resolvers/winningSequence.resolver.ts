import { NotFoundException } from "@nestjs/common";
import { Args, Mutation, Query } from "@nestjs/graphql";
import { ApolloError, ForbiddenError } from "apollo-server-express";
import { CreateWinningSequenceInput, UpdateWinningSequenceInput } from "generator/graphql.schema";
import { WinningSequence } from "models/winningSequence.entity";
import {  getMongoRepository } from "typeorm";

export class WinningSequenceResolver{
    constructor(
     
      ) {}

    @Mutation()
    async createWinningSequence(@Args('input') input: CreateWinningSequenceInput): Promise<WinningSequence> {
		return await getMongoRepository(WinningSequence).save(new WinningSequence(input))
	}
    
    @Query()
    async  getAllWinningSequences(): Promise<WinningSequence[]> {
        
        return getMongoRepository(WinningSequence).find({
            cache: true,
            where: {
                deletedAt: null
            
            }
        })
    }

    @Query()
    async  getWinningSequneceById(@Args('_id') _id: string): Promise<WinningSequence[]> {
        
        return getMongoRepository(WinningSequence).find({
            cache: true,
            where: {
                _id: _id,
                deletedAt: null
            
            }
        })
    }



    @Query()
    async getAllWinningSequencesByDate(@Args('createdAt') createdAt: string): Promise<WinningSequence[]> {
            
            return await getMongoRepository(WinningSequence).find({
                cache: true,
                where: {
                    createdAt: { $gte : new Date(createdAt) },
                    //createdAt: +new Date(createdAt),
                    deletedAt: null
                
                }
            })
        }

    @Query()
    async getAllWinningSequencesByRange(
        @Args('startedAt')startedAt:string, @Args('endedAt')  endedAt:string,
      ): Promise<WinningSequence[]> {
        const starteddate = new Date(startedAt);
        const endeddate = new Date(endedAt);
        const dayStart = new Date(
            starteddate.getUTCFullYear(),
            starteddate.getUTCMonth(),
            starteddate.getUTCDay(),
          0,
          0,
          0,
        );
        const dayEnd = new Date(
            endeddate.getUTCFullYear(),
            endeddate.getUTCMonth(),
            endeddate.getUTCDay() ,
          0,
          0,
          0,
        );
     
        return await getMongoRepository(WinningSequence).find({
            cache: true,
            where: {
              $and: [
                { createdAt: { $gt: dayStart, $lt: dayEnd } },
               
              ],
              deletedAt: null,
            },
          });
        }

    @Mutation()
    async deleteWinningSequence(@Args('_id') _id: string): Promise<Boolean> {
       
        const winningSequence = await getMongoRepository(WinningSequence).findOne({ _id})

        if (!winningSequence) 
           {
			throw new NotFoundException('winningSequence not found');
           }
           winningSequence.deletedAt = new Date(Date.now())

           const updateWinningSequnece = await getMongoRepository(WinningSequence).findOneAndUpdate(
            { _id: winningSequence._id },
            { $set: winningSequence },
            { returnOriginal: false }
        )
        return updateWinningSequnece ? true : false
       
           } 

        @Mutation()
        async updateWinningSequence(
            @Args('_id') _id: string,
            @Args('input') input: UpdateWinningSequenceInput
        ): Promise<boolean> {
            try {
               
                const winningSequence = await getMongoRepository(WinningSequence).findOne({ _id })
    
                if (!winningSequence) {
                    throw new ForbiddenError('winningSequence not found.')
                } 
                
                const updateWinning = await getMongoRepository(WinningSequence).findOneAndUpdate(
                    { _id:_id },
                    { $set: input },
                    { returnOriginal: false }
                )
                return updateWinning ? true : false
            } catch (error) {
                throw new ApolloError(error)
            }
        }
    
      
    

   

}