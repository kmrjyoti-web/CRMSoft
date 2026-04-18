import { CreatePriceListDto } from '../../../presentation/dto/create-price-list.dto';
export declare class CreatePriceListCommand {
    readonly dto: CreatePriceListDto;
    readonly createdById: string;
    constructor(dto: CreatePriceListDto, createdById: string);
}
