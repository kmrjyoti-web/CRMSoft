import { IsString, IsEmail, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ description: 'Tenant name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique tenant slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Admin email address' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ description: 'Admin password (min 6 characters)', minLength: 6 })
  @IsString()
  @MinLength(6)
  adminPassword: string;

  @ApiProperty({ description: 'Admin first name' })
  @IsString()
  adminFirstName: string;

  @ApiProperty({ description: 'Admin last name' })
  @IsString()
  adminLastName: string;

  @ApiProperty({ description: 'Plan ID to subscribe to' })
  @IsUUID()
  planId: string;
}
