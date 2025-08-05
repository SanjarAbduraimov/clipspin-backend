import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { R2Service } from 'apps/backend/src/services/r2.service'

import configuration from 'apps/backend/src/config'

import { AnalyzeVideoQueueModule } from './queus/analyze-video/analyze-video.module'
import { InputVideoParserQueueModule } from './queus/input-video-parser/input-video-parser.module'
import { MainQueueModule } from './queus/main-queue/main-queue.module'
import { MainQueueProcessor } from './queus/main-queue/main-queue.processor'
import { OutputQueueModule } from './queus/output/output.module'
import { SlideGeneratorQueueModule } from './queus/slide-show-generator/slide-show-generator.module'
import { TalkingHeadGeneratorQueueModule } from './queus/talking-head-generator/talking-head-generator.module'
import { TextAudiogramGeneratorQueueModule } from './queus/text-audiogram-generator/text-audiogram-generator.module'
import { Veo3GeneratorQueueModule } from './queus/veo3-generator/veo3-generator.module'

@Module({
  imports: [
    ConfigModule.forRoot(configuration),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get('database.uri'),
        user: config.get('database.user'),
        pass: config.get('database.password'),
        dbName: config.get('database.name'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('redis.host')
        const port = configService.get('redis.port')
        const username = configService.get('redis.username')
        const password = configService.get('redis.password')

        return {
          redis: {
            host,
            port,
            username,
            password,
          },
        }
      },
      inject: [ConfigService],
    }),
    Veo3GeneratorQueueModule,
    TalkingHeadGeneratorQueueModule,
    TextAudiogramGeneratorQueueModule,
    SlideGeneratorQueueModule,
    AnalyzeVideoQueueModule,
    InputVideoParserQueueModule,
    OutputQueueModule,
    MainQueueModule,
  ],
  providers: [MainQueueProcessor, R2Service],
})
export class ConsumersModule {}
