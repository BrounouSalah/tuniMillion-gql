import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity, ObjectIdColumn, OneToMany } from 'typeorm';
import * as uuid from 'uuid';
import {TypeLimit} from '../generator/graphql.schema'


@Entity({
	name: 'userLimitation',
	orderBy: {
		createdAt: 'ASC'
	}
})

export class UserLimitation {
    @Expose()
	@ObjectIdColumn()
	_id: string

    @Expose()
    @Column()
    userId: string

    @Expose()
    @Column()
    limit: number

    @Expose()
    @Column()
    rest: number

    @Expose()
    @Column()
    type: TypeLimit

    @Expose()
    @Column()
    createdAt: Date

    @Expose()
    @Column()
    updatedAt: Date

    @Expose()
    @Column()
    deletedAt: Date




    constructor(userLimitations: Partial<UserLimitation>) {
        if (userLimitations) {
            Object.assign(this, plainToClass(UserLimitation, userLimitations, {excludeExtraneousValues: true}))

			this._id = this._id || uuid.v1()
            this.type = this.type || TypeLimit.SEMAINE
            this.createdAt = this.createdAt || new Date(Date.now())
            this.createdAt.setDate(this.createdAt.getDate() - 1);
			this.updatedAt = this.updatedAt || new Date(Date.now())
        }


    }




}

