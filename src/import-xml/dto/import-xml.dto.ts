export class ImportXmlDto {
  name!: string;
  professor?: string;
  user!: string;
  status!: string;
  reprocessFlag!: boolean;
  includedAt!: Date;
  importTime?: number;
}
