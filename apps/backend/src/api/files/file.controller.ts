import { Controller, Get, Param, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { Readable } from 'stream'

import { Public } from '../../common/decarators/public.decarator'
import { NotFoundError } from '../../common/errors/not-fount.error'
import { R2Service } from '../../services/r2.service'

@ApiBearerAuth()
@ApiTags(FileController.resource_name)
@Controller('/api/files')
export class FileController {
  static resource_name = 'file'
  constructor(private readonly r2_service: R2Service) {}

  @Public()
  @Get('/:file_key')
  async get_file(@Param('file_key') file_key: string, @Res() res: Response) {
    try {
      const file = await this.r2_service.get_file(file_key)

      res.setHeader('Content-type', file.ContentType)

      const stream = file.Body as Readable

      stream.pipe(res)
    } catch (error) {
      throw new NotFoundError(FileController.resource_name, {
        file_key,
      })
    }
  }
}
