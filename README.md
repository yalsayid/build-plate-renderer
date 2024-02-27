# Build Plate Renderer

> :construction: **WORK IN PROGRESS** :construction:
>
> This project is currently under development. Features and documentation may change.

The Build Plate Renderer is a comprehensive 3D workspace designed for web applications related to 3D printing. It allows users to manipulate models on a 3D printer's build plate, offering functionalities such as adding, removing, translating, rotating, and scaling models. This package is currently under development and aims to provide an intuitive interface for managing 3D printing models.

## Installation

To install the Build Plate Renderer package, run the following command in your project directory:

```bash
npm install react-build-plate-renderer
# or
yarn add react-build-plate-renderer
# or
pnpm add react-build-plate-renderer
```

## API Usage

### Importing

First, import the necessary components and hooks from the package:

```typescript
import {
  BuildPlateRenderer,
  useBuildPlateRenderer,
} from "react-build-plate-renderer";
```

### Adding a Model

To add a new model to the build plate, you can use the `addNewObject` function provided by the `useBuildPlateRenderer` hook. Here's an example of how to add a model:

```typescript
const { addNewObject } = useBuildPlateRenderer();

addNewObject({
  modelId: 1,
  modelUrl: "path/to/your/model.stl",
  format: "stl",
});
```

### Removing a Model

To remove a model, you can use the `removeObjectById` function:

```typescript
const { removeObjectById } = useBuildPlateRenderer();

removeObjectById("modelId");
```

### Translating, Rotating, and Scaling a Model

You can manipulate a model's position, rotation, and scale using the respective functions:

```typescript
const {
  translateXSelectedObject,
  rotateYSelectedObject,
  scaleUniformSelectedObject,
} = useBuildPlateRenderer();

// Translate the selected model along the X-axis
translateXSelectedObject(10);

// Rotate the selected model around the Y-axis
rotateYSelectedObject(Math.PI / 2);

// Uniformly scale the selected model
scaleUniformSelectedObject(1.5);
```

## Example

Here's a basic example of how to use the Build Plate Renderer in a React component:

```typescript
import React from 'react';
import { BuildPlateRenderer, useBuildPlateRenderer } from '@react-build-plate-renderer';

function App() {
  const { addNewObject } = useBuildPlateRenderer();

  const handleAddModel = () => {
    addNewObject({
      modelId: 1,
      modelUrl: 'path/to/your/model.stl',
      format: 'stl',
    });
  };

  return (
    <div>
      <BuildPlateRenderer />
      <button onClick={handleAddModel}>Add Model</button>
    </div>
  );
}

export default App;
```

This example demonstrates how to integrate the Build Plate Renderer into a React application, allowing users to add a model to the build plate.

## Contributing

This project is still in its early stages, and contributions are welcome. Whether it's adding new features, fixing bugs, or improving documentation, your help can make a significant difference in developing this tool for the 3D printing community.
