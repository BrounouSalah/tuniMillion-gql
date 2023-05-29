import { Expose, plainToClass } from "class-transformer";
import { Column, Entity, ObjectIdColumn, OneToMany } from "typeorm";
import * as uuid from 'uuid';
import{Status} from '../generator/graphql.schema';
import { Combinations } from "../generator/graphql.schema";



@Entity({
	name: 'grilles',
	orderBy: {
		createdAt: 'ASC'
	}
})

export class Grille{
    @Expose()
	@ObjectIdColumn()
	_id: string

    @Expose()
    @Column()
    userId:string

    @Expose()
    @Column()
    numbers:number[]

    @Expose()
    @Column()
    stars:number[]

    @Expose()
    @Column()
    status:Status 

    @Expose()
	@Column()
	randomCode: string

    @Expose()
    @Column()
    prise:number

    @Expose()
    @Column()
    price:number

    @Expose()
    @Column()
    combinations:Combinations[]

    @Expose()
    @Column()
    createdAt:Date

    @Expose()
    @Column()
    updatedAt:Date

    @Expose()
    @Column()
    deletedAt:Date
   
   


    constructor(grille: Partial<Grille>) {
        if (grille){
            Object.assign(this, plainToClass(Grille, grille, {excludeExtraneousValues: true}))

			this._id = this._id || uuid.v1()
            this.status=this.status || Status.PENDING
            this.createdAt = this.createdAt || new Date(Date.now())
			this.updatedAt = this.updatedAt || new Date(Date.now())
        }
       

    }


   
}

