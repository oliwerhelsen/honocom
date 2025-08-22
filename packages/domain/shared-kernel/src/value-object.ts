export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(object?: ValueObject<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    return JSON.stringify(this.props) === JSON.stringify(object.props);
  }
}
