import { BadRequestException } from '@nestjs/common'

export class AlreadyExistsError extends BadRequestException {
  constructor(resource: string, data: Record<string, any> = {}) {
    const message = `already exists`
    const response = {
      message,
      error: 'already_exists_error',
      data: {
        resource,
        ...data,
      },
    }

    super(response)
  }
}
