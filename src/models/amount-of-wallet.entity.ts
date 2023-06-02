import { Expose, plainToClass } from "class-transformer";
import { Currency } from "generator/graphql.schema";
import { Column, Entity, ObjectIdColumn } from "typeorm";
import * as uuid from 'uuid';


@Entity({
	name: 'amount-of-wallet',
	orderBy: {
		createdAt: 'ASC'
	}
})

export class AmountOfWallet {

    @Expose()
	@ObjectIdColumn()
	_id: string

    @Expose()
    @Column()
    userId:string

    @Expose()
    @Column()
    totalAmount: number

    @Expose()   
    @Column()
    currency:Currency

    @Expose()
    @Column()
    createdAt:Date

    @Expose()
    @Column()
    updatedAt:Date

    @Expose()
    @Column()
    deletedAt:Date
   

    constructor(amountOfWallet: Partial<AmountOfWallet>) {
        if (amountOfWallet){
            Object.assign(this, plainToClass(AmountOfWallet, amountOfWallet, {excludeExtraneousValues: true}))

			this._id = this._id || uuid.v1()
            this.createdAt = this.createdAt || new Date(Date.now())
			this.updatedAt = this.updatedAt || new Date(Date.now())
        }
       

    }


}