import { SchemaDirectiveVisitor } from 'graphql-tools'
import { defaultFieldResolver } from 'graphql'
import { AuthenticationError, ForbiddenError } from 'apollo-server-express'
import { hasAccessRole } from 'utils/roles/rolesAccess'

class PermissionDirective extends SchemaDirectiveVisitor {
	visitFieldDefinition(field) {
		const { resolve = defaultFieldResolver } = field
		const { permission } = this.args

		field.resolve = async function (...args) {
			const { currentUser } = args[2]

			if (!currentUser) {
				throw new AuthenticationError(
					'Authentication token is invalid, please try again.'
				)
			}

			if (!currentUser.userRole) {
				throw new ForbiddenError('You are not authorized for this resource.')
			}

			const userRole = currentUser.userRole

			// Check if the user's role has the required permission
			if (!hasAccessRole(currentUser, permission)) {
				throw new ForbiddenError('You are not authorized for this resource.')
			}

			return resolve.apply(this, args)
		}
	}
}

export default PermissionDirective
