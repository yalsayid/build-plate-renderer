import { useRef } from 'react';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { DoubleSide, ExtrudeGeometry, MeshStandardMaterial, Shape } from 'three';
import { Line } from '@react-three/drei';
import { useVisualizerStore } from '@/zustand/store.js';

extend({ ExtrudeGeometry });

export interface BuildPlateProps {
  buildPlateCornerRadius?: number;
  gridLinesColor?: string | number;
  gridLinesOffeset?: number;
  plateColor?: string | number;
  buildPlateThickness?: number;
}

function createRoundedRectShape(width: number, height: number, radius: number): Shape {
  const shape = new Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + height - radius);
  shape.quadraticCurveTo(x, y + height, x + radius, y + height);
  shape.lineTo(x + width - radius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);

  return shape;
}

function generateGridLines(buildPlateSize: [number, number, number], gridSize: number, color: number | string) {
  const lines = [];
  const gridCountX = Math.floor(buildPlateSize[0] / gridSize);
  const gridCountY = Math.floor(buildPlateSize[1] / gridSize);
  const gridLineHeight = 0.05;

  const remainingSpaceX = buildPlateSize[0] % gridSize;
  const remainingSpaceY = buildPlateSize[1] % gridSize;

  const extraSpaceX = remainingSpaceX / 2;
  const extraSpaceY = remainingSpaceY / 2;

  for (let i = 0; i <= gridCountX; i += 1) {
    lines.push(
      <Line
        key={`x-${i}`}
        points={[
          [-buildPlateSize[0] / 2 + extraSpaceX + i * gridSize, gridLineHeight, buildPlateSize[1] / 2],
          [-buildPlateSize[0] / 2 + extraSpaceX + i * gridSize, gridLineHeight, -buildPlateSize[1] / 2],
        ]}
        color={color}
      />
    );
  }

  for (let i = 0; i <= gridCountY; i += 1) {
    lines.push(
      <Line
        key={`y-${i}`}
        points={[
          [buildPlateSize[0] / 2, gridLineHeight, -buildPlateSize[1] / 2 + extraSpaceY + i * gridSize],
          [-buildPlateSize[0] / 2, gridLineHeight, -buildPlateSize[1] / 2 + extraSpaceY + i * gridSize],
        ]}
        color={color}
      />
    );
  }

  return lines;
}

/**
 * Renders the build plate with customizable properties.
 *
 * @param {Object} props - The properties for the build plate.
 * @param {number} [props.gridLinesOffeset=0.15] - The offset for the grid lines on the build plate.
 * @param {number} [props.buildPlateCornerRadius=8] - The corner radius of the build plate.
 * @param {number|string} [props.gridLinesColor=0xdadada] - The color of the grid lines.
 * @param {number|string} [props.plateColor=0xe9e9eb] - The color of the build plate.
 * @param {number} [props.buildPlateThickness=1.5] - The thickness of the build plate.
 * @returns The build plate component.
 */
function BuildPlate({
  gridLinesOffeset = 24,
  buildPlateCornerRadius = 16,
  gridLinesColor = 0xdadada,
  plateColor = 0xe9e9eb,
  buildPlateThickness = 1.5,
}: BuildPlateProps) {
  const { buildPlateSize } = useVisualizerStore();
  const { camera } = useThree();
  const material = useRef<MeshStandardMaterial>(new MeshStandardMaterial());

  useFrame(() => {
    let color;

    if (camera.position.y < 0) {
      material.current.transparent = true;
      material.current.opacity = 0;
      material.current.wireframe = false;
      color = null;
    } else {
      material.current.transparent = false;
      material.current.opacity = 1.0;
      color = 0xe9e9eb;
    }

    material.current.needsUpdate = true;
    if (color !== null) {
      material.current.color.set(color);
    }
  });

  const buildPlateZOffset = 0.05; // Small offset along Z-axis

  // Adjusted size for the build plate shape with grid lines
  const adjustedBuildPlateSize = [
    buildPlateSize[0] + gridLinesOffeset,
    buildPlateSize[1] + gridLinesOffeset,
    buildPlateSize[2],
  ];

  // Create the shape for the build plate with adjusted size and corner radius
  const roundedRectShape = createRoundedRectShape(
    adjustedBuildPlateSize[0] || 235,
    adjustedBuildPlateSize[1] || 235,
    buildPlateCornerRadius || 0
  );
  // Define extrusion settings for the 3D shape of the build plate
  const extrudeSettings = {
    depth: buildPlateThickness,
    bevelEnabled: true, // Enable bevel
    bevelThickness: 0.5, // Thickness of the bevel
    bevelSize: 0.5, // Size of the bevel
    bevelSegments: 9, // Number of bevel segments
  };

  // Create the 3D geometry for the build plate by extruding the 2D shape
  const buildPlateGeometry = new ExtrudeGeometry(roundedRectShape, extrudeSettings);

  // Generate grid lines based on the original build plate dimensions
  const gridLines = generateGridLines(buildPlateSize, 10, gridLinesColor);

  return (
    <>
      <mesh
        geometry={buildPlateGeometry}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -buildPlateThickness / 2 - buildPlateZOffset, 0]}
        userData={{ type: 'build-plate' }}
      >
        <meshStandardMaterial attach="material" ref={material} color={plateColor} side={DoubleSide} />
      </mesh>

      <mesh position={[0, -buildPlateZOffset, 0]}>{gridLines}</mesh>
    </>
  );
}

export default BuildPlate;
