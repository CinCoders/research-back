import { Controller, Get, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiOAuth2, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { SystemRoles } from 'src/types/enums';
import { PatentsDto } from './dto/patents.dto';
import { PatentsService } from './patents.service';

@ApiTags('Patents')
@ApiOAuth2([])
@Roles({
  roles: [SystemRoles.USERS],
})
@Controller('patents')
export class PatentsController {
  constructor(private readonly patentsService: PatentsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns article or conferences qualis metrics for each professor.',
    isArray: true,
    type: PatentsDto,
  })
  async get(
    @Query('groupByProfessor', ParseBoolPipe) groupByProfessor: boolean,
    @Query('groupByYear', ParseBoolPipe) groupByYear: boolean,
  ): Promise<PatentsDto[]> {
    return await this.patentsService.get(groupByProfessor, groupByYear);
  }
}
