import { ExecutionContext, createParamDecorator } from '@nestjs/common'

import { QueryFilterUtil } from '../utils/query-filter.util'

export const QueryFilter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const query = request.query

    return QueryFilterUtil.convertToMongoFilter(query)
  },
)
