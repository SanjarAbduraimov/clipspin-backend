import { IsEnum } from 'class-validator'

import { UserRole } from '../../../common/enums/role.enum'

export class UpdateRoleDTO {
  @IsEnum(UserRole)
  role: UserRole
}
