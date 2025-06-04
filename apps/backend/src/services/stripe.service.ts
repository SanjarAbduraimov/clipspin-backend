import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as stripe from 'stripe'

@Injectable()
export class StripeService {
  private client: stripe.Stripe

  constructor(private configService: ConfigService) {
    const api_key = configService.get('stripe.api_key')

    this.client = new stripe.Stripe(api_key)
  }

  async createPaymentLink(
    price: string,
    referral?: string,
    metadata?: {
      user: string
      license: string
    },
  ): Promise<string> {
    const session = await this.client.checkout.sessions.create({
      billing_address_collection: 'auto',
      mode: 'setup',
      success_url: this.configService.get('stripe.successUrl'),
      cancel_url: this.configService.get('stripe.cancelUrl'),
      subscription_data: {
        metadata: {
          tolt_referral: referral,
          ...metadata,
        },
      },
      metadata,
    })

    return session.url
  }

  verifyStripeWebhookSignature(
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

  async createCreditLink(
    price: string,
    metadata?: {
      user: string
      team: string
    },
  ): Promise<string> {
    const session = await this.client.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price,
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: 10,
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: this.configService.get('stripe.successUrl'),
      cancel_url: this.configService.get('stripe.cancelUrl'),
      subscription_data: {
        metadata,
      },
      metadata,
    })

    return session.url
  }
}
