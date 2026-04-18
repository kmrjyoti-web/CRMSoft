import { CreateProductDto } from '../../../presentation/dto/create-product.dto';
export declare class CreateProductCommand {
    readonly data: CreateProductDto;
    readonly createdById: string;
    constructor(data: CreateProductDto, createdById: string);
}
