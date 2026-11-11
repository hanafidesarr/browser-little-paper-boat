/**
 * Generic Object Pool for reusable game entities & effects.
 * Prevents runtime GC spikes during intensive particle or pickup spawning.
 */
export class ObjectPool<T> {
  private factory: () => T;
  private resetFn?: (item: T) => void;
  private pool: T[] = [];
  private activeCount: number = 0;

  constructor(factory: () => T, resetFn?: (item: T) => void, initialCapacity: number = 16) {
    this.factory = factory;
    this.resetFn = resetFn;

    for (let i = 0; i < initialCapacity; i++) {
      this.pool.push(this.factory());
    }
  }

  public get(): T {
    let item: T;
    if (this.pool.length > 0) {
      item = this.pool.pop()!;
    } else {
      item = this.factory();
    }
    this.activeCount++;
    return item;
  }

  public release(item: T): void {
    if (this.resetFn) {
      this.resetFn(item);
    }
    this.pool.push(item);
    this.activeCount = Math.max(0, this.activeCount - 1);
  }

  public getActiveCount(): number {
    return this.activeCount;
  }

  public clear(): void {
    this.pool = [];
    this.activeCount = 0;
  }
}
