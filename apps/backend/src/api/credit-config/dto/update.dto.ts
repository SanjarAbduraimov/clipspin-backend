import { PartialType } from '@nestjs/swagger'

import { CreateCreditConfigDTO } from './create.dto'

export class UpdateCreditConfigDTO extends PartialType(CreateCreditConfigDTO) {}
