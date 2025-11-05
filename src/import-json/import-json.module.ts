import { Module } from '@nestjs/common';
import { ImportJsonService } from './import-json.service';
import { ImportJsonController } from './import-json.controller';
import { PostGraduationModule } from 'src/post-graduation/post-graduation.module';
import { ProfessorModule } from 'src/professor/professor.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { PublicationsModule } from 'src/publications/publications.module';
import { QualisModule } from 'src/qualis/qualis.module';

@Module({
  imports: [
    PublicationsModule,
    PostGraduationModule,
    ProjectsModule,
    ProfessorModule,
    QualisModule,
    PublicationsModule,
  ],
  providers: [ImportJsonService],
  controllers: [ImportJsonController]
})
export class ImportJsonModule {}
