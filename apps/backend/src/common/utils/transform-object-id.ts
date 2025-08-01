import { TransformFnParams } from 'class-transformer'

export const transform_object_id =
  (field: string = '_id') =>
  (params: TransformFnParams) =>
    params.obj[field]
