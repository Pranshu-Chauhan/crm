import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'priya@skylinerealty.in' })
  @IsEmail()
  email: string;
}
