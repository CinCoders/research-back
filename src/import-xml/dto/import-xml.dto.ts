export class ImportXmlDto {
  id!: string;
  name!: string;
  professor?: string;
  user!: string;
  status!: string;
  reprocessFlag!: boolean;
  includedAt!: Date;
  importTime?: number;
}
