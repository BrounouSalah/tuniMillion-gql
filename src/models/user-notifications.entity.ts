import { Expose, plainToClass } from 'class-transformer'
import { Column, Entity, ObjectIdColumn, OneToMany } from 'typeorm'
import * as uuid from 'uuid'
import { TypeLimit, VerificationStatus } from '../generator/graphql.schema'

@Entity({
	name: 'userNotifications',
	orderBy: {
		createdAt: 'ASC'
	}
})
export class UserNotifications {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	userId: string

	@Expose()
	@Column()
	isOpen: boolean

	@Expose()
	@Column()
	title: string

	@Expose()
	@Column()
	message: string

	@Expose()
	@Column()
	verificationStatus: VerificationStatus

	@Expose()
	@Column()
	createdAt: Date

	@Expose()
	@Column()
	updatedAt: Date

	@Expose()
	@Column()
	deletedAt: Date

	constructor(userNotifications: Partial<UserNotifications>) {
		if (userNotifications) {
			Object.assign(
				this,
				plainToClass(UserNotifications, userNotifications, {
					excludeExtraneousValues: true
				})
			)

			this._id = this._id || uuid.v1()
			this.isOpen = this.isOpen || false
			this.createdAt = this.createdAt || new Date(Date.now())
			this.updatedAt = this.updatedAt || new Date(Date.now())
		}
	}
}
