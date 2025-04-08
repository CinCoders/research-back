import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class IdentifierQueryParamsDTO {
  @IsOptional()
  @ValidateIf((dto) => !dto.lattes)
  @IsString()
  id?: string;

  @IsOptional()
  @ValidateIf((dto) => !dto.id)
  @IsString()
  lattes?: string;
}
