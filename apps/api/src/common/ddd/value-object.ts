/**
 * ValueObject — base for DDD value objects.
 *
 * Rules:
 *  - Immutable (props are frozen).
 *  - Equality by value, not identity.
 *  - Validated at construction via static factory methods.
 */
export abstract class ValueObject<TProps> {
  protected readonly props: TProps;

  protected constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  equals(other: ValueObject<TProps>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
