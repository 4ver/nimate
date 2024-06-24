import EventEmitter from 'eventemitter3';
import { TEasing } from 'ts-easing';
import { easing as e } from './easing';

export type AnimatableValue = number | number[] | { [key: string]: number | AnimatableValue };

interface AnimateOptions {
  from: AnimatableValue;
  to: AnimatableValue;
  duration: number;
  easing?: TEasing;
}

export class Animate extends EventEmitter {
  private from: AnimatableValue;
  private to: AnimatableValue;
  private duration: number;
  private easing: TEasing;
  private startTime: number;
  private requestId?: number;
  private previousValue: AnimatableValue;

  constructor({ from, to, duration, easing = e.linear }: AnimateOptions) {
    super();
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.easing = easing;
    this.startTime = performance.now();
    this.previousValue = from;
  }

  private interpolate(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  private updateValue(from: AnimatableValue, to: AnimatableValue, t: number): AnimatableValue {
    if (typeof from === 'number' && typeof to === 'number') {
      return this.interpolate(from, to, t);
    }

    if (Array.isArray(from) && Array.isArray(to)) {
      return from.map((start, index) =>
        typeof start === 'number' && typeof to[index] === 'number'
          ? this.interpolate(start, to[index], t)
          : start // For non-number elements, just return the original value
      );
    }

    if (typeof from === 'object' && typeof to === 'object') {
      const result: { [key: string]: number | AnimatableValue } = {};
      const fromObj = from as { [key: string]: number | AnimatableValue };
      const toObj = to as { [key: string]: number | AnimatableValue };

      for (const key in fromObj) {
        if (Object.prototype.hasOwnProperty.call(fromObj, key) && Object.prototype.hasOwnProperty.call(toObj, key) ) {
          if (typeof fromObj[key] === 'number' && typeof toObj[key] === 'number') {
            result[key] = this.interpolate(fromObj[key], toObj[key], t);
          } else if (typeof fromObj[key] === 'object' && typeof toObj[key] === 'object') {
            result[key] = this.updateValue(fromObj[key], toObj[key], t);
          } else {
            throw new Error('Unsupported value types');
          }
        }
      }
      return result;
    }

    throw new Error('Unsupported value types');
  }

  private tick = (now: number) => {
    try {
      const elapsed = now - this.startTime;
      const t = Math.min(1, elapsed / this.duration);
      const easedT = this.easing(t);

      const currentValue = this.updateValue(this.from, this.to, easedT);

      if (JSON.stringify(currentValue) !== JSON.stringify(this.previousValue)) {
        this.emit('update', currentValue);
        this.previousValue = currentValue;
      }

      if (t < 1) {
        this.requestId = requestAnimationFrame(this.tick);
      } else {
        this.emit('complete');
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  public start() {
    this.startTime = performance.now();
    this.emit('start');
    this.requestId = requestAnimationFrame(this.tick);
    return this;
  }

  public stop() {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.emit('stop');
    }
    return this;
  }
}
