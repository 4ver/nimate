import EventEmitter from 'eventemitter3';
import { Animate, AnimatableValue } from './animate';

type BlendFunction = (values: AnimatableValue[]) => AnimatableValue;

interface BlendOptions {
  animates: Animate[];
  blendFunction: BlendFunction;
}

export class Blend extends EventEmitter {
  private animates: Animate[];
  private blendFunction: BlendFunction;
  private completedAnimations: Set<Animate>;

  constructor({ animates, blendFunction }: BlendOptions) {
    super();

    this.animates = animates;
    this.blendFunction = blendFunction;
    this.completedAnimations = new Set();

    this.animates.forEach(animate => {
      animate.on('update', this.updateHandler);
      animate.on('complete', () => this.completeHandler(animate));
    });
  }

  private updateHandler = () => {
    const values = this.animates.map(animate => animate.getCurrentValue());
    const blendedValue = this.blendFunction(values);

    this.emit('update', blendedValue);
  };

  private completeHandler = (animate: Animate) => {
    this.completedAnimations.add(animate);
    if (this.completedAnimations.size === this.animates.length) {
      this.emit('complete');
    }
  };

  public start() {
    this.completedAnimations.clear();
    this.animates.forEach(animate => animate.start());
    this.emit('start');
    return this;
  }

  public stop() {
    this.animates.forEach(animate => animate.stop());
    this.emit('stop');
    return this;
  }

  public setBlendFunction(blendFunction: BlendFunction) {
    this.blendFunction = blendFunction;
    return this;
  }

  public getCurrentValue(): AnimatableValue {
    const values = this.animates.map(animate => animate.getCurrentValue());
    return this.blendFunction(values);
  }

  public set(options: { blendFunction?: BlendFunction }) {
    if (options.blendFunction !== undefined) {
      this.setBlendFunction(options.blendFunction);
    }
  }
}
