import EventEmitter from 'eventemitter3';
import { Animate, AnimatableValue } from './animate';
import { Blend } from './blend';

type SequenceItem = Animate | Blend | Sequence;

interface SequenceOptions {
  items: SequenceItem[];
  parallel?: boolean;
}

export class Sequence extends EventEmitter {
  private items: SequenceItem[];
  private parallel: boolean;
  private currentIndex: number;
  private activeAnimates: number;

  private promiseResolver?: () => void;
  private currentPromise?: Promise<void>;

  constructor({ items, parallel = false }: SequenceOptions) {
    super();
    this.items = items;
    this.parallel = parallel;
    this.currentIndex = 0;
    this.activeAnimates = 0;
  }

  private handleComplete = () => {
    this.activeAnimates--;

    if (this.parallel && this.activeAnimates === 0) {
      this.emit('complete');
      if (this.promiseResolver) {
        this.promiseResolver();
        this.promiseResolver = undefined;
      }
    } else if (!this.parallel) {
      this.next();
    } else if (this.currentIndex >= this.items.length && this.activeAnimates === 0) {
      this.emit('complete');
      if (this.promiseResolver) {
        this.promiseResolver();
        this.promiseResolver = undefined;
      }
    }
  };

  private next = () => {
    if (this.currentIndex < this.items.length) {
      const item = this.items[this.currentIndex];
      this.currentIndex++;

      if (item instanceof Animate || item instanceof Blend) {
        this.activeAnimates++;
        item.on('update', (value: AnimatableValue) => this.emit('update', value));
        item.on('complete', this.handleComplete);
        item.start();
      } else if (item instanceof Sequence) {
        this.activeAnimates++;
        item.on('update', (value: AnimatableValue) => this.emit('update', value));
        item.on('complete', this.handleComplete);
        item.start();
      }

      if (this.parallel) {
        this.next();
      }
    } else if (!this.parallel && this.activeAnimates === 0) {
      this.emit('complete');
      if (this.promiseResolver) {
        this.promiseResolver();
        this.promiseResolver = undefined;
      }
    }
  };

  public start() {
    this.currentIndex = 0;
    this.activeAnimates = 0;
    this.emit('start');
    this.next();

    this.currentPromise = new Promise<void>((resolve) => {
      this.promiseResolver = resolve;
    });

    return this;
  }

  public stop() {
    this.items.forEach(item => {
      if (item instanceof Animate || item instanceof Blend) {
        item.stop();
      } else if (item instanceof Sequence) {
        item.stop();
      }
    });
    this.emit('stop');
    if (this.promiseResolver) {
      this.promiseResolver();
      this.promiseResolver = undefined;
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
}
