import { Module } from '@nestjs/common';
import { PatentsController } from './patents.controller';
import { PatentsService } from './patents.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [PatentsController],
  providers: [PatentsService],
  exports: [PatentsService],
})
export class PatentsModule {}
