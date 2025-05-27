import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { Request } from 'express'

import { UserDocument } from 'src/models/user.schema'

export interface Context {
  user?: UserDocument
  skip?: number
  limit?: number
  populate?: string | string[]
  select?:
    | string
    | string[]
    | Record<string, number | boolean | string | object>
}

export const DEFAULT_CONTEXT = {}

export const GetContext = createParamDecorator(
  (_: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>()

    // @ts-expect-error user
    const user = request.user

    const ctx: Context = {
      user,
    }

    return ctx
  },
)
