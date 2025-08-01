import { Types } from 'mongoose'

export class QueryFilterUtil {
  static convertToMongoFilter(queryDto: any): any {
    const mongo_filter: any = {}

    for (const [key, value] of Object.entries(queryDto)) {
      if (value === undefined || value === null) {
        continue
      }

      // Check if the value is already a MongoDB operator object (e.g., {$in: [...], $gte: ...})
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
      ) {
        mongo_filter[key] = this.processOperatorObject(value)
      }
      // Handle bracket notation for backwards compatibility
      else {
        const bracket_match = key.match(/^(.+)\[\$(.+)\](\[\])?$/)
        if (bracket_match) {
          const [, field, operator, is_array] = bracket_match

          if (!mongo_filter[field]) {
            mongo_filter[field] = {}
          }

          const mongo_operator = `$${operator}`
          let processed_value

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
          // Direct field match
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
          // Handle array operators
          result[operator] = Array.isArray(value)
            ? (value as any[]).map((v) => this.convertValue(v))
            : [this.convertValue(value)]
        } else if (operator === '$exists') {
          result[operator] = Boolean(value)
        } else if (operator === '$regex') {
          result[operator] = value
          result['$options'] = 'i'
        } else {
          // Handle other operators like $gte, $lte, $ne, etc.
          result[operator] = this.convertValue(value)
        }
      }
    }

    return result
  }

  private static convertValue(value: any): any {
    if (typeof value === 'string') {
      // Check if it's a MongoDB ObjectId using Mongoose's built-in validation
      if (Types.ObjectId.isValid(value)) {
        try {
          return new Types.ObjectId(value)
        } catch (error) {
          return value
        }
      }

      // Check if it's a date string
      const date_value = new Date(value)
      if (!isNaN(date_value.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        return date_value
      }
    }
    return value
  }
}
