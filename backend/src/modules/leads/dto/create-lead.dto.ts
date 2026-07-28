import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsArray,
} from 'class-validator';
import { LeadSource, LeadStatus, BudgetRange, PropertyType } from '@prisma/client';

export class CreateLeadDto {
  @ApiProperty() @IsString() @MaxLength(100) firstName: string;
  @ApiProperty() @IsString() @MaxLength(100) lastName: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiProperty() @IsString() phone: string;
  @ApiPropertyOptional({ enum: LeadSource }) @IsOptional() @IsEnum(LeadSource) source?: LeadSource;
  @ApiPropertyOptional({ enum: LeadStatus }) @IsOptional() @IsEnum(LeadStatus) status?: LeadStatus;
  @ApiPropertyOptional({ enum: BudgetRange }) @IsOptional() @IsEnum(BudgetRange) budgetRange?: BudgetRange;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) budgetMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) budgetMax?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() preferredCity?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() preferredLocality?: string;
  @ApiPropertyOptional({ enum: PropertyType }) @IsOptional() @IsEnum(PropertyType) preferredType?: PropertyType;
  @ApiPropertyOptional() @IsOptional() @IsNumber() bedrooms?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedToId?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() externalId?: string;
}
