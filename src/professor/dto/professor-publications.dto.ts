import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('ProfessorPublicationsDto')
export class ProfessorPublicationsDto {
	@ApiProperty({ name: 'title', type: String })
	title!: string;

	@ApiProperty({ name: 'eventJournal', type: String })
	eventJournal!: string | null;

	@ApiProperty({ name: 'eventJournal', type: Boolean })
	isEvent!: boolean;

	@ApiProperty({ name: 'acronymIssn', type: String })
	acronymIssn!: string | null;

	@ApiProperty({ name: 'type', type: String, enum: ['journal', 'conference'] })
	type!: string;

	@ApiProperty({ name: 'year', type: Number })
	year!: number;

	@ApiProperty({ name: 'qualis', type: String })
	qualis?: string;

	@ApiProperty({ name: 'isTop', type: Boolean })
	isTop?: boolean;

	@ApiProperty({ name: 'authors', type: String })
	authors!: string;

	@ApiProperty({ name: 'doi', type: String, nullable: true })
	doi?: string;
}
