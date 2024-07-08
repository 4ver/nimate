import EventEmitter from 'eventemitter3';
import sync, { cancelSync, Process } from 'framesync';
import { TEasing } from 'ts-easing';
import { easing as e } from './easing';

export type AnimatableValue = number | number[] | { [key: string]: number | AnimatableValue };

interface AnimateOptions {
  from: AnimatableValue;
  to: AnimatableValue;
  duration: number;
  easing?: TEasing;
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
  loop?: number;
}

interface SetOptions {
  from?: AnimatableValue;
  to?: AnimatableValue;
  duration?: number;
  easing?: TEasing;
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
  loop?: number;
}

export class Animate extends EventEmitter {
  private from: AnimatableValue;
  private to: AnimatableValue;
  private duration: number;
  private easing: TEasing;
  private delay: number;
  private direction: 'normal' | 'reverse' | 'alternate';
  private loop: number;
  private startTime: number;
  private process?: Process;
  private currentValue: AnimatableValue;
  private loopsCompleted: number;
  private isReversed: boolean;
  private hasCompleted: boolean;

  private promiseResolver?: () => void;
  private currentPromise?: Promise<void>;

  constructor({
    from,
    to,
    duration,
    easing = e.linear,
    delay = 0,
    direction = 'normal',
    loop = 1,
  }: AnimateOptions) {
    super();

    // Validate the options
    if (!this.isValidAnimatableValue(from) || !this.isValidAnimatableValue(to)) {
      throw new Error('Invalid animatable value');
    }

    if (typeof duration !== 'number' || duration <= 0) {
      throw new Error('Duration must be a positive number');
    }

    if (typeof delay !== 'number' || delay < 0) {
      throw new Error('Delay must be a non-negative number');
    }

    if (!['normal', 'reverse', 'alternate'].includes(direction)) {
      throw new Error('Invalid direction');
    }

    if (typeof loop !== 'number' || loop < 0) {
      throw new Error('Loop must be a non-negative number');
    }

    this.from = from;
    this.to = to;
    this.duration = duration;
    this.easing = easing;
    this.delay = delay;
    this.direction = direction;
    this.loop = loop;
    this.startTime = performance.now();
    this.loopsCompleted = 0;
    this.isReversed = direction === 'reverse';
    this.hasCompleted = false;
    this.currentValue = from;
  }

  private isValidAnimatableValue(value: any): boolean {
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.every(val => typeof val === 'number' || this.isValidAnimatableValue(val));
    if (typeof value === 'object') {
      return Object.values(value).every(val => typeof val === 'number' || this.isValidAnimatableValue(val));
    }
    return false;
  }

  private interpolate(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  private getInterpolatedValue(from: AnimatableValue, to: AnimatableValue, t: number): AnimatableValue {
    if (typeof from === 'number' && typeof to === 'number') {
      return this.interpolate(from, to, t);
    }

    if (Array.isArray(from) && Array.isArray(to)) {
      return from.map((start, index) =>
        typeof start === 'number' && typeof to[index] === 'number'
          ? this.interpolate(start, to[index], t)
          : start
      );
    }

    if (typeof from === 'object' && typeof to === 'object') {
      const result: { [key: string]: number | AnimatableValue } = {};
      const fromObj = from as { [key: string]: number | AnimatableValue };
      const toObj = to as { [key: string]: number | AnimatableValue };

      for (const key in fromObj) {
        if (Object.prototype.hasOwnProperty.call(fromObj, key) && Object.prototype.hasOwnProperty.call(toObj, key)) {
          if (typeof fromObj[key] === 'number' && typeof toObj[key] === 'number') {
            result[key] = this.interpolate(fromObj[key], toObj[key], t);
          } else if (typeof fromObj[key] === 'object' && typeof toObj[key] === 'object') {
            result[key] = this.getInterpolatedValue(fromObj[key], toObj[key], t);
          } else {
            throw new Error('Unsupported value types');
          }
        }
      }
      return result;
    }

    throw new Error('Unsupported value types');
  }

  private tick = ({ timestamp }: { timestamp: number }) => {
    const elapsed = timestamp - this.startTime - this.delay;

    if (elapsed < 0) {
      this.process = sync.update(this.tick, true);
      return;
    }

    let t = Math.min(1, elapsed / this.duration);
    if (this.isReversed) t = 1 - t;
    const easedT = this.easing(t);

    const currentValue = this.getInterpolatedValue(this.from, this.to, easedT);
    this.currentValue = currentValue;

    this.emit('update', currentValue);

    // Check if animation is complete
    if ((!this.isReversed && t < 1) || (this.isReversed && t > 0)) {
      this.process = sync.update(this.tick, true);
    } else {
      this.loopsCompleted += 1;
      if (this.direction === 'alternate') {
        this.isReversed = !this.isReversed;
      }

      if (this.loop === Infinity || this.loopsCompleted < this.loop) {
        this.startTime = timestamp;
        this.process = sync.update(this.tick, true);
      } else if (!this.hasCompleted) {
        if (this.process !== undefined) cancelSync.update(this.process);
        this.hasCompleted = true;
        this.emit('complete');
        if (this.promiseResolver) {
          this.promiseResolver();
          this.promiseResolver = undefined;
        }
      }
    }
  }

  public start() {
    this.startTime = performance.now();
    this.loopsCompleted = 0;
    this.isReversed = this.direction === 'reverse';
    this.hasCompleted = false;
    this.emit('start');
    this.process = sync.update(this.tick, true);

    this.currentPromise = new Promise<void>((resolve) => {
      this.promiseResolver = resolve;
    });

    return this;
  }

  public getCurrentValue(): AnimatableValue {
    return this.currentValue;
  }

  public stop() {
    if (this.process !== undefined) {
      cancelSync.update(this.process);
      this.emit('stop');
      if (this.promiseResolver) {
        this.promiseResolver();
        this.promiseResolver = undefined;
      }
    }
    return this;
  }

  public promise(): Promise<void> {
    if (!this.currentPromise) {
      this.currentPromise = new Promise<void>((resolve) => {
        this.promiseResolver = resolve;
      });
    }
    return this.currentPromise;
  }

  public set(options: SetOptions) {
    if (options.from !== undefined) {
      if (!this.isValidAnimatableValue(options.from)) {
        throw new Error('Invalid animatable value');
      }
      this.from = options.from;
    }

    if (options.to !== undefined) {
      if (!this.isValidAnimatableValue(options.to)) {
        throw new Error('Invalid animatable value');
      }
      this.to = options.to;
    }

    if (options.duration !== undefined) {
      if (typeof options.duration !== 'number' || options.duration <= 0) {
        throw new Error('Duration must be a positive number');
      }
      this.duration = options.duration;
    }

    if (options.easing !== undefined) {
      this.easing = options.easing;
    }

    if (options.delay !== undefined) {
      if (typeof options.delay !== 'number' || options.delay < 0) {
        throw new Error('Delay must be a non-negative number');
      }
      this.delay = options.delay;
    }

    if (options.direction !== undefined) {
      if (!['normal', 'reverse', 'alternate'].includes(options.direction)) {
        throw new Error('Invalid direction');
      }
      this.direction = options.direction;
      this.isReversed = options.direction === 'reverse';
    }

    if (options.loop !== undefined) {
      if (typeof options.loop !== 'number' || options.loop < 0) {
        throw new Error('Loop must be a non-negative number');
      }
      this.loop = options.loop;
      this.loopsCompleted = 0;
    }

    // Restart the animation with updated properties
    this.startTime = performance.now();
    if (this.process !== undefined) {
      cancelSync.update(this.process);
    }
    this.process = sync.update(this.tick, true);
  }
}
