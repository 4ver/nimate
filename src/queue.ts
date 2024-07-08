import EventEmitter from 'eventemitter3';
import { Animate } from './animate';
import { Blend } from './blend';

type AnimationType = Animate | Blend;

export class Queue extends EventEmitter {
  private animations: AnimationType[] = [];
  private promiseResolver?: () => void;
  private currentPromise?: Promise<void>;

  constructor() {
    super();
  }

  public add(animation: AnimationType) {
    this.animations.push(animation);
    animation.on('start', () => this.emit('start', animation));
    animation.on('update', (value: any) => this.emit('update', value, animation));
    animation.on('complete', () => this.onAnimationComplete(animation));
    animation.on('stop', () => this.emit('stop', animation));

    // If this is the first animation added and no other animation is running, start it immediately
    if (this.animations.length === 1) {
      this.startNextAnimation();
    }
  }

  private startNextAnimation() {
    if (this.animations.length > 0) {
      const animation = this.animations[0];
      animation.start();
    } else {
      this.emit('complete'); // Emit complete event when all animations in the queue have completed
      if (this.promiseResolver) {
        this.promiseResolver();
        this.promiseResolver = undefined;
      }
    }
  }

  private onAnimationComplete(animation: AnimationType) {
    this.emit('complete', animation);
    this.animations.shift(); // Remove the completed animation from the queue
    this.startNextAnimation(); // Start the next animation in the queue
  }

  public clear() {
    if (this.animations.length > 0) {
      this.animations[0].stop();
    }
    this.animations = [];
  }

  public stop() {
    if (this.animations.length > 0) {
      this.animations[0].stop();
    }
    if (this.promiseResolver) {
      this.promiseResolver();
      this.promiseResolver = undefined;
    }
  }

  public promise(): Promise<void> {
    if (!this.currentPromise) {
      this.currentPromise = new Promise<void>((resolve) => {
        this.promiseResolver = resolve;
      });
    }
    return this.currentPromise;
  }
}
