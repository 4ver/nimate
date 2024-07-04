import { Animate } from '../animate';
import { Queue } from '../queue';
import { easing as e } from '../easing';

describe('Queue', () => {
  it('should add animations to the queue and start the first one immediately', done => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 50,
      easing: e.linear,
    });

    const animate2 = new Animate({
      from: 0,
      to: 100,
      duration: 50,
      easing: e.linear,
    });

    const queue = new Queue();

    queue.add(animate1);
    queue.add(animate2);

    let completeCount = 0;

    queue.on('complete', () => {
      completeCount++;
      if (completeCount === 2) {
        expect(completeCount).toBe(2);
        done();
      }
    });
  });

  it('should handle stop correctly', done => {
    const animate1 = new Animate({
      from: 0,
      to: 100,
      duration: 50,
      easing: e.linear,
    });

    animate1.on('stop', () => {
      done();
    });

    const queue = new Queue();

    queue.add(animate1);

    queue.stop();
  });

  it('should clear the queue and stop the current animation', done => {
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

    const queue = new Queue();

    queue.add(animate1);
    queue.add(animate2);

    queue.clear();

    expect(queue['animations'].length).toBe(0);
    done();
  });
});
