import React, { forwardRef } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { GizmoHelper, GizmoViewcube, OrbitControls } from '@react-three/drei';
import BuildPlate, { type BuildPlateProps } from './BuildPlate.js';
import Model from './Model.js';
import { IModel } from '../types/types';
import Lights from './Lights';
import { useVisualizerStore } from '../zustand/store';
import { cn } from '../utils';

type GizmoHelperProps = React.ComponentProps<typeof GizmoHelper>;
type GizmoViewcubeProps = React.ComponentProps<typeof GizmoViewcube>;
type AxesHelperProps = ThreeElements['axesHelper'];
type OrbitControlsProps = React.ComponentProps<typeof OrbitControls>;

interface SceneProps extends React.ComponentPropsWithoutRef<typeof Canvas> {
  gizmoHelperProps?: GizmoHelperProps;
  gizmoViewcubeProps?: GizmoViewcubeProps;
  axesHelperProps?: Partial<AxesHelperProps>;
  orbitControlsProps?: Partial<OrbitControlsProps>;
  showAxesHelper?: boolean;
  showGizmos?: boolean;
  buildPlateProps?: BuildPlateProps;
}

/**
 * Props for the Scene component.
 * @property {GizmoHelperProps} gizmoHelperProps - Props for the GizmoHelper component.
 * @property {GizmoViewcubeProps} gizmoViewcubeProps - Props for the GizmoViewcube component.
 * @property {AxesHelperProps} axesHelperProps - Props for the AxesHelper component.
 * @property {OrbitControlsProps} orbitControlsProps - Props for the OrbitControls component.
 * @property {boolean} showAxesHelper - Flag to show/hide the AxesHelper.
 * @property {boolean} showGizmos - Flag to show/hide the GizmoHelper and GizmoViewcube.
 */
const Scene = forwardRef<HTMLCanvasElement, SceneProps>(
  (
    {
      gizmoHelperProps = {},
      gizmoViewcubeProps = {},
      axesHelperProps = {},
      orbitControlsProps = {},
      showAxesHelper = true,
      showGizmos = true,
      buildPlateProps = {},
      className,
      ...props
    },
    ref
  ) => {
    const { buildPlateSize, models } = useVisualizerStore();

    const minDistance = Math.min(...buildPlateSize) / 4;
    const maxDistance = Math.max(...buildPlateSize) * 2;

    return (
      <Canvas
        ref={ref}
        className={cn('w-full h-full', className)}
        camera={{ position: [-buildPlateSize[0] / 2, buildPlateSize[1] / 2, 350] }}
        flat
        {...props}
      >
        {models.map((model: IModel) => (
          <Model id={model.id} key={model.id} format={model.format} geometry={model.geometry} />
        ))}
        <BuildPlate {...buildPlateProps} />
        <Lights />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.1}
          regress={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          minDistance={minDistance}
          maxDistance={maxDistance}
          {...orbitControlsProps}
        />
        {showAxesHelper && (
          <axesHelper
            args={[50]}
            position={[-buildPlateSize[0] / 2, 0.1, buildPlateSize[1] / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            {...axesHelperProps}
          />
        )}
        {showGizmos && (
          <GizmoHelper {...gizmoHelperProps}>
            <GizmoViewcube {...gizmoViewcubeProps} />
          </GizmoHelper>
        )}
      </Canvas>
    );
  }
);

Scene.displayName = 'Scene';

export default Scene;
