import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SaveHousingComDto {
  @ApiProperty({ description: 'Housing.com account ID provided during CRM registration' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  housingId: string;

  @ApiPropertyOptional({ description: 'Required on first save. Encrypted before storage.' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  secretKey?: string;
}
