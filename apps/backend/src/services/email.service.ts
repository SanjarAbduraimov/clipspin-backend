import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

@Injectable()
export class EmailService {
  client: Resend
  from: string

  constructor(private configService: ConfigService) {
    const api_key = configService.get('resend.api_key')
    this.from = configService.get('resend.from')

    this.client = new Resend(api_key)
  }

  async send({
    subject,
    text,
    email,
    idempotencyKey,
  }: {
    subject: string
    text: string
    email: string
    idempotencyKey?: string
  }) {
    const payload = {
      from: this.from,
      to: [email],
      text,
      subject,
    }

    const result = await this.client.emails.send(
      payload,
      idempotencyKey
        ? {
            idempotencyKey,
          }
        : undefined,
    )

    if (result.error) {
      console.error(result.error)

      throw result.error
    }

    return result.data.id
  }
}
