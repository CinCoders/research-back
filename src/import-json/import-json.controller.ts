import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImportJsonService } from './import-json.service';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOAuth2, ApiResponse, ApiTags } from '@nestjs/swagger';
import { extname } from 'path';
import { Response } from 'express';
import { ImportJsonDto } from './dto/import-json.dto';
import { Page } from 'src/types/page.dto';
import { SystemRoles } from 'src/types/enums';

@ApiTags('Import Json Module')
@Roles({ roles: [SystemRoles.USERS] })
@Controller('import-json')
@ApiOAuth2([])
export class ImportJsonController {
  constructor(private readonly importJsonService: ImportJsonService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'downloadedFiles',
      fileFilter: (req, file, callback) => {
        if (extname(file.originalname) !== '.json') {
          return callback(new Error('Only JSON files are allowed.'), false);
        }
        callback(null, true);
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async upload(@AuthenticatedUser() user: any, @UploadedFile() file: Express.Multer.File) {
    const username = `${user.name} (${user.email})`;
    await this.importJsonService.processImportJson(file, username);
    return { message: 'Importação concluída com sucesso' };
  }

  @ApiResponse({
    status: 200,
    description: 'Returns list of imported jsons',
    isArray: true,
  })
  @Get()
  async findAllJsons(
    @Res() res: Response,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('offset') offset: number | undefined,
  ): Promise<Response<Page<ImportJsonDto[]>>> {
    const importedJsons = await this.importJsonService.findAll({
      limit: limit ?? 25,
      page: page ?? 0,
      offset: offset ?? (limit ?? 25) * (page ?? 0),
    });
    return res.status(200).send(importedJsons);
  }

  @ApiResponse({
    status: 200,
    description: 'Reprocesses the json with the given id',
  })
  @Get(':id/reprocess')
  async reprocessJSON(@Res() res: Response, @Param('id') id: string) {
    const importedXml = await this.importJsonService.reprocessJson(id);
    return res.status(200).send(importedXml);
  }
}
