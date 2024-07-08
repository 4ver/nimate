import { Animate } from '../animate';
import { easing as e } from '../easing';

describe('Animate', () => {
  it('should throw an error for invalid animatable value', () => {
    expect(() => {
      new Animate({
        from: 0,
        to: 'invalid',
        duration: 100,
        easing: e.linear,
      } as any);
    }).toThrow('Invalid animatable value');
  });

  it('should throw an error for negative duration', () => {
    expect(() => {
      new Animate({
        from: 0,
        to: 100,
        duration: -100,
        easing: e.linear,
      });
    }).toThrow('Duration must be a positive number');
  });

  it('should throw an error for negative delay', () => {
    expect(() => {
      new Animate({
        from: 0,
        to: 100,
        duration: 100,
        delay: -50,
        easing: e.linear,
      });
    }).toThrow('Delay must be a non-negative number');
  });

  it('should throw an error for invalid direction', () => {
    expect(() => {
      new Animate({
        from: 0,
        to: 100,
        duration: 100,
        direction: 'invalid' as any,
        easing: e.linear,
      });
    }).toThrow('Invalid direction');
  });

  it('should throw an error for negative loop', () => {
    expect(() => {
      new Animate({
        from: 0,
        to: 100,
        duration: 100,
        loop: -1,
        easing: e.linear,
      });
    }).toThrow('Loop must be a non-negative number');
  });

  it('should run a valid animation without errors', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    animate.on('update', value => {
      expect(typeof value).toBe('number');
    });

    animate.on('complete', () => {
      done();
    });

    animate.start();
  });

  it('should handle delay option correctly', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
      delay: 50,
    });

    const startTime = performance.now();

    animate.on('update', value => {
      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(50);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });

    animate.on('complete', () => {
      done();
    });

    animate.start();
  });

  it('should handle reverse direction correctly', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
      direction: 'reverse',
    });

    animate.on('update', value => {
      expect(value).toBeLessThanOrEqual(100);
      expect(value).toBeGreaterThanOrEqual(0);
    });

    animate.on('complete', () => {
      expect(animate['currentValue']).toBe(0);
      done();
    });

    animate.start();
  });

  it('should handle alternate direction correctly', done => {
    const updates: number[] = [];
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
      direction: 'alternate',
      loop: 2,
    });

    animate.on('update', value => {
      updates.push(value as number);
    });

    animate.on('complete', () => {
      expect(updates.indexOf(100)).toBeGreaterThan(0);
      expect(updates.indexOf(100)).toBeLessThan(updates.length - 1);
      expect(updates[updates.length - 1]).toBe(0);
      done();
    });

    animate.start();
  });

  it('should handle loop option correctly', done => {
    const updates: number[] = [];

    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
      loop: 2,
    });

    animate.on('update', value => {
      updates.push(value as number);
    });

    // checks if there are two 100s in the updates array
    animate.on('complete', () => {
      expect(updates.filter((x) => x === 100).length).toBe(2);
      done();
    });

    animate.start();
  });

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

  it('should update the from value using set method', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    animate.start();

    setTimeout(() => {
      animate.set({ from: 50 });
      expect(animate['from']).toBe(50);
    }, 50);

    animate.on('complete', () => {
      done();
    });
  });

  it('should update the to value using set method', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    animate.start();

    setTimeout(() => {
      animate.set({ to: 200 });
      expect(animate['to']).toBe(200);
    }, 50);

    animate.on('complete', () => {
      done();
    });
  });

  it('should update the duration using set method', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 200,
      easing: e.linear,
    });

    animate.start();

    setTimeout(() => {
      animate.set({ duration: 100 });
      expect(animate['duration']).toBe(100);
    }, 50);

    animate.on('complete', () => {
      done();
    });
  });

  it('should update the easing using set method', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    animate.start();

    setTimeout(() => {
      animate.set({ easing: e.inOutQuad });
      expect(animate['easing']).toBe(e.inOutQuad);
    }, 50);

    animate.on('complete', () => {
      done();
    });
  });

  it('should update the delay using set method', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      delay: 50,
      easing: e.linear,
    });

    animate.start();

    setTimeout(() => {
      animate.set({ delay: 0 });
      expect(animate['delay']).toBe(0);
    }, 25);

    animate.on('complete', () => {
      done();
    });
  });

  it('should update the direction using set method', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      direction: 'normal',
      easing: e.linear,
    });

    animate.start();

    setTimeout(() => {
      animate.set({ direction: 'reverse' });
      expect(animate['direction']).toBe('reverse');
      expect(animate['isReversed']).toBe(true);
    }, 50);

    animate.on('complete', () => {
      done();
    });
  });

  it('should update the loop using set method', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      loop: 1,
      easing: e.linear,
    });

    animate.start();

    setTimeout(() => {
      animate.set({ loop: 2 });
      expect(animate['loop']).toBe(2);
      expect(animate['loopsCompleted']).toBe(0);
    }, 50);

    animate.on('complete', () => {
      done();
    });
  });

  it('should handle multiple properties update using set method', done => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    animate.start();

    setTimeout(() => {
      animate.set({ from: 50, to: 150, duration: 200, easing: e.inOutQuad });
      expect(animate['from']).toBe(50);
      expect(animate['to']).toBe(150);
      expect(animate['duration']).toBe(200);
      expect(animate['easing']).toBe(e.inOutQuad);
    }, 50);

    animate.on('complete', () => {
      done();
    });
  });

  it('should throw an error for invalid animatable value using set method', () => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    expect(() => {
      animate.set({ from: 'invalid' as any });
    }).toThrow('Invalid animatable value');
  });

  it('should throw an error for negative duration using set method', () => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      easing: e.linear,
    });

    expect(() => {
      animate.set({ duration: -100 });
    }).toThrow('Duration must be a positive number');
  });

  it('should throw an error for negative delay using set method', () => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      delay: 0,
      easing: e.linear,
    });

    expect(() => {
      animate.set({ delay: -50 });
    }).toThrow('Delay must be a non-negative number');
  });

  it('should throw an error for invalid direction using set method', () => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      direction: 'normal',
      easing: e.linear,
    });

    expect(() => {
      animate.set({ direction: 'invalid' as any });
    }).toThrow('Invalid direction');
  });

  it('should throw an error for negative loop using set method', () => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 100,
      loop: 0,
      easing: e.linear,
    });

    expect(() => {
      animate.set({ loop: -1 });
    }).toThrow('Loop must be a non-negative number');
  });

  it('should resolve promise when animation completes', async () => {
    const animate = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: e.linear,
    });

    await animate.start().promise();
    expect(animate['currentValue']).toBe(100);
  });
});
