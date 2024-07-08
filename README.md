# nimate

[![npm](https://img.shields.io/npm/v/nimate)](https://www.npmjs.com/package/nimate)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2F4ver%2Fnimate.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2F4ver%2Fnimate?ref=badge_shield&issueType=license)
[![codecov](https://codecov.io/gh/4ver/nimate/branch/main/graph/badge.svg)](https://codecov.io/gh/4ver/nimate)

**nimate** is a simple, lightweight animation library designed to work across all JavaScript environments.

## ✨ Features

- **Flexible Animation Support**: Animate numbers, objects, and arrays.
- **Easing Functions**: Uses [streamich/ts-easing](https://github.com/streamich/ts-easing) for easing functions.
- **Cross-Environment Compatibility**: Works in browsers, Node.js, and other JavaScript environments.
- **Events**: Emits `start`, `update`, `complete`, and `stop` events for animations, sequences, blends, and queues.
- **Promise Support**: Supports promises for easy synchronization and chaining.
- **Blended Animations**: Combine multiple animations using custom blend functions.
- **Queues**: Auto-run animations in a FIFO queue.
- **Sequences**: Run animations in parallel or in series.

## 📦 Installation

Install the library using npm:

```bash
npm install nimate
```

## 💻 Usage

### Basic Animation

```javascript
import { Animate, easing } from 'nimate';

// Create an animation
const animate = new Animate({
  from: { x: 0, y: 0 },
  to: { x: 100, y: 50 },
  duration: 1000,
  easing: easing.easeInOutQuad,
});

animate
  .on('start', () => console.log('Animation Start'))
  .on('update', value => console.log('Animation Update:', value))
  .on('complete', () => console.log('Animation Complete'))
  .on('stop', () => console.log('Animation Stop'))
  .start();
```

### Sequence of Animations

```javascript
import { Animate, Sequence, easing } from 'nimate';

// Create individual animations
const animate1 = new Animate({
  from: { x: 0, y: 0, nested: { z: 0 } },
  to: { x: 100, y: 50, nested: { z: 100 } },
  duration: 1000,
  easing: easing.easeInOutQuad,
});

const animate2 = new Animate({
  from: [0, 0, { a: 0 }],
  to: [100, 50, { a: 100 }],
  duration: 1000,
  easing: easing.easeInOutQuad,
});

// Create a sequence with the animations
const sequence = new Sequence({ items: [animate1, animate2] });

// Attach event listeners
sequence
  .on('start', () => console.log('Sequence Start'))
  .on('update', value => console.log('Sequence Update:', value))
  .on('complete', () => console.log('Sequence Complete'))
  .on('stop', () => console.log('Sequence Stop'))
  .start();
```

### Parallel Sequences

```javascript
import { Animate, Sequence, easing } from 'nimate';

// Create individual animations
const animate1 = new Animate({
  from: { x: 0, y: 0, nested: { z: 0 } },
  to: { x: 100, y: 50, nested: { z: 100 } },
  duration: 1000,
  easing: easing.easeInOutQuad,
});

const animate2 = new Animate({
  from: [0, 0, { a: 0 }],
  to: [100, 50, { a: 100 }],
  duration: 1000,
  easing: easing.easeInOutQuad,
});

const animate3 = new Animate({
  from: { x: 50, y: 50 },
  to: { x: 150, y: 100 },
  duration: 1000,
  easing: easing.easeInOutQuad,
});

// Create a sequence with the animations
const sequence1 = new Sequence({ items: [animate1, animate2] });

// Create a parallel sequence
const parallelSequence = new Sequence({ items: [sequence1, animate3], parallel: true });

// Attach event listeners
parallelSequence
  .on('start', () => console.log('Parallel Sequence Start'))
  .on('update', value => console.log('Parallel Sequence Update'))
  .on('complete', () => console.log('Parallel Sequence Complete'))
  .on('stop', () => console.log('Parallel Sequence Stop'));

// Start the sequence
parallelSequence.start();
```

### Queue of Animations

```javascript
import { Animate, Queue, easing } from 'nimate';

// Create individual animations
const animate1 = new Animate({
  from: { x: 0, y: 0 },
  to: { x: 100, y: 50 },
  duration: 1000,
  easing: easing.easeInOutQuad,
});

const animate2 = new Animate({
  from: { x: 100, y: 50 },
  to: { x: 200, y: 100 },
  duration: 1000,
  easing: easing.easeInOutQuad,
});

// Create a queue and add animations
const queue = new Queue();
queue.add(animate1);
queue.add(animate2);

// Attach event listeners
queue
  .on('start', (animation) => console.log('Queue Animation Start', animation))
  .on('update', (value, animation) => console.log('Queue Animation Update:', value, animation))
  .on('complete', (animation) => console.log('Queue Animation Complete', animation))
  .on('stop', (animation) => console.log('Queue Animation Stop', animation))
  .on('complete', () => console.log('All animations in the queue are complete'));

// Start the queue
queue.start();
```

### Blending Animations

The `Blend` object allows you to pass multiple `Animate` objects and blend their results.

```javascript
import { Animate, Blend } from 'nimate';

// Create individual animations
const animateAlpha = new Animate({
  from: { a: 1.0 },
  to: { a: 0.2 },
  duration: 1000,
});

const animateColor = new Animate({
  from: { r: 255, g: 255, b: 0 },
  to: { r: 255, g: 255, b: 255 },
  duration: 1000,
});

// Define a blend function
const blendFunction = (values) => ({ ...values[1], ...values[0] });

// Create a Blend object
const blend = new Blend({
  animates: [animateAlpha, animateColor],
  blendFunction: blendFunction,
});

// Attach event listeners
blend.on('start', () => console.log('Blend Start'));
blend.on('update', (value) => console.log('Blended value:', value));
blend.on('complete', () => console.log('Blend Complete'));
blend.on('stop', () => console.log('Blend Stop'));

// Start the blend animation
blend.start()
```

## 📚 API

### `Animate`

Creates an animation instance.

#### Options

- `from` (AnimatableValue): The initial value.
- `to` (AnimatableValue): The target value.
- `duration` (number): The duration of the animation in milliseconds.
- `easing` (EasingFunction, optional): The easing function to use. Default is `easing.linear`.
- `delay` (number, optional): The delay before the animation starts in milliseconds. Default is `0`.
- `direction` ('normal' | 'reverse' | 'alternate', optional): The direction of the animation. Default is `'normal'`.
- `loop` (number, optional): The number of times the animation should loop. Default is `1`.

#### Methods

- `start()`: Starts the animation and returns the animation instance.
- `stop()`: Stops the animation and returns the animation instance.
- `set(options: SetOptions)`: Updates the animation properties while it is running.
- `promise()`: Returns a promise that resolves when the animation completes.

#### Events

- `start`: Emitted when the animation starts.
- `update`: Emitted on each update with the current value.
- `complete`: Emitted when the animation completes.
- `stop`: Emitted when the animation is stopped.

#### `SetOptions`

The `set` method accepts an object with the following optional properties:

- `from` (AnimatableValue, optional): The new initial value.
- `to` (AnimatableValue, optional): The new target value.
- `duration` (number, optional): The new duration of the animation in milliseconds.
- `easing` (EasingFunction, optional): The new easing function to use.
- `delay` (number, optional): The new delay before the animation starts in milliseconds.
- `direction` ('normal' | 'reverse' | 'alternate', optional): The new direction of the animation.
- `loop` (number, optional): The new number of times the animation should loop.

### `Sequence`

Creates a sequence of animations.

#### Options

- `items` (SequenceItem[]): The animations or sequences to include in the sequence.
- `parallel` (boolean, optional): Whether the items should run in parallel. Default is `false`.

#### Methods

- `start()`: Starts the sequence and returns the sequence instance.
- `stop()`: Stops the sequence and returns the sequence instance.
- `promise()`: Returns a promise that resolves when the sequence completes.

#### Events

- `start`: Emitted when the sequence starts.
- `update`: Emitted on each update with the current value.
- `complete`: Emitted when the sequence completes.
- `stop`: Emitted when the sequence is stopped.

### `Queue`

`Animate` objects in the queue are called sequentially and removed when complete. The start function of each `Animate` is called automatically when it is next to be played. For example, if the queue is empty and an `Animate` is added, it is played immediately."

#### Methods

- `add(animation: Animate | Blend)`: Adds an `Animate` or `Blend` instance to the queue.
- `clear()`: Clears the queue and stops any currently running animation.
- `stop()`: Stops the currently running animation without clearing the queue.
- `promise()`: Returns a promise that resolves when all animations in the queue are complete.

#### Events

- `start`: Emitted when an animation in the queue starts.
- `update`: Emitted on each update with the current value and animation.
- `complete`: Emitted when an animation in the queue completes.
- `stop`: Emitted when an animation in the queue is stopped.
- `complete`: Emitted when all animations in the queue are complete.

### `Blend`

Creates a blended animation from multiple `Animate` objects.

#### Options

- `animates` (Animate[]): The animations to blend.
- `blendFunction` (BlendFunction): The function to blend the animation values.

#### Methods

- `start()`: Starts the blended animation and returns the blend instance.
- `stop()`: Stops the blended animation and returns the blend instance.
- `setBlendFunction(blendFunction: BlendFunction)`: Sets a new blend function.
- `promise()`: Returns a promise that resolves when the blended animation completes.

#### Events

- `start`: Emitted when the blended animation starts.
- `update`: Emitted on each update with the blended value.
- `complete`: Emitted when the blended animation completes.
- `stop`: Emitted when the blended animation is stopped.


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2F4ver%2Fnimate.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2F4ver%2Fnimate?ref=badge_large)
