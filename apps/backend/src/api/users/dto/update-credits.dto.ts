import { IsEnum, IsNumber, Min } from 'class-validator'

export enum CreditOperation {
  ADD = 'add',
  SUBTRACT = 'subtract',
}

export class UpdateCreditsDTO {
  @IsEnum(CreditOperation)
  operation: CreditOperation

  @IsNumber()
  @Min(1)
  amount: number
}
