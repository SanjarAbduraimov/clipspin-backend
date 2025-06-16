import { Controller } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { UserSubscriptionService } from './user-subscription.service'

@ApiBearerAuth()
@ApiTags(UserSubscriptionController.resource_name)
@Controller('/api/user-subscriptions')
export class UserSubscriptionController {
  static resource_name = 'user-subscription'
  constructor(
    private readonly user_subscription_service: UserSubscriptionService,
  ) {}
}
