import { Injectable } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import path = require('path');

@Injectable()
export class UploadOptions {
  getMulterOptions() {
    const multerOptions: MulterOptions = {
      dest: process.env.XML_PATH,
      fileFilter: (req, file, callback) => {
        if (path.extname(file.originalname) !== '.xml') {
          return callback(new Error('Only XML files are allowed.'), false);
        }
        callback(null, true);
      },
    };

    return multerOptions;
  }
}
