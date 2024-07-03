# nimate

[![npm](https://img.shields.io/npm/v/nimate)](https://www.npmjs.com/package/nimate)  ![issues](https://img.shields.io/github/issues/4ver/nimate) ![stars](https://img.shields.io/github/stars/4ver/nimate)

**nimate** is a simple, flexible animation library designed to work across all JavaScript environments. With **nimate**, you can create smooth animations and sequence them with ease, utilizing easing functions from the `ts-easing` package.

## ✨ Features

- Supports animations of numbers, objects, and arrays.
- [streamich/ts-easing](https://github.com/streamich/ts-easing) for easing.
- Configurable sequences that can run in parallel or series.
- Works in browsers, Node.js, and other JavaScript environments.
- Emits events for `start`, `update`, `complete`, and `stop` for animations and sequences.

## 📦 Installation

Install the library using npm:

```bash
npm install nimate
```

## 💻 Usage

### Basic Animation

```javascript
import { Animate, Easing } from 'nimate';

// Create an animation
const animate = new Animate({
  from: { x: 0, y: 0 },
  to: { x: 100, y: 50 },
  duration: 1000,
  easing: Easing.easeInOutQuad,
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
import { Animate, Sequence, Easing } from 'nimate';

// Create individual animations
const animate1 = new Animate({
  from: { x: 0, y: 0, nested: { z: 0 } },
  to: { x: 100, y: 50, nested: { z: 100 } },
  duration: 1000,
  easing: Easing.easeInOutQuad,
});

const animate2 = new Animate({
  from: [0, 0, { a: 0 }],
  to: [100, 50, { a: 100 }],
  duration: 1000,
  easing: Easing.easeInOutQuad,
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
import { Animate, Sequence, Easing } from 'nimate';

// Create individual animations
const animate1 = new Animate({
  from: { x: 0, y: 0, nested: { z: 0 } },
  to: { x: 100, y: 50, nested: { z: 100 } },
  duration: 1000,
  easing: Easing.easeInOutQuad,
});

const animate2 = new Animate({
  from: [0, 0, { a: 0 }],
  to: [100, 50, { a: 100 }],
  duration: 1000,
  easing: Easing.easeInOutQuad,
});

const animate3 = new Animate({
  from: { x: 50, y: 50 },
  to: { x: 150, y: 100 },
  duration: 1000,
  easing: Easing.easeInOutQuad,
});

// Create a sequence with the animations
const sequence1 = new Sequence({ items: [animate1, animate2] });

// Create a parallel sequence
const parallelSequence = new Sequence({ items: [sequence1, animate3], parallel: true });

// Attach event listeners
parallelSequence
  .on('start', () => console.log('Parallel Sequence Start'))
  .on('update', value => console.log('Parallel Sequence Update:', value))
  .on('complete', () => console.log('Parallel Sequence Complete'))
  .on('stop', () => console.log('Parallel Sequence Stop'));

// Start the sequence
parallelSequence.start();
```

## 📚 API

### `Animate`

Creates an animation instance.

#### Options

- `from` (AnimatableValue): The initial value.
- `to` (AnimatableValue): The target value.
- `duration` (number): The duration of the animation in milliseconds.
- `easing` (EasingFunction, optional): The easing function to use. Default is `Easing.linear`.

#### Methods

- `start()`: Starts the animation.
- `stop()`: Stops the animation.

#### Events

- `start`: Emitted when the animation starts.
- `update`: Emitted on each update with the current value.
- `complete`: Emitted when the animation completes.
- `stop`: Emitted when the animation is stopped.

### `Sequence`

Creates a sequence of animations.

#### Options

- `items` (SequenceItem[]): The animations or sequences to include in the sequence.
- `parallel` (boolean, optional): Whether the items should run in parallel. Default is `false`.

#### Methods

- `start()`: Starts the sequence.
- `stop()`: Stops the sequence.

#### Events

- `start`: Emitted when the sequence starts.
- `update`: Emitted on each update with the current value.
- `complete`: Emitted when the sequence completes.
- `stop`: Emitted when the sequence is stopped.
