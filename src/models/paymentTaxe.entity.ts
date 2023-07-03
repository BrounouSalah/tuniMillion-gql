import { Expose, plainToClass } from "class-transformer";
import { Column, Entity, ObjectIdColumn } from "typeorm";
import * as uuid from 'uuid';

@Entity({
	name: 'paymentTaxe',
	orderBy: {
		createdAt: 'ASC'
	}
})
export class PaymentTaxe {
    @Expose()
	@ObjectIdColumn()
	_id: string

    @Expose()
    @Column()
    userId: string

    @Expose()
    @Column()
    M75: number

    @Expose()
    @Column()
    TVA_CUMM: number

    @Expose()
    @Column()
    RunpayCost: number

    @Expose()
    @Column()
    CAG_CUMM: number

    @Expose()
    @Column()
    benefiet: number

    @Expose()
    @Column()
    total_ht: number

    @Expose()
    @Column()
    createdAt: Date

    @Expose()
    @Column()
    updatedAt: Date

    @Expose()
    @Column()
    deletedAt: Date


    constructor(paymentTaxe: Partial<PaymentTaxe>) {
        if (paymentTaxe) {
            Object.assign(this, plainToClass(PaymentTaxe, paymentTaxe, {excludeExtraneousValues: true}))

			this._id = this._id || uuid.v1()
            this.createdAt = this.createdAt || new Date(Date.now())
			this.updatedAt = this.updatedAt || new Date(Date.now())
        }

}
}
