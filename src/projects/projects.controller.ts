import {
  Controller,
  Get,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOAuth2, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { SystemRoles } from 'src/types/enums';
import { ProjectsDto } from './dto/projects.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiOAuth2([])
@Roles({
  roles: [SystemRoles.USERS],
})
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description:
      'Returns article or conferences qualis metrics for each professor.',
    isArray: true,
    type: ProjectsDto,
  })
  async get(
    @Query('groupByProfessor', ParseBoolPipe) groupByProfessor: boolean,
    @Query('groupByYear', ParseBoolPipe) groupByYear: boolean,
    @Query('startYear', ParseIntPipe) startYear: number,
    @Query('endYear', ParseIntPipe) endYear: number,
  ): Promise<ProjectsDto[]> {
    return await this.projectsService.get(
      groupByProfessor,
      groupByYear,
      startYear,
      endYear,
    );
  }
}
