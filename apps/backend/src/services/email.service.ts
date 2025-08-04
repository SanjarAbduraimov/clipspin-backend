import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CreateEmailOptions, Resend } from 'resend'

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
    idempotency_key,
    display_name,
  }: {
    subject: string
    text: string
    email: string
    idempotency_key?: string
    display_name?: string
  }) {
    const from = display_name ? `${display_name} <${this.from}>` : this.from

    const payload: CreateEmailOptions = {
      from,
      to: [email],
      text,
      subject,
    }

    const result = await this.client.emails.send(
      payload,
      idempotency_key
        ? {
            idempotencyKey: idempotency_key,
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
