import { Expose, plainToClass } from "class-transformer";
import { Column, Entity, ObjectIdColumn } from "typeorm";
import * as uuid from 'uuid';


@Entity({
	name: 'winningSequences',
	orderBy: {
		createdAt: 'ASC'
	}
})

export class WinningSequence{
    @Expose()
	@ObjectIdColumn()
	_id: string

    @Expose()
    @Column()
    numbers:number[]

    @Expose()
    @Column()
    stars:number[]


    @Expose()
    @Column()
    createdAt:Date

    @Expose()
    @Column()
    updatedAt:Date

    @Expose()
    @Column()
    deletedAt:Date
   
   


    constructor(winningSequence: Partial<WinningSequence>) {
        if (winningSequence){
            Object.assign(this, plainToClass(WinningSequence, winningSequence, {excludeExtraneousValues: true}))

			this._id = this._id || uuid.v1()
            this.createdAt = this.createdAt || new Date(Date.now())
			this.updatedAt = this.updatedAt || new Date(Date.now())
        }
       

    }


   
}

