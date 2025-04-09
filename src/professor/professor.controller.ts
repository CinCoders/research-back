import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Query,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOAuth2, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { ProfessorPatentDto } from 'src/patents/dto/professor-patent.dto';
import { SystemRoles } from 'src/types/enums';
import { AdviseeFormatDto } from './dto/advisee-format.dto';
import { IdentifierQueryParamsDTO } from './dto/identifier-query-params.dto';
import { FilterValidationPipe } from './dto/parse-filter.pipe';
import { ProfessorProjectFinancierDto } from './dto/professor-project-financier.dto';
import { ProfessorPublicationsDto } from './dto/professor-publications.dto';
import { ProfessorTableDto } from './dto/professor-table.dto';
import { Professor } from './entities/professor.entity';
import { ProfessorService } from './professor.service';

@ApiTags('Professor Module')
@Controller('professors')
@ApiOAuth2([])
export class ProfessorController {
  constructor(private readonly professorService: ProfessorService) {}
  @ApiResponse({
    status: 200,
    description: 'Returns list of professors.',
    isArray: true,
    type: ProfessorTableDto,
  })
  @Roles({ roles: [SystemRoles.USERS] })
  @Get()
  async get(): Promise<ProfessorTableDto[]> {
    return await this.professorService.findAll();
  }

  @ApiResponse({
    status: 200,
    description: 'Returns professor.',
    type: Professor,
  })
  @Public()
  @Get('find')
  async getProfessor(@Query() { id, lattes }: IdentifierQueryParamsDTO) {
    return await this.professorService.findOne(Number(id), lattes);
  }

  @ApiResponse({
    status: 200,
    description: 'Returns professor publications.',
    isArray: true,
    type: ProfessorPublicationsDto,
  })
  @Public()
  @Get('publications')
  getPublications(
    @Query('journalPublications', new ValidationPipe({ transform: true }))
    journalPublications?: boolean,
    @Query('conferencePublications', new ValidationPipe({ transform: true }))
    conferencePublications?: boolean,
    @Query('id', new ValidationPipe({ transform: true })) id?: string,
    @Query('lattes', new ValidationPipe({ transform: true })) lattes?: string,
  ): Promise<ProfessorPublicationsDto[]> | [] {
    if (!id && !lattes) {
      throw new BadRequestException(`At least one of the parameters [id, lattes] must be provided.`);
    } else if (id && lattes) {
      throw new BadRequestException(`Only one of the parameters [id, lattes] must be provided.`);
    }

    return this.professorService.getPublications(id, lattes, !!journalPublications, !!conferencePublications);
  }

  @ApiResponse({
    status: 200,
    description: 'Returns professor students.',
    isArray: true,
    type: AdviseeFormatDto,
  })
  @Public()
  @Get('students')
  getStudents(
    @Query('filter', FilterValidationPipe) filter: string,
    @Query('id', new ValidationPipe({ transform: true })) id?: string,
    @Query('lattes', new ValidationPipe({ transform: true })) lattes?: string,
  ): Promise<AdviseeFormatDto[]> {
    if (!id && !lattes) {
      throw new BadRequestException(`At least one of the parameters [id, lattes] must be provided.`);
    } else if (id && lattes) {
      throw new BadRequestException(`Only one of the parameters [id, lattes] must be provided.`);
    }

    return this.professorService.getStudents(filter, id, lattes);
  }

  @ApiResponse({
    status: 200,
    description: 'Returns professor projects.',
    isArray: true,
    type: ProfessorProjectFinancierDto,
  })
  @Public()
  @Get('projects')
  getProjects(@Query() { id, lattes }: IdentifierQueryParamsDTO): Promise<ProfessorProjectFinancierDto[]> {
    return this.professorService.getProjects(id, lattes);
  }

  @ApiResponse({
    status: 200,
    description: 'Returns professor patents.',
    isArray: true,
    type: ProfessorPatentDto,
  })
  @Public()
  @Get('patents')
  getPatents(@Query() { id, lattes }: IdentifierQueryParamsDTO): Promise<ProfessorPatentDto[]> {
    return this.professorService.getPatents(id, lattes);
  }

  @ApiResponse({
    status: 200,
    description: 'Delete professor.',
    type: Professor,
  })
  @ApiResponse({ status: 404, description: 'Professor was not found' })
  @Roles({ roles: [SystemRoles.USERS] })
  @Delete(':id')
  async deleteProfessor(@AuthenticatedUser() user: any, @Param('id') id: string, @Res() res: Response) {
    try {
      const deletedProfessor = await this.professorService.remove(+id, user.email);
      return res.status(HttpStatus.OK).send(deletedProfessor);
    } catch (err) {
      if (err instanceof Error && err.message === `No teacher was found with this id ${id}`) {
        return res.status(HttpStatus.NOT_FOUND).send(err.message);
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error');
    }
  }
}
