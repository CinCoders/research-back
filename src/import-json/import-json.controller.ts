import { Controller, Get, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ImportJsonService } from './import-json.service';
import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiOAuth2, ApiTags } from '@nestjs/swagger';
import { SystemRoles } from 'src/types/enums';
import { extname } from 'path';
import { Response } from 'express';

@ApiTags('Import Json Module')
// @Roles({ roles: [SystemRoles.USERS] })
@Controller('import-json')
@ApiOAuth2([])
export class ImportJsonController {
    constructor (private readonly importJsonService: ImportJsonService) {}

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
          @UploadedFiles() file: Express.Multer.File,
        ) {
          try {
            await this.importJsonService.processImportJson(file);
            return res.sendStatus(201);
          } catch (err) {
            return res.sendStatus(500);
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
