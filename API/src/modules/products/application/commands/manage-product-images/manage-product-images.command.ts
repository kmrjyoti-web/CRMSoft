export class ManageProductImagesCommand {
  constructor(
    public readonly productId: string,
    public readonly images: any[],
  ) {}
}
