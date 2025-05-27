import { TransformFnParams } from 'class-transformer'

export const transform_object_id = (params: TransformFnParams) => params.obj._id
