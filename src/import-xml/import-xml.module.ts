import { Module } from '@nestjs/common';
import { ImportXmlService } from './import-xml.service';
import { ImportXmlController } from './import-xml.controller';
import { ProfessorModule } from 'src/professor/professor.module';
import { QualisModule } from 'src/qualis/qualis.module';
import { PublicationsModule } from 'src/publications/publications.module';
import { PostGraduationModule } from 'src/post-graduation/post-graduation.module';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [
    PublicationsModule,
    PostGraduationModule,
    ProjectsModule,
    ProfessorModule,
    QualisModule,
    PublicationsModule,
  ],
  controllers: [ImportXmlController],
  providers: [ImportXmlService],
})
export class ImportXmlModule {}
