import { Args, Mutation, Query,Context } from "@nestjs/graphql";
import { getMongoRepository } from "typeorm";
import { Grille } from "../models/grille.entity";
import { CreateGrilleInput, Status, UpdateGrilleInput } from "generator/graphql.schema";
import { ApolloError, ForbiddenError } from "apollo-server-express";
import { NotFoundException } from "@nestjs/common";
import { User } from "@models";
import { ObjectId } from "mongodb";
import * as crypto from 'crypto';
import { create } from "handlebars/runtime";
import { constants } from "fs/promises";

type CombinationsBasic = {numbers: number[]; stars: number[], tuniMillionsCode?: string;};


export class GrilleResolver{
    constructor() {}
    
   
     generateCombinations(starArray: number[], numberArray: number[]): any {
  
        const combinations: CombinationsBasic[] = [];
        console.log("here")
      
        // Generate all possible combinations of 5 numbers
        const numberCombos = this.combinationsOf(numberArray, 5);
      
        // Generate all possible combinations of 2 stars
        const starCombos = this.combinationsOf(starArray, 2);
      
        // Combine number and star combos to form valid combinations
        for (const numbers of numberCombos) {
          for (const stars of starCombos) {
            //TODO: add call to function that generates the tunimillion code 
            //const tuniMillionsCode = this.generateTuniMillionsCode(15);
            combinations.push({ numbers, stars });

            // combinations.push({numbers:numbers, stars:stars});
            
          }
        }
      
        return combinations;
      }
      
    combinationsOf<T>(arr: T[], count: number): T[][] {
        if (count === 0) {
          return [[]];
        }
        
        return arr.flatMap((val, idx) => {
          const subcombos = this.combinationsOf(arr.slice(idx + 1), count - 1);
          return subcombos.map((combo) => [val, ...combo]);
        });
      }

      // generateTuniMillionsCode(numCodes: number): string[] {
      //   const codes: string[] = [];
      
      //   let startingMiddlePart = 'WBB';
      //   let startingLastPart = '00001';
      
      //   for (let i = 1; i <= numCodes; i++) {
      //     let middlePart = startingMiddlePart;
      //     let lastPart = startingLastPart;
      
      //     if (i > 10) {
      //       const lastNum = parseInt(startingLastPart) + 1;
      //       if (lastNum > 99999) {
      //         const middleIndex = startingMiddlePart.charCodeAt(2) - 65;
      //         if (middleIndex === 25) {
      //           startingMiddlePart = 'XAA';
      //         } else if (middleIndex === 24) {
      //           startingMiddlePart = 'WZZ';
      //         } else {
      //           startingMiddlePart = `W${String.fromCharCode(middleIndex + 67)}A`;
      //         }
      //         startingLastPart = '00001';
      //       } else {
      //         startingLastPart = lastNum.toString().padStart(5, '0');
      //       }
      //     }
      
      //     const code = `F${this.randomConsonant()}${this.randomConsonant()}${this.randomConsonant()}${middlePart}${lastPart}`;
      //     codes.push(code);
      //   }
      
      //   console.log("codes", codes)
      //   return codes;
      // }
      
      //  randomConsonant(): string {
      //   const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
      //   return consonants.charAt(Math.floor(Math.random() * consonants.length));
      // }
      
      
      //  generateTuniMillionsCode(combinationsCount: number): string {
      //   let code = "F";
      //   const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
      //   const middleLettersMin = "BBB";
      //   const middleLettersMax = combinationsCount <= 10 ? "WBB" : "ZZZ";
      //   const lastNumbersMax = combinationsCount <= 10 ? "00000" : "99999";
      
      //   // Generate 3 random consonants for the middle part of the code
      //   for (let i = 0; i < 3; i++) {
      //     code += consonants[Math.floor(Math.random() * consonants.length)];
      //   }
      
      //   // Generate the middle part of the code based on the combinations count
      //   code += combinationsCount <= 10
      //     ? middleLettersMin + lastNumbersMax
      //     : this.getRandomCodeInRange(middleLettersMin, middleLettersMax) + this.getRandomCodeInRange("00001", lastNumbersMax);
      
      //   return code;
      // }
      
      //  getRandomCodeInRange(minCode: string, maxCode: string): string {
      //   const minNumber = parseInt(minCode.slice(-5));
      //   const maxNumber = parseInt(maxCode.slice(-5));
      //   const randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      //   const formattedNumber = randomNumber.toString().padStart(5, "0");
      //   return minCode.slice(0, -5) + formattedNumber;
      // }
      

    @Mutation()
    async createGrille(@Args('input') input: CreateGrilleInput,@Context('currentUser') currentUser: User): Promise<Grille> {
        const { _id } = currentUser
        input.userId = _id

        const gridPrice = [
            [
              { price: 5, prise: 1 },
              { price: 30, prise: 6 },
              { price: 165, prise: 21 },
              { price: 280, prise: 56 },
              { price: 630, prise: 126 },
              { price: 1260, prise: 252 },
            ],
            [
              { price: 15, prise: 3 },
              { price: 90, prise: 18 },
              { price: 315, prise: 63 },
              { price: 840, prise: 168 },
              { price: 1890, prise: 378 },
            ],
            [
              { price: 30, prise: 6 },
              { price: 180, prise: 36 },
              { price: 630, prise: 126 },
              { price: 1680, prise: 336 },
            ],
            [
              { price: 50, prise: 10 },
              { price: 300, prise: 60 },
              { price: 1050, prise: 210 },
            ],
            [
              { price: 75, prise: 15 },
              { price: 550, prise: 90 },
              { price: 1575, prise: 315 },
            ],
            [
              { price: 105, prise: 21 },
              { price: 630, prise: 126 },
            ],
            [
              { price: 140, prise: 28 },
              { price: 840, prise: 168 },
            ],
            [
              { price: 180, prise: 36 },
              { price: 1080, prise: 216 },
            ],
            [
              { price: 225, prise: 45 },
              { price: 1350, prise: 270 },
            ],
            [
              { price: 275, prise: 55 },
              { price: 1650, prise: 330 },
            ],
            [
              { price: 330, prise: 66 },
              { price: 1980, prise: 396 },
            ],
          ];
          const { numbers, stars } = input;
      

          if(!(numbers.length > 4 && stars.length > 1)) throw new ForbiddenError('invalid input')
          if (numbers.length > 4 && stars.length > 1) {
            console.log("hear")
            let object =
              gridPrice[stars.length - 2][
                numbers.length - 5
              ];
              type Combinations = {number: number[], stars: number[]}
              //const generatedGrids: Grille[] = [];
            const combinations:any = await  this.generateCombinations( stars,numbers);
           
            
            console.log("cob",combinations)
          
           
       
        // return await getMongoRepository(Grille).save(new Grille({...input , randomCode}))
        return await getMongoRepository(Grille).save(new Grille({...input,prise:object.prise,price:object.price,combinations}))
    } 
}

    @Query()
    async getAllGrilles(): Promise<Grille[]> {
        
        return getMongoRepository(Grille).find({
            cache: true,
            where: {
                deletedAt: null
            
            }
        })
    }


    @Query()
    async getAllGrillesByStatus(@Args('status') status: Status): Promise<Grille[]> {
        return getMongoRepository(Grille).find({
            cache: true,
            where: {
                deletedAt: null,
                status:status
            }
        })
    }

    @Query() 
    async getAllGrillesByUserId(@Args('userId') userId: string): Promise<Grille[]> {
        return await getMongoRepository(Grille).find({
            cache: true,
            where: {
                deletedAt: null,
                userId
            }
        })
    }

    @Query()
    async getGrille(@Args('id') id: string): Promise<Grille> {

       
          return getMongoRepository(Grille).findOne({
            where: {
                _id: id,
                deletedAt: null,
               
            }
        })
        }
    

    @Mutation()
    async deleteGrille(@Args('_id') _id: string): Promise<Boolean> {

        // const grille = await  getMongoRepository(Grille).softDelete({ _id})
        //  grille.deletedAt = new Date(Date.now())
        // return grille 
       
        const grille = await getMongoRepository(Grille).findOne({ _id})

        if (!grille) 
           {
			throw new NotFoundException('Grille not found');
           }
           grille.deletedAt = new Date(Date.now())

           const updateGrille = await getMongoRepository(Grille).findOneAndUpdate(
            { _id: grille._id },
            { $set: grille },
            { returnOriginal: false }
        )
        return updateGrille ? true : false
       
           } 


    @Mutation()
    async updateGrille(@Args('userId') userId: string,@Args('input') input: UpdateGrilleInput): Promise<Boolean> {
        
        const grille = await getMongoRepository(User).findOne({_id:userId})
        if (!grille) {
            throw new ForbiddenError('Grille not found.')
        } else {
            // if (grille.Numbers == null && input.Numbers != null) 
          
                await this.changeGrilleAccountState(grille)
            
        }
        const updateGrille = await getMongoRepository(Grille).findOneAndUpdate(
            { userId: grille._id },
            { $set: input },
            { returnOriginal: false }
        )
        return updateGrille ? true : false
    }
    changeGrilleAccountState(grille: any) {
        throw new Error("Method not implemented.");
    }

    
    }
    
   


 
   
