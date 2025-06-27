import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as stripe from 'stripe'

@Injectable()
export class StripeService {
  private client: stripe.Stripe
  success_url: string
  cancel_url: string
  webhook_secret: string

  constructor(private config_service: ConfigService) {
    const secret_key = this.config_service.get('stripe.secret_key')

    this.client = new stripe.Stripe(secret_key)

    this.success_url = this.config_service.get('stripe.success_url')
    this.cancel_url = this.config_service.get('stripe.cancel_url')
    this.webhook_secret = this.config_service.get('stripe.webhook_secret')
  }

  async create_subscription_session(
    price_id: string,
    metadata: Record<string, any>,
  ) {
    const session = await this.client.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: this.success_url,
      cancel_url: this.cancel_url,
      allow_promotion_codes: true,
      metadata,
    })

    return session
  }

  async create_credit_purchase_session(
    price_id: string,
    metadata: Record<string, any>,
  ) {
    const session = await this.client.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: this.success_url,
      cancel_url: this.cancel_url,
      allow_promotion_codes: true,
      metadata,
    })

    return session
  }

  create_webhook_event(signature: string | string[], body: any) {
    const event = this.client.webhooks.constructEvent(
      body,
      signature,
      this.webhook_secret,
    )

    return event
  }
}
