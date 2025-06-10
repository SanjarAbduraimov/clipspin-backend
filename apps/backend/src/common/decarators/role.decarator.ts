import { SetMetadata } from '@nestjs/common'

import { UserRole } from '../enums/role.enum'

export const ALLOWED_ROLES_KEY = 'allowed-roles'

export const AllowedRoles = (...roles: UserRole[]) =>
  SetMetadata(ALLOWED_ROLES_KEY, roles)

const RoleMap = {
  [UserRole.USER]: 1,
  [UserRole.EDITOR]: 2,
  [UserRole.ADMIN]: 3,
}

export const check_access = (role: UserRole, allowed_roles: UserRole[]) => {
  return allowed_roles.some((item) => RoleMap[item] <= RoleMap[role])
}
