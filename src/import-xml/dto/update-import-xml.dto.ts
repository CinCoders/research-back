import { PartialType } from '@nestjs/mapped-types';
import { CreateImportXmlDto } from './create-import-xml.dto';

export class UpdateImportXmlDto extends PartialType(CreateImportXmlDto) {}
