import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateCreditPackDTO {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  price: number

  @IsNumber()
  credits: number

  @IsString()
  stripe_price_id?: string
}
