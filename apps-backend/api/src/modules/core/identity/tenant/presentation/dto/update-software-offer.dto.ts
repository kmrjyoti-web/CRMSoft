import { PartialType } from '@nestjs/swagger';
import { CreateSoftwareOfferDto } from './create-software-offer.dto';

export class UpdateSoftwareOfferDto extends PartialType(CreateSoftwareOfferDto) {}
