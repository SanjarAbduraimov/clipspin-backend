import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import configuration from 'apps/backend/src/config'

import { AnalyzeVideoQueueModule } from './queus/analyze-video/analyze-video.module'
import { InputQueueModule } from './queus/input/input.module'
import { InputQueueProcessor } from './queus/input/input.processor'
import { InstagramParserQueueModule } from './queus/instagram-parser/instagram-parser.module'
import { SlideGeneratorQueueModule } from './queus/slide-show-generator/slide-show-generator.module'
import { TalkingHeadGeneratorQueueModule } from './queus/talking-head-generator/talking-head-generator.module'
import { TextAudiogramGeneratorQueueModule } from './queus/text-audiogram-generator/text-audiogram-generator.module'

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
        const url = configService.get('redis.url')

        return {
          url,
        }
      },
      inject: [ConfigService],
    }),
    TalkingHeadGeneratorQueueModule,
    TextAudiogramGeneratorQueueModule,
    SlideGeneratorQueueModule,
    AnalyzeVideoQueueModule,
    InstagramParserQueueModule,
    InputQueueModule,
  ],
  providers: [InputQueueProcessor],
})
export class ConsumersModule {}
