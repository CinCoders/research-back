export class ImportJsonDto {
  id!: string;
  name!: string;
  professor?: string;
  user!: string;
  status!: string;
  storedJson!: boolean;
  includedAt!: Date;
  importTime?: number;
}
