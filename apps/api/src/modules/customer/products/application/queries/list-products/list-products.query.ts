export class ListProductsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly sortBy: string,
    public readonly sortDir: 'asc' | 'desc',
    public readonly search?: string,
    public readonly status?: string,
    public readonly parentId?: string,
    public readonly isMaster?: boolean,
    public readonly brandId?: string,
    public readonly manufacturerId?: string,
    public readonly minPrice?: number,
    public readonly maxPrice?: number,
    public readonly taxType?: string,
    public readonly licenseRequired?: boolean,
    public readonly tags?: string,
  ) {}
}
