import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttachDocumentDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  documentId: string;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  entityType: string;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  entityId: string;
}

export class DetachDocumentDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  entityType: string;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  entityId: string;
}
