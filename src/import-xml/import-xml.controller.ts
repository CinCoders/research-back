import { Controller, Get, Param, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ImportXmlService } from './import-xml.service';
import { ApiOAuth2, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { extname } from 'path';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { SystemRoles } from 'src/types/enums';
import { ImportXmlDto } from './dto/import-xml.dto';
import { Page } from '../types/page.dto';

@ApiTags('Import XML Module')
@Roles({ roles: [SystemRoles.USERS] })
@Controller('import-xml')
@ApiOAuth2([])
export class ImportXmlController {
  constructor(private readonly importXmlService: ImportXmlService) {}

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      dest: 'downloadedFiles',
      fileFilter: (req, file, callback) => {
        if (extname(file.originalname) !== '.xml' && extname(file.originalname) !== '.zip') {
          return callback(new Error('Only XML and Zip files are allowed.'), false);
        }
        callback(null, true);
      },
    }),
  )
  async upload(
    @AuthenticatedUser() user: any,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    try {
      const username = `${user.name} (${user.email})`;
      await this.importXmlService.enqueueFiles(files, username);
      return res.sendStatus(201);
    } catch (err) {
      return res.sendStatus(500);
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Returns list of imported xmls',
    isArray: true,
  })
  @Get()
  async findAllXmlsPaginated(
    @Res() res: Response,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('offset') offset: number | undefined,
  ): Promise<Response<Page<ImportXmlDto[]>>> {
    const importedXmls = await this.importXmlService.findAllXmlsPaginated({
      limit: limit ?? 25,
      page: page ?? 0,
      offset: offset ?? (limit ?? 25) * (page ?? 0),
    });
    return res.status(200).send(importedXmls);
  }

  @ApiResponse({
    status: 200,
    description: 'Reprocesses the xml with the given id',
  })
  @Get(':id/reprocess')
  async reprocessXML(@Res() res: Response, @Param('id') id: string) {
    const importedXml = await this.importXmlService.reprocessXML(id);
    return res.status(200).send(importedXml);
  }

  @ApiResponse({
    status: 200,
    description: 'Imports the Lattes CVs of all professors',
  })
  @Post('professors/lattes/import')
  async importAllProfessors(@AuthenticatedUser() user: any, @Res() res: Response) {
    const username = `${user.name} (${user.email})`;
    await this.importXmlService.importAllProfessors(username);
    return res.sendStatus(200);
  }

  @ApiResponse({
    status: 200,
    description: 'Imports the Lattes CV of a specific professor by id',
  })
  @Post('professors/:id/lattes/import')
  async importProfessorById(@AuthenticatedUser() user: any, @Res() res: Response, @Param('id') id: string) {
    const username = `${user.name} (${user.email})`;
    await this.importXmlService.importProfessorById(id, username);
    return res.sendStatus(200);
  }
}
