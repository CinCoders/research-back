import { Controller, Get, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiOAuth2, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { SystemRoles } from 'src/types/enums';
import { StudentsDto } from './dto/students.dto';
import { PostGraduationService } from './post-graduation.service';

@ApiTags('Post Graduation')
@Roles({ roles: [SystemRoles.USERS] })
@ApiOAuth2([])
@Controller('post-graduation')
export class PostGraduationController {
  constructor(private readonly postGraduationService: PostGraduationService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns postgraduates.',
    isArray: true,
    type: StudentsDto,
  })
  async get(
    @Query('groupByProfessor', ParseBoolPipe) groupByProfessor: boolean,
    @Query('groupByYear', ParseBoolPipe) groupByYear: boolean,
    @Query('filter') filter: 'current' | 'concluded',
    @Query('startYear') startYear: number,
    @Query('endYear') endYear: number,
  ): Promise<StudentsDto[]> {
    return await this.postGraduationService.get(groupByProfessor, groupByYear, filter, startYear, endYear);
  }
}
