import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOAuth2, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { SystemRoles } from 'src/types/enums';
import { AdviseeFormatDto } from './dto/advisee-format.dto';
import { ProfessorProjectFinancierDto } from './dto/professor-project-financier.dto';
import { ProfessorPublicationsDto } from './dto/professor-publications.dto';
import { ProfessorDto } from './dto/professor.dto';
import { Professor } from './entities/professor.entity';
import { ProfessorService } from './professor.service';
import { FilterValidationPipe } from './dto/parse-filter.pipe';
import { Response } from 'express';

@Roles({ roles: [SystemRoles.USERS] })
@ApiTags('Professor Module')
@Controller('professors')
@ApiOAuth2([])
export class ProfessorController {
  constructor(private readonly professorService: ProfessorService) {}
  @ApiResponse({
    status: 200,
    description: 'Returns list of professors.',
    isArray: true,
    type: ProfessorDto,
  })
  @Get()
  async get(): Promise<ProfessorDto[]> {
    return await this.professorService.findAll();
  }

  @ApiResponse({
    status: 200,
    description: 'Returns professor.',
    type: Professor,
  })
  @Get(':id')
  async getProfessor(@Param('id') id: string) {
    return await this.professorService.findOne(+id);
  }

  @ApiResponse({
    status: 200,
    description: 'Returns professor publications.',
    isArray: true,
    type: ProfessorPublicationsDto,
  })
  @Get(':id/publications')
  getPublications(
    @Param('id') id: string,
    @Query('journalPublications', ParseBoolPipe) journalPublications: boolean,
    @Query('conferencePublications', ParseBoolPipe)
    conferencePublications: boolean,
  ): Promise<ProfessorPublicationsDto[]> | [] {
    return this.professorService.getPublications(
      id,
      journalPublications,
      conferencePublications,
    );
  }

  @ApiResponse({
    status: 200,
    description: 'Returns professor students.',
    isArray: true,
    type: AdviseeFormatDto,
  })
  @Get(':id/students')
  getStudents(
    @Param('id') id: string,
    @Query('filter', FilterValidationPipe) filter: string,
  ): Promise<AdviseeFormatDto[]> {
    return this.professorService.getStudents(id, filter);
  }

  @ApiResponse({
    status: 200,
    description: 'Returns professor projects.',
    isArray: true,
    type: ProfessorProjectFinancierDto,
  })
  @Get(':id/projects')
  getProjects(
    @Param('id') id: string,
  ): Promise<ProfessorProjectFinancierDto[]> {
    return this.professorService.getProjects(id);
  }

  @ApiResponse({
    status: 200,
    description: 'Delete professor.',
    type: Professor,
  })
  @ApiResponse({ status: 404, description: 'Professor was not found' })
  @Delete(':id')
  async deleteProfessor(
    @AuthenticatedUser() user: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const deletedProfessor = await this.professorService.remove(
        +id,
        user.email,
      );
      return res.status(HttpStatus.OK).send(deletedProfessor);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === `No teacher was found with this id ${id}`
      ) {
        return res.status(HttpStatus.NOT_FOUND).send(err.message);
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }
  }
}
