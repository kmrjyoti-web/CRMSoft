/**
 * Base Repository Interface.
 * All domain repositories implement this.
 * Domain layer defines the interface, infrastructure implements it.
 */
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

