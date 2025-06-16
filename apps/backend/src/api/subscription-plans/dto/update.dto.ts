import { PartialType } from '@nestjs/swagger'

import { CreateSubscriptionPlanDTO } from './create.dto'

export class UpdateSubscriptionPlanDTO extends PartialType(
  CreateSubscriptionPlanDTO,
) {}
