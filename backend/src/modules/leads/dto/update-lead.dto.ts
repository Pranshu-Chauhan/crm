import { PartialType } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiPropertyOptional() @IsOptional() @IsString() lostReason?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() followUpDate?: string;
}
