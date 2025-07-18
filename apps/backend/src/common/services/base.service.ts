import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, HydratedDocument, Model, Types } from 'mongoose'

import { Context, DEFAULT_CONTEXT } from '../decarators/context.decarator'

@Injectable()
export class BaseService<T> {
  constructor(@InjectModel('model') private model: Model<T>) {}

  async create(data: Partial<T>): Promise<HydratedDocument<T>> {
    const document = (await this.model.create(data)) as HydratedDocument<T>

    return document
  }

  async list(
    filter: FilterQuery<T>,
    context: Context = DEFAULT_CONTEXT,
  ): Promise<{ data: HydratedDocument<T>[]; total: number }> {
    const { skip = 0, limit, populate } = context

    const documents = await this.model
      .find<HydratedDocument<T>>(filter)
      .populate(populate)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })

    const total = await this.model.countDocuments(filter)

    return { data: documents, total }
  }

  async find(
    filter: FilterQuery<T>,
    context: Context = DEFAULT_CONTEXT,
  ): Promise<HydratedDocument<T>> {
    const { populate, select } = context

    const document = await this.model
      .findOne<HydratedDocument<T>>(filter)
      .populate(populate)
      .select(select)

    if (!document) return null

    return document
  }

  async retrieve(
    id: string | Types.ObjectId,
    context: Context = DEFAULT_CONTEXT,
  ): Promise<HydratedDocument<T> | null> {
    const { populate } = context

    const document = await this.model
      .findById<HydratedDocument<T>>(id)
      .populate(populate)

    if (!document) return null

    return document
  }

  async update(
    id: string | Types.ObjectId,
    data: Partial<T>,
    context: Context = DEFAULT_CONTEXT,
  ): Promise<HydratedDocument<T> | null> {
    const {} = context
    const document = await this.model.findByIdAndUpdate(id, data, { new: true })

    return document
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    await this.model.findByIdAndDelete(id)

    return true
  }
}
