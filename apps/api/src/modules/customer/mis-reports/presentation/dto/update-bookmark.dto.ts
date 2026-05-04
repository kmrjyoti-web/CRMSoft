import { PartialType } from '@nestjs/swagger';
import { CreateBookmarkDto } from './create-bookmark.dto';

/**
 * DTO for updating an existing report bookmark.
 * All fields from CreateBookmarkDto are optional.
 */
export class UpdateBookmarkDto extends PartialType(CreateBookmarkDto) {}
