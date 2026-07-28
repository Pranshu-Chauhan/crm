import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min, Max, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterAgencyDto {
  // Agency details
  @ApiProperty({ example: 'Skyline Realty' })
  @IsString()
  @IsNotEmpty()
  agencyName: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(10000)
  agentCount: number;

  @ApiPropertyOptional({ example: 'https://skylinerealty.in' })
  @IsOptional()
  @IsString()
  website?: string;

  // Admin user details
  @ApiProperty({ example: 'Priya' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'priya@skylinerealty.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass@123' })
  @IsString()
  @MinLength(8)
  password: string;
}
