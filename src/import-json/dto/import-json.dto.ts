export class ImportJsonDto {
  id!: string;
  name!: string;
  professor?: string;
  user!: string;
  status!: string;
  storedXml!: boolean;
  includedAt!: Date;
  importTime?: number;
}
