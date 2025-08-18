import { PartialType } from '@nestjs/swagger'

import { CreateHeygenAvatarDTO } from './create.dto'

export class UpdateHeygenAvatarDTO extends PartialType(CreateHeygenAvatarDTO) {}
