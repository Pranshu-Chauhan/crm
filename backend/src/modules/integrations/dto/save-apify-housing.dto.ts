import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SaveApifyHousingDto {
  @ApiProperty({ example: 'username~housing-com-scraper' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  actorId: string;

  @ApiPropertyOptional({ description: 'Required for the first save. It is encrypted before storage.' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  token?: string;

  @ApiPropertyOptional({ example: { startUrls: [{ url: 'https://housing.com/in/buy' }], maxItems: 10 } })
  @IsOptional()
  @IsObject()
  actorInput?: Record<string, unknown>;
}
