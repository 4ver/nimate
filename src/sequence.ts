import EventEmitter from 'eventemitter3';
import { Animate, AnimatableValue } from './animate';

type SequenceItem = Animate | Sequence;

interface SequenceOptions {
  items: SequenceItem[];
  parallel?: boolean;
}

export class Sequence extends EventEmitter {
  private items: SequenceItem[];
  private parallel: boolean;
  private currentIndex: number;
  private activeAnimates: number;

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
    } else if (!this.parallel) {
      this.next();
    } else if (this.currentIndex >= this.items.length && this.activeAnimates === 0) {
      this.emit('complete');
    }
  };

  private next = () => {
    if (this.currentIndex < this.items.length) {
      const item = this.items[this.currentIndex];
      this.currentIndex++;

      if (item instanceof Animate) {
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
    }
  };

  public start() {
    this.currentIndex = 0;
    this.activeAnimates = 0;
    this.emit('start');
    this.next();
    return this;
  }

  public stop() {
    this.items.forEach(item => {
      if (item instanceof Animate) {
        item.stop();
      } else if (item instanceof Sequence) {
        item.stop();
      }
    });
    this.emit('stop');
    return this;
  }
}
