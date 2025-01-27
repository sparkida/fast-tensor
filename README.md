FastTensor
----------
High-performance, immutable matrix math for realtime applications. Powered by WASM.


## Getting started

- [Documentation](https://sparkida.github.io/fast-tensor/)

### Install

- [NPM](https://www.npmjs.com/package/fast-tensor)

```bash
npm i fast-tensor
# or
yarn add fast-tensor
```

### Basic usage

```js
import ft from 'fast-tensor';

async function main() {
  // wait for WASM to load
  await ft.ready();

  // creating a 2d Matrix
  const mat = ft.tensor([
    [ 1, 2, 3 ],
    [ 4, 5, 6 ]
  ]);
  // mat.shape => [ 2, 3 ]

  // or specify the shape directly
  const mat = ft.tensor(
    [ 1, 2, 3, 4, 5, 6 ],
    [ 2, 3 ]
  );

  // perform some operations
  const added = mat.add(2);
  const multiplied = added.multiply([ 1, 2, 3 ]);

  // get the resulting data
  const result = multiplied.array();
}

main();
```

**Browser** - *If using NodeJS you can skip this step*

You'll need to specify the WASM path when using a bundler:

```js
import ft from 'fast-tensor';
// tell the bundler to preserve this asset
const TENSOR_WASM_PATH = new URL('fast-tensor/tensor.wasm', import.meta.url).href;
ft.setWasmPath(TENSOR_WASM_PATH);

// wait for dependencies
async function main() {
  // wait for WASM to load
  await ft.ready();

  // do things
}

main();
```

#### Method chaining

Following the previous example, all methods can be chained.

```js
const result = mat.add(2).multiply([ 1, 2, 3 ]).array();
```

#### WASM Memory management

Wasm requires us to manage the memory of created instances. To help with this, you can use the `ft.scope(<callback>)` helper.

```js
const result = ft.scope(() => {
  // instances created in here will automatically be cleaned up
  const added = mat.add(2);
  const multiplied = added.multiply([ 1, 2, 3 ]);
  
  // get the resulting data
  const result = multiplied.array();
  return result;
});
console.log(result);
```
