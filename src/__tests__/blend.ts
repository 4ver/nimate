import { Animate, AnimatableValue } from '../animate';
import { Blend } from '../blend'; // Assuming the Blend class is in a file named blend.ts
import { easing as e } from '../easing';

describe('Blend', () => {
  it('should emit start event', done => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: e.linear,
    });

    const animate2 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: e.linear,
    });

    const blend = new Blend({
      animates: [animate1, animate2],
      blendFunction: values => {
        const numValues = values as number[];
        return numValues.reduce((a, b) => a + b, 0) / numValues.length;
      },
    });

    blend.on('start', () => {
      done();
    });

    blend.start();
  });

  it('should emit update events with blended values', done => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: e.linear,
    });

    const animate2 = new Animate({
      from: 0,
      to: 50,
      duration: 30,
      easing: e.linear,
    });

    const blend = new Blend({
      animates: [animate1, animate2],
      blendFunction: values => {
        const numValues = values as number[];
        return numValues.reduce((a, b) => a + b, 0) / numValues.length;
      },
    });

    blend.on('update', value => {
      expect(typeof value).toBe('number');
    });

    blend.on('complete', () => {
      done();
    });

    blend.start();
  });

  it('should emit complete event', done => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: e.linear,
    });

    const animate2 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: e.linear,
    });

    const blend = new Blend({
      animates: [animate1, animate2],
      blendFunction: values => {
        const numValues = values as number[];
        return numValues.reduce((a, b) => a + b, 0) / numValues.length;
      },
    });

    blend.on('complete', () => {
      done();
    });

    blend.start();
  });

  it('should handle blend function correctly', done => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: e.linear,
    });

    const animate2 = new Animate({
      from: 100,
      to: 200,
      duration: 30,
      easing: e.linear,
    });

    const blend = new Blend({
      animates: [animate1, animate2],
      blendFunction: values => {
        const numValues = values as number[];
        return numValues.reduce((a, b) => a + b, 0) / numValues.length;
      },
    });

    let lastValue = -1;

    blend.on('update', value => {
      expect(value).toBeGreaterThan(lastValue);
      lastValue = value;
    });

    blend.on('complete', () => {
      done();
    });

    blend.start();
  });

  it('should handle complex blend function', done => {
    const animate1 = new Animate({
      from: { r: 0, g: 0, b: 0 },
      to: { r: 255, g: 255, b: 255 },
      duration: 30,
      easing: e.linear,
    });

    const animate2 = new Animate({
      from: { a: 1.0 },
      to: { a: 0.5 },
      duration: 30,
      easing: e.linear,
    });

    const blend = new Blend({
      animates: [animate1, animate2],
      blendFunction: values => {
        const [color, alpha] = values as [{ r: number, g: number, b: number }, { a: number }];
        return { ...color, ...alpha };
      },
    });

    let lastValue = { r: -1, g: -1, b: -1, a: -1 };

    blend.on('update', value => {
      expect(value.r).toBeGreaterThanOrEqual(lastValue.r);
      expect(value.g).toBeGreaterThanOrEqual(lastValue.g);
      expect(value.b).toBeGreaterThanOrEqual(lastValue.b);
      expect(value.a).toBeLessThanOrEqual(1.0);
      lastValue = value;
    });

    blend.on('complete', () => {
      done();
    });

    blend.start();
  });

  it('should stop all animations and emit stop event', done => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    const animate2 = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    const blend = new Blend({
      animates: [animate1, animate2],
      blendFunction: values => {
        const numValues = values as number[];
        return numValues.reduce((a, b) => a + b, 0) / numValues.length;
      },
    });

    blend.on('stop', () => {
      done();
    });

    blend.start();
    blend.stop();
  });

  it('should update blend function', () => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    const animate2 = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    const blend = new Blend({
      animates: [animate1, animate2],
      blendFunction: values => {
        const numValues = values as number[];
        return numValues.reduce((a, b) => a + b, 0) / numValues.length;
      },
    });

    const newBlendFunction = (values: AnimatableValue[]) => {
      const numValues = values as number[];
      return numValues.reduce((a, b) => a - b, 0);
    };

    blend.setBlendFunction(newBlendFunction);
    expect(blend['blendFunction']).toBe(newBlendFunction);
  });

  it('should get the current blended value', () => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    const animate2 = new Animate({
      from: 50,
      to: 150,
      duration: 100,
      easing: e.linear,
    });

    const blend = new Blend({
      animates: [animate1, animate2],
      blendFunction: values => {
        const numValues = values as number[];
        return numValues.reduce((a, b) => a + b, 0) / numValues.length;
      },
    });

    blend.start();
    const currentValue = blend.getCurrentValue();
    expect(typeof currentValue).toBe('number');
  });

  it('should update blend function using set method', () => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    const animate2 = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    const blend = new Blend({
      animates: [animate1, animate2],
      blendFunction: values => {
        const numValues = values as number[];
        return numValues.reduce((a, b) => a + b, 0) / numValues.length;
      },
    });

    const newBlendFunction = (values: AnimatableValue[]) => {
      const numValues = values as number[];
      return numValues.reduce((a, b) => a - b, 0);
    };

    blend.set({ blendFunction: newBlendFunction });
    expect(blend['blendFunction']).toBe(newBlendFunction);
  });
});
