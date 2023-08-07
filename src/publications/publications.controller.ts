import { Controller, Get, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiOAuth2, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { SystemRoles } from 'src/types/enums';
import { PublicationsDto } from './dto/publications.dto';
import { PublicationsService } from './publications.service';

@ApiTags('Publications')
@Roles({
  roles: [SystemRoles.USERS],
})
@ApiOAuth2([])
@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}
  @Get()
  @ApiResponse({
    status: 200,
    description:
      'Returns article or conferences qualis metrics for each professor.',
    type: PublicationsDto,
    isArray: true,
  })
  async get(
    @Query('groupByProfessor', ParseBoolPipe) groupByProfessor: boolean,
    @Query('groupByYear', ParseBoolPipe) groupByYear: boolean,
    @Query('articles', ParseBoolPipe) articles: boolean,
    @Query('conferences', ParseBoolPipe) conferences: boolean,
  ): Promise<PublicationsDto[]> {
    return await this.publicationsService.get(
      articles,
      conferences,
      groupByProfessor,
      groupByYear,
    );
  }
}
