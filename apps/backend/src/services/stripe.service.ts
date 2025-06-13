import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as stripe from 'stripe'

@Injectable()
export class StripeService {
  private client: stripe.Stripe
  success_url: string
  cancel_url: string

  constructor(private configService: ConfigService) {
    const secret_key = this.configService.get('stripe.secret_key')

    this.client = new stripe.Stripe(secret_key)

    this.success_url = this.configService.get('stripe.success_url')
    this.cancel_url = this.configService.get('stripe.cancel_url')
  }

  async create_checkout_session(
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

  create_webhook_event(
    signature: string | string[],
    payload: any,
    secret: string,
  ) {
    const event = this.client.webhooks.constructEvent(
      payload,
      signature,
      secret,
    )

    return event
  }
}
