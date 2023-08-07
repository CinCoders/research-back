import { Module } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [PublicationsController],
  providers: [PublicationsService],
  exports: [PublicationsService],
})
export class PublicationsModule {}
