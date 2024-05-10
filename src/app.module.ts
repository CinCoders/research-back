import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { ImportXmlModule } from './import-xml/import-xml.module';
import { ProfessorModule } from './professor/professor.module';
import { QualisModule } from './qualis/qualis.module';
import { PublicationsModule } from './publications/publications.module';
import { PostGraduationModule } from './post-graduation/post-graduation.module';
import { ProjectsModule } from './projects/projects.module';
import {
  KeycloakConnectModule,
  AuthGuard,
  PolicyEnforcementMode,
  TokenValidation,
  RoleGuard,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { AppDataSource } from './app.datasource';
import { ScholarshipModule } from './scholarship/scholarship.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(AppDataSource.options),
    ScheduleModule.forRoot(),
    ImportXmlModule,
    ProfessorModule,
    QualisModule,
    PublicationsModule,
    PostGraduationModule,
    ProjectsModule,
    ScholarshipModule,
    KeycloakConnectModule.registerAsync({
      useFactory: () => {
        let keycloakConfig;
        if (process.env.KEYCLOAK_JSON) {
          keycloakConfig = JSON.parse(process.env.KEYCLOAK_JSON);
        }
        return {
          authServerUrl: keycloakConfig['auth-server-url'],
          realm: keycloakConfig['realm'],
          clientId: keycloakConfig['resource'],
          secret: keycloakConfig['credentials']['secret'],
          policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
          tokenValidation: TokenValidation.ONLINE,
        };
      },
    }),
    ScholarshipModule,
  ],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
