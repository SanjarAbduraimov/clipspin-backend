import { ExecutionContext, createParamDecorator } from '@nestjs/common'

import { QueryFilterUtil } from '../utils/query-filter.util'

export const QueryFilter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const query = QueryPaginationFilters(request.query)

    return QueryFilterUtil.convertToMongoFilter(query)
  },
)

export const QueryPaginationFilters = (query: Record<string, any>) => {
  const mongo_filter: Record<string, any> = {}
  const excluded_fields = ['_skip', '_limit', '_page']

  for (const key in query) {
    if (!excluded_fields.includes(key)) {
      mongo_filter[key] = query[key]
    }
  }

  return mongo_filter
}
