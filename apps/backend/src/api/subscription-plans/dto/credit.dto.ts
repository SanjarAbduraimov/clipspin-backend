import { IsNumber } from 'class-validator'

export class PurchaseCreditDTO {
  @IsNumber()
  quantity: number
}
