import { Expose, Transform, Type } from 'class-transformer'

import { transform_object_id } from 'apps/backend/src/common/utils/transform-object-id'

import { SubscriptionPlanResponseDTO } from '../../subscription-plans/dto/response.dto'

export class SubscriptionCreditsDTO {
  @Expose()
  total: number

  @Expose()
  remaining: number
}

export class UserSubscriptionResponseDTO {
  @Expose()
  @Transform(transform_object_id)
  _id: string

  @Expose()
  @Type(() => SubscriptionPlanResponseDTO)
  subscription_plan: SubscriptionPlanResponseDTO

  @Expose()
  @Type(() => SubscriptionCreditsDTO)
  monthly_credits: SubscriptionCreditsDTO

  @Expose()
  @Type(() => SubscriptionCreditsDTO)
  purchased_credits: SubscriptionCreditsDTO

  @Expose()
  expires_at: string

  @Expose()
  created_at: string
}
