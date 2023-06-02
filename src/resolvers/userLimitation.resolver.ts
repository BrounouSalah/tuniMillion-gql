import { Args, Context, Mutation,Query, Resolver } from "@nestjs/graphql";
import { CreateUserLimitationInput, Grille, UpdateUserLimitationInput } from "generator/graphql.schema";
import { UserLimitation } from "models/UserLimitation.entity";
import { User } from "@models";
import { getMongoRepository } from "typeorm";

import { ForbiddenError } from "apollo-server-express";
import {  Inject, NotFoundException, forwardRef } from "@nestjs/common";


export class UserLimitationResolver 
{

    @Mutation()
    async createUserLimitation(@Args('input') input: CreateUserLimitationInput, @Context('currentUser') currentUser: User): Promise<UserLimitation> {
        const { _id } = currentUser

        const existingLimitation = await getMongoRepository(UserLimitation).findOne({
          userId: _id,
        });
      
        if (existingLimitation) {
          throw new Error('Limitation already exists ');
        }
        input.userId = _id
        const res = await getMongoRepository(UserLimitation).save(new UserLimitation(input))
        if(res){
            await getMongoRepository(User).findOneAndUpdate({_id:res.userId},{$set:{userLimitationId:res._id}},{returnOriginal:false})
        }
        return res
    }

    @Mutation()
    async updateUserLimitation(@Args('id') id: string,@Args('input') input: UpdateUserLimitationInput): Promise<Boolean> {
        
        const userLimitation = await getMongoRepository(UserLimitation).findOne({_id:id})
        console.log('userLimitation',userLimitation, id, input)
        if (!userLimitation) {
            throw new ForbiddenError('userLimitation not found.')
        } 
        const updateUserLimitation = await getMongoRepository(UserLimitation).findOneAndUpdate(
            { _id: userLimitation._id },
            { $set: input },
            { returnOriginal: false }
        )
        return updateUserLimitation ? true : false
    }

    @Mutation()
    async deleteUserLimitation(@Args('id') id: string): Promise<Boolean> {
       
        const userLimitation = await getMongoRepository(UserLimitation).findOne({_id:id})

        if (!userLimitation) 
           {
			throw new NotFoundException('UserLimitation not found');
           }
           userLimitation.deletedAt = new Date(Date.now())

           const updateUserLimitation = await getMongoRepository(UserLimitation).findOneAndUpdate(
            { _id: userLimitation._id },
            { $set: userLimitation },
            { returnOriginal: false }
        )
        return updateUserLimitation ? true : false
       
           } 


    @Query()
    async getUserLimitation(@Args('id') id: string): Promise<UserLimitation> {
       const userlimitation = await getMongoRepository(UserLimitation).findOne(
        {
            where: {
                _id: id,
                deletedAt: null,
               
            }
        })   
        
    
        return userlimitation
    }

    @Query ()
    async getUserLimitationByUserId(@Args('userId') userId: string): Promise<UserLimitation> {
      return await getMongoRepository(UserLimitation).findOne({where:{userId:userId,deletedAt:null}})
    }
     
     

    @Query()
    async getAllUserLimitations(): Promise<UserLimitation[]> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
    // await getMongoRepository(UserLimitation).updateMany(
    //   { createdAt: { $gte: oneMonthAgo } },
    //   { $set: { rest: null } }
    // );
  
    const userLimitations = await getMongoRepository(UserLimitation).find({
      where: {
        createdAt: {
          $lte: oneMonthAgo,
        },
        deletedAt: null,
      },
    });

    return userLimitations;
  }

 
}

