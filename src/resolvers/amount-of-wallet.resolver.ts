import { User } from "@models";
import { Args, Context, Mutation , Query} from "@nestjs/graphql";
import { CretateWalletInput, UpdateWalletInput } from "generator/graphql.schema";
import { getMongoRepository } from "typeorm";
import { AmountOfWallet } from "models/amount-of-wallet.entity";
import { ForbiddenError } from "apollo-server-express";
import { NotFoundException } from "@nestjs/common";


export class AmountOfWalletResolver{
    @Mutation()
        async createWallet(@Args('input') input: CretateWalletInput,  @Context('currentUser') currentUser: User) :Promise<AmountOfWallet> {
            const { _id } = currentUser

            const existingWallet = await getMongoRepository(AmountOfWallet).findOne({
                userId: _id,
                deletedAt: null,
              }); 
                console.log('existingWallet',existingWallet)
              
              if (existingWallet) {
                 await getMongoRepository(AmountOfWallet).findOneAndUpdate({_id:existingWallet._id},  { $inc: { totalAmount: input.totalAmount } },{returnOriginal:false})
                    return existingWallet
              }else{
                input.userId = _id
                const res = await getMongoRepository(AmountOfWallet).save(new AmountOfWallet(input))
                console.log('res',res)
                return res
            }
             
        }


    @Mutation()
    async updateWallet(@Args('id') id: string,@Args('input') input: UpdateWalletInput): Promise<Boolean> {
        
        const wallet = await getMongoRepository(AmountOfWallet).findOne({_id:id})
        if (!wallet) {
            throw new ForbiddenError('wallet not found.')
        } 
        const updateWallet = await getMongoRepository(AmountOfWallet).findOneAndUpdate(
            { _id: wallet._id },
            { $set: input },
            { returnOriginal: false }
        )
        return updateWallet ? true : false
    }


    @Mutation()
    async deleteWallet(@Args('id') id: string): Promise<Boolean> {
       
        const wallet = await getMongoRepository(AmountOfWallet).findOne({_id:id})

        if (!wallet) 
           {
			throw new NotFoundException('wallet not found');
           }
           wallet.deletedAt = new Date(Date.now())

           const updateWallet = await getMongoRepository(AmountOfWallet).findOneAndUpdate(
            { _id: wallet._id },
            { $set: wallet },
            { returnOriginal: false }
        )
        return updateWallet ? true : false
       
           } 

    @Query()
        async getWalletById(@Args('id') id: string): Promise<AmountOfWallet> {
            const wallet = await getMongoRepository(AmountOfWallet).findOne(
               {
                   where: {
                       _id: id,
                       deletedAt: null, 
                   }
               })      
               return wallet
           }
       
    @Query ()
        async getWalletByUserId(@Args('userId') userId: string): Promise<AmountOfWallet> {
            return await getMongoRepository(AmountOfWallet).findOne({where:{userId:userId,deletedAt:null}})
           }
       
           
     @Query()
        async getAllWallets(): Promise<AmountOfWallet[]> {
           const wallet = await getMongoRepository(AmountOfWallet).find({
             where: {
               deletedAt: null,
             },
           });
       
           return wallet;
         }
       
}