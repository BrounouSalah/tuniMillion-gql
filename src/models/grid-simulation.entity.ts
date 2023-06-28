import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity, ObjectIdColumn, OneToMany } from 'typeorm';
import * as uuid from 'uuid';


@Entity({
	name: 'grid-simiulation',
	orderBy: {
		createdAt: 'ASC'
	}
})

export class GridSimulation {
    @Expose()
	@ObjectIdColumn()
	_id: string

    @Expose()
    @Column()
    userId: string

    @Expose()
    @Column()
    numbers: number[]

    @Expose()
    @Column()
    stars: number[]

    @Expose()
    @Column()
    price: number


    @Expose()
    @Column()
    createdAt: Date

    @Expose()
    @Column()
    updatedAt: Date

    @Expose()
    @Column()
    deletedAt: Date


    constructor(gridSimulation: Partial<GridSimulation>) {
        if (gridSimulation) {
            Object.assign(this, plainToClass(GridSimulation, gridSimulation, {excludeExtraneousValues: true}))

			this._id = this._id || uuid.v1()
            this.createdAt = this.createdAt || new Date(Date.now())
			this.updatedAt = this.updatedAt || new Date(Date.now())
        }


    }



}

