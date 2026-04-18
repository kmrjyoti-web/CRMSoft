import { UpdateProductDto } from '../../../presentation/dto/update-product.dto';
export declare class UpdateProductCommand {
    readonly id: string;
    readonly data: UpdateProductDto;
    constructor(id: string, data: UpdateProductDto);
}
