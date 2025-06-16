import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

import { ProjectType } from 'apps/backend/src/models/project.schema'

export class ProjectTypePriceDTO {
  @IsString()
  @IsEnum(ProjectType)
  project_type: ProjectType

  @IsNumber()
  credit_cost: number
}

export class CreateSubscriptionPlanDTO {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  price: number

  @IsNumber()
  credits: number

  @IsArray()
  @ValidateNested()
  @Type(() => ProjectTypePriceDTO)
  project_type_prices: ProjectTypePriceDTO[]

  @IsString()
  stripe_price_id?: string
}
