import { Animate } from '../animate';
import { easing as e } from '../easing';

describe('Animate', () => {
  it('should emit start event', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: e.linear,
    });

    animate.on('start', () => {
      done();
    });

    animate.start();
  });

  it('should emit update events with correct values', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: e.linear,
    });

    let previousValue = -1;

    animate.on('update', value => {
      if (value !== previousValue) {
        expect(value).toBeGreaterThan(previousValue);
        previousValue = value as number;
      }
    });

    animate.on('complete', () => {
      expect(previousValue).toBe(100);
      done();
    });

    animate.start();
  });

  it('should emit complete event', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: e.linear,
    });

    animate.on('complete', () => {
      done();
    });

    animate.start();
  });

  it('should emit stop event', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: e.linear,
    });

    animate.on('stop', () => {
      done();
    });

    animate.start();
    animate.stop();
  });

  it('should interpolate object values', done => {
    const animate = new Animate({
      from: { x: 0, y: 0 },
      to: { x: 100, y: 100 },
      duration: 30,
      easing: e.linear,
    });

    // eslint-disable @typescript-eslint/no-explicit-any
    let previousValue: any = { x: -1, y: -1 };

    animate.on('update', value => {
      if (value.x !== previousValue.x || value.y !== previousValue.y) {
        expect(value.x).toBeGreaterThan(previousValue.x);
        expect(value.y).toBeGreaterThan(previousValue.y);
        previousValue = value;
      }
    });

    animate.on('complete', () => {
      expect(previousValue).toEqual({ x: 100, y: 100 });
      done();
    });

    animate.start();
  });

  it('should interpolate array values', done => {
    const animate = new Animate({
      from: [0, 0],
      to: [100, 100],
      duration: 30,
      easing: e.linear,
    });

    let previousValue: any = [-1, -1];

    animate.on('update', value => {
      if (value[0] !== previousValue[0] || value[1] !== previousValue[1]) {
        expect(value[0]).toBeGreaterThan(previousValue[0]);
        expect(value[1]).toBeGreaterThan(previousValue[1]);
        previousValue = value;
      }
    });

    animate.on('complete', () => {
      expect(previousValue).toEqual([100, 100]);
      done();
    });

    animate.start();
  });

  it('should interpolate nested object values', done => {
    const animate = new Animate({
      from: { x: 0, y: { z: 0 } },
      to: { x: 100, y: { z: 100 } },
      duration: 30,
      easing: e.linear,
    });

    let previousValue: any = { x: -1, y: { z: -1 } };

    animate.on('update', value => {
      if (value.x !== previousValue.x || value.y.z !== previousValue.y.z) {
        expect(value.x).toBeGreaterThan(previousValue.x);
        expect(value.y.z).toBeGreaterThan(previousValue.y.z);
        previousValue = value;
      }
    });

    animate.on('complete', () => {
      expect(previousValue).toEqual({ x: 100, y: { z: 100 } });
      done();
    });

    animate.start();
  });

  it('should interpolate object with one level', done => {
    const animate = new Animate({
      from: { a: 0, b: 50 },
      to: { a: 100, b: 150 },
      duration: 30,
      easing: e.linear,
    });

    // eslint-disable-next-line
    let previousValue: any = { a: -1, b: 49 };

    animate.on('update', value => {
      if (value.a !== previousValue.a || value.b !== previousValue.b) {
        expect(value.a).toBeGreaterThan(previousValue.a);
        expect(value.b).toBeGreaterThan(previousValue.b);
        previousValue = value;
      }
    });

    animate.on('complete', () => {
      expect(previousValue).toEqual({ a: 100, b: 150 });
      done();
    });

    animate.start();
  });

  it('should throw error for unsupported value types', (done) => {
    const animate = new Animate({ // @ts-expect-error This is testing an error case
      from: 'unsupported', // @ts-expect-error This is testing an error case
      to: 'unsupported',
      duration: 30,
      easing: e.linear,
    });

    animate.on('error', (error) => {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Unsupported value types');
      done();
    });

    animate.start();
  });
});
