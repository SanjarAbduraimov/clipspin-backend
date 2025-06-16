import { BadRequestException } from '@nestjs/common'

export class BadRequestError extends BadRequestException {
  constructor(resource: string, data: Record<string, any> = {}) {
    const message = `bad request`
    const response = {
      message,
      error: 'bad_request_error',
      data: {
        resource,
        ...data,
      },
    }

    super(response)
  }
}
