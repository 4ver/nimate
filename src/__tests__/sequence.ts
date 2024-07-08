import { Animate } from '../animate';
import { Sequence } from '../sequence';
import { easing } from 'ts-easing';

describe('Sequence', () => {
  it('should emit start event', done => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: easing.linear,
    });

    const sequence = new Sequence({ items: [animate1] });

    sequence.on('start', () => {
      done();
    });

    sequence.start();
  });

  it('should emit update events', done => {
    const animate1 = new Animate({
      from: 0,
      to: 50,
      duration: 500,
      easing: easing.linear,
    });

    const animate2 = new Animate({
      from: 50,
      to: 100,
      duration: 500,
      easing: easing.linear,
    });

    const sequence = new Sequence({ items: [animate1, animate2] });

    let previousValue = -1;

    sequence.on('update', value => {
      expect(value).toBeGreaterThan(previousValue);
      previousValue = value as number;
    });

    sequence.on('complete', () => {
      expect(previousValue).toBe(100);
      done();
    });

    sequence.start();
  });

  it('should emit complete event', done => {
    const animate1 = new Animate({
      from: 0,
      to: 50,
      duration: 500,
      easing: easing.linear,
    });

    const animate2 = new Animate({
      from: 50,
      to: 100,
      duration: 500,
      easing: easing.linear,
    });

    const sequence = new Sequence({ items: [animate1, animate2] });

    sequence.on('complete', () => {
      done();
    });

    sequence.start();
  });

  it('should run animations in parallel', done => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: easing.linear,
    });

    const animate2 = new Animate({
      from: 100,
      to: 200,
      duration: 30,
      easing: easing.linear,
    });

    const sequence = new Sequence({ items: [animate1, animate2], parallel: true });

    sequence.on('complete', () => {
      done();
    });

    sequence.start();
  });

  it('should handle nested sequences', done => {
    const animate1 = new Animate({
      from: 0,
      to: 50,
      duration: 500,
      easing: easing.linear,
    });

    const animate2 = new Animate({
      from: 50,
      to: 100,
      duration: 500,
      easing: easing.linear,
    });

    const nestedSequence = new Sequence({ items: [animate1, animate2] });

    const animate3 = new Animate({
      from: 100,
      to: 200,
      duration: 30,
      easing: easing.linear,
    });

    const sequence = new Sequence({ items: [nestedSequence, animate3] });

    sequence.on('complete', () => {
      done();
    });

    sequence.start();
  });

  it('should emit stop event', done => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: easing.linear,
    });

    const sequence = new Sequence({ items: [animate1] });

    sequence.on('stop', () => {
      done();
    });

    sequence.start();
    sequence.stop();
  });

  it('should resolve promise when sequence completes', async () => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
    });

    const animate2 = new Animate({
      from: 100,
      to: 200,
      duration: 30,
    });

    const sequence = new Sequence({ items: [animate1, animate2] });

    await sequence.start().promise();
    expect(animate2.getCurrentValue()).toBe(200);
  });

  it('should resolve promise and emit complete when all parallel animations complete', async () => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: easing.linear,
    });

    const animate2 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: easing.linear,
    });

    const sequence = new Sequence({ items: [animate1, animate2], parallel: true });

    const completePromise = new Promise<void>((resolve) => {
      sequence.on('complete', resolve);
    });

    sequence.start();
    await completePromise;

    expect(sequence['promiseResolver']).toBeUndefined();
  });

  it('should stop nested sequences', done => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: easing.linear,
    });

    const animate2 = new Animate({
      from: 100,
      to: 200,
      duration: 30,
      easing: easing.linear,
    });

    const nestedSequence = new Sequence({ items: [animate1, animate2] });
    const sequence = new Sequence({ items: [nestedSequence] });

    nestedSequence.on('stop', () => {
      done();
    });

    sequence.start();
    sequence.stop();
  });


  it('should create a new promise if currentPromise is not defined', () => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 30,
      easing: easing.linear,
    });

    const sequence = new Sequence({ items: [animate1] });

    const promise = sequence.promise();
    expect(promise).toBeInstanceOf(Promise);
    expect(sequence['currentPromise']).toBe(promise);
  });
});
