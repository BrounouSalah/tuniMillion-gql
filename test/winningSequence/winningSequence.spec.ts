import { TestingModule, Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AppModule } from '../../src/app.module'
import {  AmountOfWalletResolver, GrilleResolver, WinningSequenceResolver } from '../../src/resolvers'
import { Repository } from 'typeorm'
import { WinningSequence } from '../../src/models'
import { WinningRank } from '../../src/generator/graphql.schema'
const initModule = async ()=> {
    const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        providers: [
            WinningSequenceResolver,
            {
                provide: getRepositoryToken(WinningSequence),
                useClass: Repository
            },
            GrilleResolver,
            AmountOfWalletResolver
        ]
    }).compile()
    return module
}
describe('testing winningSequence  compareGrilleWithWinningSequence', () => {
	it('test compareGrilleWithWinningSequence have the same numbers and stars', async () => {
		
        const grille = {
            numbers: [1, 2, 3, 4, 5],
            stars: [6, 7]
          };
          const winningSequence = {
            numbers: [1, 2, 3, 4, 5],
            stars: [6, 7]
          };
          const expectedResult =WinningRank.FIRST;

          const res = await (await initModule())
			.get<WinningSequenceResolver>(WinningSequenceResolver)
			.compareGrilleWithWinningSequence(grille,winningSequence)
        expect(res).toBe(expectedResult);
       
           
	})

    it('test compareGrilleWithWinningSequence when there are partial matches', async () => {
		
        const grille = {
            numbers: [1, 2, 3, 4, 5],
            stars: [6, 7]
          };
          const winningSequence = {
            numbers: [1, 2, 6, 7, 8],
            stars: [9, 10]
          };
          const expectedResult = WinningRank.THIRTEENTH;

          const res = await (await initModule())
			.get<WinningSequenceResolver>(WinningSequenceResolver)
			.compareGrilleWithWinningSequence(grille,winningSequence)
        expect(res).toBe(expectedResult);
            
	})

    it('test compareGrilleWithWinningSequence when there are no matches', async () => {
	
        const grille = {
            numbers: [1, 2, 3, 4, 5],
            stars: [6, 7]
          };
          const winningSequence = {
            numbers: [8, 9, 10, 11, 12],
            stars: [13, 14]
          };

          const expectedResult = WinningRank.NONE;

          const res = await (await initModule())
			.get<WinningSequenceResolver>(WinningSequenceResolver)
			.compareGrilleWithWinningSequence(grille,winningSequence)
        expect(res).toBe(expectedResult);
            
	})


   
      
})