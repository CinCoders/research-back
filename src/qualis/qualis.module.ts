import { Module } from '@nestjs/common';
import { JournalService } from './qualis.service';
import { QualisController } from './qualis.controller';
import { Journal } from './entities/journal.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conference } from './entities/conference.entity';
import { ConferenceService } from './conference/conference.service';

@Module({
  imports: [TypeOrmModule.forFeature([Journal, Conference])],
  controllers: [QualisController],
  providers: [JournalService, ConferenceService],
  exports: [JournalService, ConferenceService],
})
export class QualisModule {}
