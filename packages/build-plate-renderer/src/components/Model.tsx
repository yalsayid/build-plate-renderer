import { useEffect, useMemo, useRef } from 'react';
import { DoubleSide, Euler, Matrix4, Mesh, Plane, Quaternion, Vector2, Vector3 } from 'three';
import { useThree } from '@react-three/fiber';
import { useGesture } from '@use-gesture/react';
import { shallow } from 'zustand/shallow';
import { ModelProps } from '../types/types';
import { useVisualizerStore } from '../zustand/store';
import { isModelOutOfPlate } from '../utils/isModelOutOfPlate';
import { PivotControls } from './PivotControls';
import CornerMarkers from './CornerMarkers';

type ControlsProto = {
  enabled: boolean;
};

function Model({ id, geometry }: Omit<ModelProps, 'name' | 'size'>) {
  const meshRef = useRef<Mesh>(null);
  const matrixRef = useRef(new Matrix4());

  // @ts-expect-error new in @react-three/fiber@7.0.5
  const defaultControls = useThree((state) => state.controls) as ControlsProto;
  const { raycaster, camera, size } = useThree();

  const {
    currentModel,
    hoveredModel,
    buildPlateSize,
    rotateModel,
    translateModel,
    transformModel,
    setCurrentModel,
    setHoveredModel,
  } = useVisualizerStore();

  const { model } = useVisualizerStore(
    (state) => ({
      model: state.models.find((m) => m.id === id),
    }),
    shallow
  );

  const modelOffPlate = model && isModelOutOfPlate([model], buildPlateSize).length > 0;

  useEffect(() => {
    const position = model?.position ? new Vector3(...model?.position) : new Vector3();
    const eulerRotation = model?.rotation ? new Euler(...model?.rotation, 'YXZ') : new Euler();
    const rotation = new Quaternion().setFromEuler(eulerRotation);
    const scale = model?.scale ? new Vector3(...model?.scale) : new Vector3(1, 1, 1);

    matrixRef.current.compose(position, rotation, scale);

    // force update a render on matrixRef
    matrixRef.current = matrixRef.current.clone();
  }, [model?.position, model?.rotation, model?.scale]);

  const { mouse2D, mouse3D, offset, plane, defaultModelPos } = useMemo(
    () => ({
      mouse2D: new Vector2(),
      mouse3D: new Vector3(),
      offset: new Vector3(),
      plane: new Plane(),
      defaultModelPos: new Vector3(),
    }),
    []
  );

  const getModelPosition = () => matrixRef.current.decompose(defaultModelPos, new Quaternion(), new Vector3());

  const bind = useGesture(
    {
      onPointerOver: ({ event }) => {
        event.stopPropagation();
      },
      onPointerDown: ({ event }) => {
        event.stopPropagation();
      },

      onClick: ({ event }) => {
        event.stopPropagation();
        setCurrentModel(id);
      },
      onContextMenu: ({ event }) => {
        event.stopPropagation();
        setCurrentModel(id);
      },

      onHover: ({ hovering }) => {
        setHoveredModel(hovering ? id : null);
        document.body.style.cursor = hovering ? 'pointer' : 'auto';
      },
      onDragStart: ({ event }) => {
        defaultControls.enabled = false;
        document.body.style.cursor = 'move';

        const { point } = event as any;
        getModelPosition();

        mouse3D.copy(point);
        offset.copy(mouse3D).sub(defaultModelPos);
      },
      onDrag: ({ xy: [x, y], intentional }) => {
        if (!intentional) return;

        const nx = ((x - size.left) / size.width) * 2 - 1;
        const ny = -((y - size.top) / size.height) * 2 + 1;

        mouse2D.set(nx, ny);
        raycaster.setFromCamera(mouse2D, camera);
        plane.setFromNormalAndCoplanarPoint(camera.up, mouse3D);
        raycaster.ray.intersectPlane(plane, mouse3D);

        // Update the matrix with the new position, maintaining the y-coordinate as initially clicked
        matrixRef.current.setPosition(
          mouse3D.x - offset.x,
          defaultModelPos.y, // Maintain the initial y-coordinate
          mouse3D.z - offset.z
        );
      },
      onDragEnd: () => {
        defaultControls.enabled = true;
        document.body.style.cursor = 'auto';

        const newPosition = new Vector3();
        matrixRef.current.decompose(newPosition, new Quaternion(), new Vector3());

        translateModel(id, newPosition.toArray());
      },
    },
    {
      drag: {
        filterTaps: true,
        tapsThreshold: 1,
      },
    }
  );

  return (
    <>
      <PivotControls
        visible={currentModel === id}
        autoTransform={true}
        matrix={matrixRef.current}
        // onDrag={(l) => {
        //   matrixRef.current.copy(l);
        // }}
        // onDragEnd={() => {
        //   const newPosition = new Vector3();
        //   const newRotationQuaternion = new Quaternion();
        //   const newRotationEuler = new Euler();
        //   const newScale = new Vector3();

        //   matrixRef.current.decompose(newPosition, newRotationQuaternion, newScale);
        //   newRotationEuler.setFromQuaternion(newRotationQuaternion, 'YXZ');

        //   // Update the model
        //   transformModel(
        //     id,
        //     newPosition.toArray(),
        //     newRotationEuler.toArray().slice(0, 3) as [number, number, number],
        //     newScale.toArray()
        //   );
        // }}
        fixed
        disableSliders
        depthTest={false}
        opacity={0.8}
        anchor={[0, 0, 0]}
        scale={125}
        lineWidth={5}
        annotations={false}
      >
        <mesh {...(bind() as any)} ref={meshRef} name={id} dispose={null} userData={{ type: 'model' }}>
          <primitive object={geometry} attach="geometry" />
          <meshPhongMaterial
            color={
              modelOffPlate ? 0xef4444 : currentModel === id ? 0x6e405f : hoveredModel === id ? 0x6b7280 : 0x9ca3af
            }
            opacity={1}
            flatShading
            side={DoubleSide}
          />
        </mesh>

        {currentModel === id && geometry.boundingBox && <CornerMarkers boundingBox={geometry.boundingBox} />}
      </PivotControls>
    </>
  );
}

export default Model;
