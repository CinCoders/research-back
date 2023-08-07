import { Controller, Get, Body, Param, Patch, Post, Req } from '@nestjs/common';
import { JournalService } from './qualis.service';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { UpdateConferenceDto } from './dto/update-conference.dto';
import { ApiOAuth2, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Journal } from './entities/journal.entity';
import { Conference } from './entities/conference.entity';
import { ConferenceService } from './conference/conference.service';
import { CreateConferenceDto } from './dto/create-conference.dto';
import { CreateJournalDto } from './dto/create-journal.dto';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { SystemRoles } from 'src/types/enums';

@ApiTags('Qualis')
@ApiOAuth2([])
@Controller('qualis')
export class QualisController {
  constructor(
    private readonly journalsService: JournalService,
    private readonly conferencesService: ConferenceService,
  ) {}

  @ApiResponse({
    status: 201,
    description: 'Create conference and insert into database',
    type: CreateConferenceDto,
  })
  @Roles({ roles: [SystemRoles.ADMIN] })
  @Post('conferences')
  createConference(
    @AuthenticatedUser() user: any,
    @Body() createConferenceDto: CreateConferenceDto,
  ) {
    return this.conferencesService.create(createConferenceDto, user.email);
  }

  @ApiResponse({
    status: 201,
    description: 'Create journal and insert into database',
    type: CreateJournalDto,
  })
  @Roles({ roles: [SystemRoles.ADMIN] })
  @Post('journals')
  createJournal(
    @Body() createJournalDto: CreateJournalDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.journalsService.create(createJournalDto, user.email);
  }

  @ApiResponse({
    status: 200,
    description: 'Returns journals qualis.',
    type: Journal,
    isArray: true,
  })
  @Get('journals')
  @Roles({ roles: [SystemRoles.USERS] })
  findAllJournalsQualis() {
    return this.journalsService.findAll(undefined);
  }

  @ApiResponse({
    status: 200,
    description: 'Returns conference qualis.',
    type: Conference,
    isArray: true,
  })
  @Roles({ roles: [SystemRoles.USERS] })
  @Get('conferences')
  findAllConferencesQualis() {
    return this.conferencesService.findAll(undefined);
  }

  @ApiResponse({
    status: 200,
    description: 'Update conference qualis',
    type: UpdateConferenceDto,
  })
  @Roles({ roles: [SystemRoles.ADMIN] })
  @Patch('conferences/:id')
  updateConference(
    @AuthenticatedUser() user: any,
    @Param('id') id: string,
    @Body() updateConferenceDto: UpdateConferenceDto,
  ) {
    return this.conferencesService.update(+id, updateConferenceDto, user.email);
  }

  @ApiResponse({
    status: 200,
    description: 'Update journal qualis',
    type: UpdateJournalDto,
  })
  @Roles({ roles: [SystemRoles.ADMIN] })
  @Patch('journals/:id')
  updatePeriodic(
    @Param('id') id: number,
    @Body() updateJournals: UpdateJournalDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.journalsService.update(+id, updateJournals, user.email);
  }
}
