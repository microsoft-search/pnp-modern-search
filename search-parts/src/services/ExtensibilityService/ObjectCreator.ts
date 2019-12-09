export class ObjectCreator {
  static createEntity<T>(type: {new(...args): T;}, ...args): T {
    return new type(...args);
  }
}
