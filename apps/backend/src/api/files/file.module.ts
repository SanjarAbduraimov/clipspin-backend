import { Global, Module } from '@nestjs/common'

import { R2Service } from '../../services/r2.service'
import { FileController } from './file.controller'

@Global()
@Module({
  imports: [],
  controllers: [FileController],
  providers: [R2Service],
})
export class FileModule {}
