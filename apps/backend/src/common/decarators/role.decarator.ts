import { SetMetadata } from '@nestjs/common'

import { UserRole } from '../enums/role.enum'

export const ALLOWED_ROLES_KEY = 'allowed-roles'

export const AllowedRoles = (...roles: UserRole[]) =>
  SetMetadata(ALLOWED_ROLES_KEY, roles)
