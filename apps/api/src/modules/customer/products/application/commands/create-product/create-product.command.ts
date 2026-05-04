import { CreateProductDto } from '../../../presentation/dto/create-product.dto';

export class CreateProductCommand {
  constructor(
    public readonly data: CreateProductDto,
    public readonly createdById: string,
  ) {}
}
