import React from 'react';
import { Box3, Vector3 } from 'three';
import { Line } from '@react-three/drei';

interface CornerMarkersProps {
  boundingBox: Box3;
  color?: number;
  lineWidth?: number;
  offsetY?: number;
}

const createCornerLines = (
  point: Vector3,
  xDir: number,
  yDir: number,
  zDir: number,
  length: number,
  offsetY: number
) => {
  return [
    { start: [point.x, point.y + offsetY, point.z], end: [point.x + xDir * length, point.y + offsetY, point.z] },
    { start: [point.x, point.y + offsetY, point.z], end: [point.x, point.y + yDir * length + offsetY, point.z] },
    { start: [point.x, point.y + offsetY, point.z], end: [point.x, point.y + offsetY, point.z + zDir * length] },
  ];
};

const CornerMarkers: React.FC<CornerMarkersProps> = ({ boundingBox, color = 0x6b7280, lineWidth = 3, offsetY = 0.1 }) => {
  const { min, max } = boundingBox;

  // Calculate dimensions of bounding box
  const boxWidth = Math.abs(max.x - min.x);
  const boxHeight = Math.abs(max.y - min.y);
  const boxDepth = Math.abs(max.z - min.z);

  // Find smallest dimension
  const smallestDimension = Math.min(boxWidth, boxHeight, boxDepth);

  // Calculate marker length as 10% of smallest dimension
  const length = smallestDimension * 0.3;

  const corners = [
    { point: new Vector3(min.x, min.y, min.z), xDir: 1, yDir: 1, zDir: 1, offsetY: 0.1 },
    { point: new Vector3(max.x, min.y, min.z), xDir: -1, yDir: 1, zDir: 1, offsetY: 0.1 },
    { point: new Vector3(max.x, min.y, max.z), xDir: -1, yDir: 1, zDir: -1, offsetY: 0.1 },
    { point: new Vector3(min.x, min.y, max.z), xDir: 1, yDir: 1, zDir: -1, offsetY: 0.1 },
    { point: new Vector3(min.x, max.y, min.z), xDir: 1, yDir: -1, zDir: 1, offsetY: 0 },
    { point: new Vector3(max.x, max.y, min.z), xDir: -1, yDir: -1, zDir: 1, offsetY: 0 },
    { point: new Vector3(max.x, max.y, max.z), xDir: -1, yDir: -1, zDir: -1, offsetY: 0 },
    { point: new Vector3(min.x, max.y, max.z), xDir: 1, yDir: -1, zDir: -1, offsetY: 0 },
  ];

  return (
    <>
      {corners
        .flatMap(({ point, xDir, yDir, zDir }) => createCornerLines(point, xDir, yDir, zDir, length, offsetY))
        .map((line, index) => (
          <Line
            key={index}
            points={[line.start as [number, number, number], line.end as [number, number, number]]}
            color={color}
            lineWidth={lineWidth}
            segments
            dashed={false}
          />
        ))}
    </>
  );
};

export default CornerMarkers;
