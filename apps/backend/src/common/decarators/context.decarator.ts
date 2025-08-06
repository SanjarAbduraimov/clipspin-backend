import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { Request } from 'express'

import { UserDocument } from '../../models/user.schema'

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

    const user = request.user as UserDocument
    const skip =
      ((+Number(request.query._page) || 1) - 1) * +Number(request.query._limit)
    const limit = +Number(request.query._limit)

    const ctx: Context = {
      user,
      skip: isNaN(skip) ? 0 : skip,
      limit: isNaN(limit) ? 10 : limit,
    }

    return ctx
  },
)
