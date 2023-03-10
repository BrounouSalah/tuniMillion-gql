import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'

enum Type {
	VERIFY_EMAIL,
	FORGOT_PASSWORD,
	FINALIZE_REGISTRATION
}

@Entity({
	name: 'emails',
	orderBy: {
		createdAt: 'ASC'
	}
})
export class Email {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	userId: string

	@Expose()
	@Column()
	type: Type

	@Expose()
	@Column()
	isOpened: boolean

	@Expose()
	@Column()
	createdAt: number
	@Expose()
	@Column()
	updatedAt: number

	constructor(email: Partial<Email>) {
		if (email) {
			Object.assign(
				this,
				plainToClass(Email, email, {
					excludeExtraneousValues: true
				})
			)
			this._id = this._id || uuid.v1()
			this.isOpened = this.isOpened || false
			this.createdAt = this.createdAt || +new Date()
			this.updatedAt = +new Date()
		}
	}
}
