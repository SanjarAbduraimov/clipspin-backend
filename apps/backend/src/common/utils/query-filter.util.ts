import { Types } from 'mongoose'

const reserved_operators = ['_page', '_limit', '_sort', '_populate', '_select']

export class QueryFilterUtil {
  static convertToMongoFilter(queryDto: any): any {
    const mongo_filter: any = {}

    for (const [key, value] of Object.entries(queryDto)) {
      if (this.is_reserved_operator(key)) {
        continue
      }

      if (value === undefined || value === null) {
        continue
      }

      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
      ) {
        mongo_filter[key] = this.processOperatorObject(value)
      } else {
        const bracket_match = key.match(/^(.+)\[\$(.+)\](\[\])?$/)
        if (bracket_match) {
          const [, field, operator, is_array] = bracket_match

          if (!mongo_filter[field]) {
            mongo_filter[field] = {}
          }

          const mongo_operator = `$${operator}`
          let processed_value: any

          if (is_array || operator === 'in' || operator === 'nin') {
            processed_value = Array.isArray(value)
              ? value.map((v) => this.convertValue(v))
              : [this.convertValue(value)]
          } else {
            processed_value = this.convertValue(value)
          }

          if (operator === 'exists') {
            processed_value = Boolean(processed_value)
          }

          if (operator === 'regex') {
            mongo_filter[field] = { $regex: processed_value, $options: 'i' }
          } else {
            mongo_filter[field][mongo_operator] = processed_value
          }
        } else {
          mongo_filter[key] = this.convertValue(value)
        }
      }
    }

    return mongo_filter
  }

  private static processOperatorObject(operatorObj: any): any {
    const result: any = {}

    for (const [operator, value] of Object.entries(operatorObj)) {
      if (operator.startsWith('$')) {
        if (operator === '$in' || operator === '$nin') {
          result[operator] = Array.isArray(value)
            ? (value as any[]).map((v) => this.convertValue(v))
            : [this.convertValue(value)]
        } else if (operator === '$exists') {
          result[operator] = Boolean(value)
        } else if (operator === '$regex') {
          result[operator] = value
          result['$options'] = 'i'
        } else {
          result[operator] = this.convertValue(value)
        }
      }
    }

    return result
  }

  private static convertValue(value: any): any {
    if (typeof value === 'string') {
      if (Types.ObjectId.isValid(value)) {
        try {
          return new Types.ObjectId(value)
        } catch (error) {
          return value
        }
      }

      const date_value = new Date(value)
      if (!isNaN(date_value.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        return date_value
      }
    }
    return value
  }

  private static is_reserved_operator(key: string): boolean {
    return reserved_operators.includes(key)
  }
}
