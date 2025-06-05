import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthGuard } from './api/auth/auth.guard'
import { AuthModule } from './api/auth/auth.module'
import { ProfileModule } from './api/profile/profile.module'
import { ProjectModule } from './api/projects/project.module'
import configuration from './config'

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
        const url = configService.get('redis.url')

        const parsed = new URL(url)

        return {
          url,
          redis: {
            password: parsed.password,
            username: parsed.username,
          },
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ProfileModule,
    ProjectModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
