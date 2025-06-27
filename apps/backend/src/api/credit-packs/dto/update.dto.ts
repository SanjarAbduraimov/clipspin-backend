import { PartialType } from '@nestjs/swagger'

import { CreateCreditPackDTO } from './create.dto'

export class UpdateCreditPackDTO extends PartialType(CreateCreditPackDTO) {}
