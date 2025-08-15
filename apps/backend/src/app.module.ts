import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthGuard } from './api/auth/auth.guard'
import { AuthModule } from './api/auth/auth.module'
import { CreditPackModule } from './api/credit-packs/credit-pack.module'
import { FileModule } from './api/files/file.module'
import { HeygenAvatarModule } from './api/heygen-avatars/heygen-avatar.module'
import { HeygenVoiceModule } from './api/heygen-voices/heygen-voice.module'
import { ProfileModule } from './api/profile/profile.module'
import { ProjectModule } from './api/projects/project.module'
import { SubscriptionPlanModule } from './api/subscription-plans/subscription-plan.module'
import { UserSubscriptionModule } from './api/user-subscriptions/user-subscription.module'
import { UsersModule } from './api/users/users.module'
import configuration from './config'
import { LoggerMiddleware } from './middlewares/request-logger'

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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('jwt_secret'),
      }),
      inject: [ConfigService],
      global: true,
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
    AuthModule,
    ProfileModule,
    ProjectModule,
    FileModule,
    SubscriptionPlanModule,
    UserSubscriptionModule,
    CreditPackModule,
    UsersModule,
    HeygenVoiceModule,
    HeygenAvatarModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
