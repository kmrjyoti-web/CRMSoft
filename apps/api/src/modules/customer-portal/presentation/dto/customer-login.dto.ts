import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerLoginDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MyPassword@123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'tenant-uuid-here', description: 'Tenant ID (from subdomain or header)' })
  @IsString()
  tenantId: string;
}
