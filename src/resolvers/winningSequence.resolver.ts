import { Inject, NotFoundException, forwardRef } from "@nestjs/common";
import { Args, Mutation, Query } from "@nestjs/graphql";
import { ApolloError, ForbiddenError } from "apollo-server-express";
import { CreateWinningSequenceInput, UpdateWinningSequenceInput, WinningRank, WinningRankCount } from "generator/graphql.schema";
import { WinningSequence } from "models/winningSequence.entity";
import {  getMongoRepository } from "typeorm";
import { GrilleResolver } from "./grille.resolver";

export class WinningSequenceResolver{
    constructor(
        @Inject(forwardRef(() => GrilleResolver))
		private grilleResolver: GrilleResolver
     
      ) {}

    @Mutation()
    async createWinningSequence(@Args('input') input: CreateWinningSequenceInput): Promise<WinningSequence> {
      const { numbers, stars } = input;

  
  if (numbers.some((number) => number < 1 || number > 50) || new Set(numbers).size !== numbers.length || numbers.length !==5) {
    throw  new ForbiddenError('Invalid numbers. Please provide a unique set of numbers between 1 and 50 and numbers = 5.');
  }

   

  
  if (stars.some((star) => star < 1 || star > 12) || new Set(stars).size !== stars.length || stars.length !==2) {
    throw new ForbiddenError('Invalid stars. Please provide a unique set of stars between 1 and 12 and stars = 2.');
  }
      
      return await getMongoRepository(WinningSequence).save(new WinningSequence({...input}));
  
	}
    


    
    compareGrilleWithWinningSequence(grille, winningSequence) {

    const matchingNumbers = grille.numbers.filter(number => winningSequence.numbers.includes(number));
    const matchingStars = grille.stars.filter(star => winningSequence.stars.includes(star));
  
    const numMatchingNumbers = matchingNumbers.length;
    const numMatchingStars = matchingStars.length;
  console.log(numMatchingNumbers, numMatchingStars,winningSequence.numbers,winningSequence.stars)
    if (numMatchingNumbers === 5 && numMatchingStars === 2) {
        return WinningRank.FIRST;
      } else if (numMatchingNumbers === 5 && numMatchingStars === 1) {
        return WinningRank.SECOND;
      } else if (numMatchingNumbers === 5 && numMatchingStars === 0) {
        return WinningRank.THIRD;
      } else if (numMatchingNumbers === 4 && numMatchingStars === 2) {
        return WinningRank.FOURTH;
      } else if (numMatchingNumbers === 4 && numMatchingStars === 1) {
        return WinningRank.FIFTH;
      } else if (numMatchingNumbers === 3 && numMatchingStars === 2) {
        return WinningRank.SIXTH;
      } else if (numMatchingNumbers === 4 && numMatchingStars === 0) {
        return WinningRank.SEVENTH;
      } else if (numMatchingNumbers === 2 && numMatchingStars === 2) {
        return WinningRank.EIGHTH;
      } else if (numMatchingNumbers === 3 && numMatchingStars === 1) {
        return WinningRank.NINTH;
      } else if (numMatchingNumbers === 3 && numMatchingStars === 0) {
        return WinningRank.TENTH;
      } else if (numMatchingNumbers === 1 && numMatchingStars === 2) {
        return WinningRank.ELEVENTH;
      } else if (numMatchingNumbers === 2 && numMatchingStars === 1) {
        return WinningRank.TWELFTH;
      } else if (numMatchingNumbers === 2 && numMatchingStars === 0) {
        return WinningRank.THIRTEENTH;
      }else {

        return WinningRank.NONE;
      }
      
  
  }

  @Query()
  async getStaticWinningSequence(@Args('_id') _id: string):Promise<WinningSequence> {
    const grilles = await this.grilleResolver.getAllGrilles()
    const winningsequence = await getMongoRepository(WinningSequence).findOne({
        cache: true,  
        where: {
            _id: _id,
            deletedAt: null
        }
    })
    const rankCounts = {
      [WinningRank.FIRST]: 0,
      [WinningRank.SECOND]: 0,
      [WinningRank.THIRD]: 0,
      [WinningRank.FOURTH]: 0,
      [WinningRank.FIFTH]: 0,
      [WinningRank.SIXTH]: 0,
      [WinningRank.SEVENTH]: 0,
      [WinningRank.EIGHTH]: 0,
      [WinningRank.NINTH]: 0,
      [WinningRank.TENTH]: 0,
      [WinningRank.ELEVENTH]: 0,
      [WinningRank.TWELFTH]: 0,
      [WinningRank.THIRTEENTH]: 0,
      [WinningRank.NONE]: 0,
    };
        

    grilles.forEach((grille) => {
      const winningRank = this.compareGrilleWithWinningSequence(grille, winningsequence);
      console.log(winningRank)
      if (winningRank) {
          rankCounts[winningRank] += 1;
        }
    });
  
   const counts =  Object.entries(rankCounts).map(([rank, count]) => ({
      rank: rank as WinningRank,
      count: Number.isNaN(count) ? 0 : count,
    })) as WinningRankCount[];

    const  updatedwinningsequence = await getMongoRepository(WinningSequence).findOneAndUpdate(
      { _id: winningsequence._id },
      { $set: { userContsByRang: counts } },
      { returnOriginal: false }
  )
      return updatedwinningsequence.value;
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
    async  getWinningSequneceById(@Args('_id') _id: string): Promise<WinningSequence> {
        
        return await getMongoRepository(WinningSequence).findOne({
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