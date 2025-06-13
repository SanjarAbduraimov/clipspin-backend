import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import multer from 'multer'
import { Readable } from 'stream'

import { Public } from '../../common/decarators/public.decarator'
import { ResponseDTO } from '../../common/decarators/response.decarator'
import { NotFoundError } from '../../common/errors/not-fount.error'
import { R2Service } from '../../services/r2.service'
import { FileUploadResponseDTO } from './dto/response.dto'

// Create a multer instance
const upload = multer({ storage: multer.memoryStorage() })

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

  @Post()
  @ResponseDTO(FileUploadResponseDTO)
  @UseInterceptors({
    intercept: (context, next) => {
      const req = context.switchToHttp().getRequest()
      const res = context.switchToHttp().getResponse()
      return new Promise((resolve, reject) => {
        upload.single('file')(req, res, async (err: any) => {
          if (err) reject(err)
          resolve(next.handle())
        })
      })
    },
  })
  async upload(@Req() req: Request) {
    const file = req.file as Express.Multer.File

    if (!file) {
      throw new Error('No file uploaded')
    }

    const file_key = file.originalname

    await this.r2_service.upload_file({
      body: file.buffer,
      content_type: file.mimetype,
      key: file_key,
    })

    return {
      file_key,
    }
  }
}
