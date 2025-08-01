import { IsOptional } from 'class-validator'

export class AdminProjectQueryDTO {
  // Direct field matches
  @IsOptional()
  type?: string

  @IsOptional()
  status?: string

  @IsOptional()
  user?: string

  // Bracket notation filters are handled dynamically by QueryFilterUtil
  // Examples:
  // status[$in][]=completed&status[$in][]=failed
  // user[$in][]=userId1&user[$in][]=userId2
  // created_at[$gte]=2024-01-01
  // created_at[$lte]=2024-12-31
  // type[$ne]=slide_show
}
