import { NotFoundException } from '@nestjs/common'

import { capitalize } from '../utils/capitalize'

export class NotFoundError extends NotFoundException {
  constructor(resource: string, data: Record<string, any> = {}) {
    const resource_name = capitalize(resource)
    const message = `${resource_name} not found`
    const response = {
      message,
      error: 'not_found_error',
      data: {
        resource,
        ...data,
      },
    }

    super(response)
  }
}
