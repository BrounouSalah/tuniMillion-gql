import { Args, Mutation, Query,Context } from "@nestjs/graphql";
import { getMongoRepository } from "typeorm";
import { Grille } from "../models/grille.entity";
import { CreateGrilleInput, Status, UpdateGrilleInput } from "generator/graphql.schema";
import { ApolloError, ForbiddenError } from "apollo-server-express";
import { NotFoundException } from "@nestjs/common";
import { User } from "@models";
import crypto from "crypto";

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
            let tuniMillionsCode = "";
      
            if (combinations.length <= 10) {
              tuniMillionsCode = this.generateTuniMillionsCode(combinations.length);
            } else {
              tuniMillionsCode = this.generateConsecutiveStrings(combinations.length);
            }
            
            combinations.push({ numbers, stars, tuniMillionsCode });
          
            
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


      //  generateConsecutiveStrings(start: string, limit: number): string {
      //   const end = "F ZZZ 99999";
      
      //   const startNumber = Number(start.slice(-5));
      //   const endNumber = Number(end.slice(-5));
      
      //   let currentNumber = startNumber;
      
      //   let result = "";
      //   while (currentNumber <= endNumber && result.split("\n").length <= limit) {
      //     const currentString = `F ${this.generateRandomConsonants()} ${currentNumber.toString().padStart(5, "0")}\n`;
      //     result += currentString;
      //     currentNumber++;
      //     console.log("result",result)
      //   }
      
      //   return result;
       
      // }
    
      generateConsecutiveStrings(usedCode: number): string {
        const end = "F ZZZ 99999";
        const start = "F WBB 00001 ";
        const startNumber = Number(start.slice(-5));
        const endNumber = Number(end.slice(-5));
        
        let currentNumber = startNumber;
        let currentString = "";
       
     
          for (let i = 0; i < usedCode; i++) {
            currentString += `F ${this.generateRandomConsonants()} ${currentNumber.toString().padStart(5, "0")}\n`;
            currentNumber++;

            if (currentNumber > endNumber) {
              break;
            }
          }
        
        
        return currentString;
      }
    
      
      
 generateRandomConsonants() {
  const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
  const randomConsonants = Array.from({ length: 3 }, () => consonants[Math.floor(Math.random() * consonants.length)]);
  return randomConsonants.join("");
}

       generateTuniMillionsCode(usedCode: number): string {
        const consonants = "BCDFGHJKLMNPQRSTVWXYZ"; // Only consonants
        let currentString = "BBB";
      
        let code = "";
       
        
          for (let i = 0; i < usedCode; i++) {
            const lastIndex = currentString.length - 1;
            let nextCharIndex = consonants.indexOf(currentString[lastIndex]) + 1;
        
            // Handle wraparound if we've reached the end of the consonants array
            if (nextCharIndex >= consonants.length) {
              nextCharIndex = 0;
              // If we wrapped around to the beginning of the consonants array, increment the second-to-last character
              if (lastIndex === 1) {
                currentString = consonants[0] + currentString[0] + consonants[0];
                continue;
              }
            }
        
            // Replace the last character with the next consonant
            currentString = currentString.slice(0, lastIndex)+consonants[nextCharIndex] ;
          }
      
          // Generate five random digits
          let digits = "";
          for (let i = 0; i < 5; i++) {
            digits += Math.floor(Math.random() * 10);
          }
      
          // Combine the letters and digits to form the code
          code = `F${currentString}${digits}`;
        return code;
      }
      
      

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
    async updateGrille(
      @Args('userId') userId: string,
      @Args('input') input: UpdateGrilleInput
  ): Promise<boolean> {
      try {
         
          const grille = await getMongoRepository(Grille).findOne({ userId })

          if (!grille) {
              throw new ForbiddenError('grille not found.')
          } 
          
          const updateGrille = await getMongoRepository(Grille).findOneAndUpdate(
              { userId:userId },
              { $set: input },
              { returnOriginal: false }
          )
          return updateGrille ? true : false
      } catch (error) {
          throw new ApolloError(error)
      }
  }


    
    }
    
   


 
   
