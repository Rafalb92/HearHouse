import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createTypeOrmConfig } from './typeorm.config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createTypeOrmConfig(config.getOrThrow<string>('DATABASE_URL')),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
