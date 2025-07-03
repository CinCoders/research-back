import { Controller, Get, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ImportJsonService } from './import-json.service';
import { Public } from 'nest-keycloak-connect';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOAuth2, ApiTags } from '@nestjs/swagger';
import { extname } from 'path';
import { Response } from 'express';

@ApiTags('Import Json Module')
// @Roles({ roles: [SystemRoles.USERS] })
@Controller('import-json')
@ApiOAuth2([])
export class ImportJsonController {
    constructor (private readonly importJsonService: ImportJsonService) {}

    @Post()
    @Public()
     @UseInterceptors(
       FileInterceptor('file', {
      dest: 'downloadedFiles',
      fileFilter: (req, file, callback) => {
        if (extname(file.originalname) !== '.json' && extname(file.originalname) !== '.zip') {
          return callback(new Error('Only JSON and Zip files are allowed.'), false);
        }
        callback(null, true);
      },
    }),
      )
      
      async upload(
          //@AuthenticatedUser() user: any,
          @Res() res: Response,
          @UploadedFile() file: Express.Multer.File,
        ) {
          try {
            await this.importJsonService.processImportJson(file);
            return res.status(201).json({ message: 'Importação concluída com sucesso' });
          } catch (err) {
             console.error('Erro ao importar JSON:', err);
            return res.status(500).json({ error: 'Erro ao processar o arquivo' });
          }
        }

        @Get()
        @Public()
        async execute() {
          try {
            this.importJsonService.insertDataToDatabase()
          } catch (err) {
            console.log(err)
            return err
          }
        }
}