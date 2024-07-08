import { Animate, Sequence, Queue, Blend, easing } from '../index';

describe('index.ts exports', () => {
  it('should export Animate', () => {
    expect(Animate).toBeDefined();
  });

  it('should export Sequence', () => {
    expect(Sequence).toBeDefined();
  });

  it('should export Queue', () => {
    expect(Queue).toBeDefined();
  });

  it('should export Blend', () => {
    expect(Blend).toBeDefined();
  });

  it('should export easing', () => {
    expect(easing).toBeDefined();
  });
});
