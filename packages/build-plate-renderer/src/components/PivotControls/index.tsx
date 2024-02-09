import * as THREE from 'three';
import * as React from 'react';
import { Size, useFrame, useThree } from '@react-three/fiber';

import { AxisArrow } from './AxisArrow';
import { PlaneSlider } from './PlaneSlider';
import { AxisRotator } from './AxisRotator';
import { context, OnDragStartProps } from './context';
import { ForwardRefComponent } from '../../utils/utils';
import { ScalingSphere } from './ScalingSphere';

const tV0 = new THREE.Vector3();
const tV1 = new THREE.Vector3();
const tV2 = new THREE.Vector3();

const getPoint2 = (point3: THREE.Vector3, camera: THREE.Camera, size: Size) => {
  const widthHalf = size.width / 2;
  const heightHalf = size.height / 2;
  camera.updateMatrixWorld(false);
  const vector = point3.project(camera);
  vector.x = vector.x * widthHalf + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;
  return vector;
};

const getPoint3 = (point2: THREE.Vector3, camera: THREE.Camera, size: Size, zValue: number = 1) => {
  const vector = tV0.set((point2.x / size.width) * 2 - 1, -(point2.y / size.height) * 2 + 1, zValue);
  vector.unproject(camera);
  return vector;
};

export const calculateScaleFactor = (point3: THREE.Vector3, radiusPx: number, camera: THREE.Camera, size: Size) => {
  const point2 = getPoint2(tV2.copy(point3), camera, size);
  let scale = 0;
  for (let i = 0; i < 2; ++i) {
    const point2off = tV1.copy(point2).setComponent(i, point2.getComponent(i) + radiusPx);
    const point3off = getPoint3(point2off, camera, size, point2off.z);
    scale = Math.max(scale, point3.distanceTo(point3off));
  }
  return scale;
};

const mL0 = new THREE.Matrix4();
const mW0 = new THREE.Matrix4();
const mP = new THREE.Matrix4();
const mPInv = new THREE.Matrix4();
const mW = new THREE.Matrix4();
const mL = new THREE.Matrix4();
const mL0Inv = new THREE.Matrix4();
const mdL = new THREE.Matrix4();
const mG = new THREE.Matrix4();

const bb = new THREE.Box3();
const bbObj = new THREE.Box3();
const vCenter = new THREE.Vector3();
const vSize = new THREE.Vector3();
const vAnchorOffset = new THREE.Vector3();
const vPosition = new THREE.Vector3();
const vScale = new THREE.Vector3();

const xDir = new THREE.Vector3(1, 0, 0);
const yDir = new THREE.Vector3(0, 1, 0);
const zDir = new THREE.Vector3(0, 0, 1);

type PivotControlsProps = {
  /** Scale of the gizmo, 1 */
  scale?: number;
  /** Width of the gizmo lines, this is a THREE.Line2 prop, 2.5 */
  lineWidth?: number;
  /** If fixed is true is remains constant, scale is now in pixels, false */
  fixed?: boolean;
  /** Gizmo position */
  gizmoPosition?: [number, number, number];
  /** Gizmo rotation */
  gizmoRotation?: [number, number, number];

  /** Starting matrix */
  matrix?: THREE.Matrix4;
  /** BBAnchor, each axis can be between -1/0/+1 */
  anchor?: [number, number, number];
  /** If autoTransform is true, automatically apply the local transform on drag, true */
  autoTransform?: boolean;
  /** Allows you to switch individual axes off */
  activeAxes?: [boolean, boolean, boolean];

  disableAxes?: boolean;
  disableSliders?: boolean;
  disableRotations?: boolean;
  disableScaling?: boolean;

  /** Limits */
  translationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined];
  rotationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined];
  scaleLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined];

  /** RGB colors */
  axisColors?: [string | number, string | number, string | number];
  /** Color of the hovered item */
  hoveredColor?: string | number;
  /** HTML value annotations, default: false */
  annotations?: boolean;
  /** CSS Classname applied to the HTML annotations */
  annotationsClass?: string;
  /** Drag start event */
  onDragStart?: (props: OnDragStartProps) => void;
  /** Drag event */
  onDrag?: (l: THREE.Matrix4, deltaL: THREE.Matrix4, w: THREE.Matrix4, deltaW: THREE.Matrix4) => void;
  /** Drag end event */
  onDragEnd?: () => void;
  /** Set this to false if you want the gizmo to be visible through faces */
  depthTest?: boolean;
  opacity?: number;
  visible?: boolean;
  userData?: { [key: string]: any };
  children?: React.ReactNode;
};

export const PivotControls: ForwardRefComponent<PivotControlsProps, THREE.Group> = React.forwardRef<
  THREE.Group,
  PivotControlsProps
>(
  (
    {
      matrix,
      onDragStart,
      onDrag,
      onDragEnd,
      autoTransform = true,
      anchor,
      disableAxes = false,
      disableSliders = false,
      disableRotations = false,
      disableScaling = false,
      activeAxes = [true, true, true],
      gizmoPosition = [0, 0, 0],
      gizmoRotation = [0, 0, 0],
      scale = 1,
      lineWidth = 4,
      fixed = false,
      translationLimits,
      rotationLimits,
      scaleLimits,
      depthTest = true,
      axisColors = ['#ff2060', '#20df80', '#2080ff'],
      hoveredColor = '#ffff40',
      annotations = false,
      annotationsClass,
      opacity = 1,
      visible = true,
      userData,
      children,
      ...props
    },
    fRef
  ) => {
    const invalidate = useThree((state) => state.invalidate);
    const parentRef = React.useRef<THREE.Group>(null!);
    const ref = React.useRef<THREE.Group>(null!);
    const gizmoRef = React.useRef<THREE.Group>(null!);
    const childrenRef = React.useRef<THREE.Group>(null!);
    const translation = React.useRef<[number, number, number]>([0, 0, 0]);
    const cameraScale = React.useRef<THREE.Vector3>(new THREE.Vector3(1, 1, 1));
    const gizmoScale = React.useRef<THREE.Vector3>(new THREE.Vector3(1, 1, 1));

    React.useLayoutEffect(() => {
      if (!anchor) return;
      childrenRef.current.updateWorldMatrix(true, true);

      mPInv.copy(childrenRef.current.matrixWorld).invert();
      bb.makeEmpty();
      childrenRef.current.traverse((obj: any) => {
        if (!obj.geometry) return;
        if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
        mL.copy(obj.matrixWorld).premultiply(mPInv);
        bbObj.copy(obj.geometry.boundingBox);
        bbObj.applyMatrix4(mL);
        bb.union(bbObj);
      });
      vCenter.copy(bb.max).add(bb.min).multiplyScalar(0.5);
      vSize.copy(bb.max).sub(bb.min).multiplyScalar(0.5);
      vAnchorOffset
        .copy(vSize)
        .multiply(new THREE.Vector3(...anchor))
        .add(vCenter);
      vPosition.set(...gizmoPosition).add(vAnchorOffset);
      gizmoRef.current && gizmoRef.current.position.copy(vPosition);
      invalidate();
    });

    const config = React.useMemo(
      () => ({
        onDragStart: (props: OnDragStartProps) => {
          mL0.copy(ref.current.matrix);
          mW0.copy(ref.current.matrixWorld);
          onDragStart && onDragStart(props);
          invalidate();
        },
        onDrag: (mdW: THREE.Matrix4) => {
          mP.copy(parentRef.current.matrixWorld);
          mPInv.copy(mP).invert();
          // After applying the delta
          mW.copy(mW0).premultiply(mdW);
          mL.copy(mW).premultiply(mPInv);
          mL0Inv.copy(mL0).invert();
          mdL.copy(mL).multiply(mL0Inv);
          if (autoTransform) {
            ref.current.matrix.copy(mL);
          }

          onDrag && onDrag(mL, mdL, mW, mdW);

          mG.makeRotationFromEuler(gizmoRef.current.rotation).setPosition(gizmoRef.current.position).premultiply(mW);
          gizmoScale.current.setFromMatrixScale(mG);
          gizmoRef.current.scale.copy(cameraScale.current).divide(gizmoScale.current);
          invalidate();
        },
        onDragEnd: () => {
          onDragEnd && onDragEnd();
          invalidate();
        },
        matrix,
        translation,
        translationLimits,
        rotationLimits,
        scaleLimits,
        axisColors,
        hoveredColor,
        opacity,
        scale,
        lineWidth,
        fixed,
        depthTest,
        userData,
        annotations,
        annotationsClass,
      }),
      [
        onDragStart,
        onDrag,
        onDragEnd,
        matrix,
        translation,
        translationLimits,
        rotationLimits,
        scaleLimits,
        depthTest,
        scale,
        lineWidth,
        fixed,
        ...axisColors,
        hoveredColor,
        opacity,
        userData,
        autoTransform,
        annotations,
        annotationsClass,
      ]
    );

    React.useEffect(() => {
      if (!matrix || !gizmoRef.current) return;

      parentRef.current.updateWorldMatrix(true, true);
      mW.copy(parentRef.current.matrixWorld).multiply(matrix);
      mG.makeRotationFromEuler(gizmoRef.current.rotation).setPosition(gizmoRef.current.position).premultiply(mW);
      gizmoScale.current.setFromMatrixScale(mG);
      gizmoRef.current.scale.copy(cameraScale.current).divide(gizmoScale.current);
    }, [matrix]);

    const vec = new THREE.Vector3();
    useFrame((state) => {
      if (fixed && gizmoRef.current) {
        const sf = calculateScaleFactor(gizmoRef.current.getWorldPosition(vec), scale, state.camera, state.size);
        cameraScale.current.setScalar(sf);
        if (gizmoRef.current) {
          vScale.copy(cameraScale.current).divide(gizmoScale.current);
          if (
            gizmoRef.current.scale.x !== vScale.x ||
            gizmoRef.current.scale.y !== vScale.y ||
            gizmoRef.current.scale.z !== vScale.z
          ) {
            gizmoRef.current.scale.copy(vScale);
            state.invalidate();
          }
        }
      }
    });

    React.useImperativeHandle(fRef, () => ref.current, []);

    React.useLayoutEffect(() => {
      if (!matrix) return;

      // If the matrix is a real matrix4 it means that the user wants to control the gizmo
      // In that case it should just be set, as a bare prop update would merely copy it
      ref.current.matrix = matrix;

      if (!gizmoRef.current) return;

      // Update gizmo scale in accordance with matrix changes
      parentRef.current.updateWorldMatrix(true, true);
      mW.copy(parentRef.current.matrixWorld).multiply(matrix);
      mG.makeRotationFromEuler(gizmoRef.current.rotation).setPosition(gizmoRef.current.position).premultiply(mW);
      gizmoScale.current.setFromMatrixScale(mG);
      gizmoRef.current.scale.copy(cameraScale.current).divide(gizmoScale.current);
    }, [matrix]);

    return (
      <context.Provider value={config}>
        <group ref={parentRef}>
          <group ref={ref} matrix={matrix} matrixAutoUpdate={false} {...props}>
            {visible && (
              <group ref={gizmoRef} visible={visible} position={gizmoPosition} rotation={gizmoRotation}>
                {!disableAxes && activeAxes[0] && <AxisArrow axis={0} direction={xDir} />}
                {!disableAxes && activeAxes[1] && <AxisArrow axis={1} direction={yDir} />}
                {!disableAxes && activeAxes[2] && <AxisArrow axis={2} direction={zDir} />}

                {!disableScaling && activeAxes[0] && <ScalingSphere axis={0} direction={xDir} />}
                {!disableScaling && activeAxes[1] && <ScalingSphere axis={1} direction={yDir} />}
                {!disableScaling && activeAxes[2] && <ScalingSphere axis={2} direction={zDir} />}

                {!disableSliders && activeAxes[0] && activeAxes[1] && <PlaneSlider axis={2} dir1={xDir} dir2={yDir} />}
                {!disableSliders && activeAxes[0] && activeAxes[2] && <PlaneSlider axis={1} dir1={zDir} dir2={xDir} />}
                {!disableSliders && activeAxes[2] && activeAxes[1] && <PlaneSlider axis={0} dir1={yDir} dir2={zDir} />}

                {!disableRotations && activeAxes[0] && activeAxes[1] && (
                  <AxisRotator axis={2} dir1={xDir} dir2={yDir} />
                )}
                {!disableRotations && activeAxes[0] && activeAxes[2] && (
                  <AxisRotator axis={1} dir1={zDir} dir2={xDir} />
                )}
                {!disableRotations && activeAxes[2] && activeAxes[1] && (
                  <AxisRotator axis={0} dir1={yDir} dir2={zDir} />
                )}
              </group>
            )}
            <group ref={childrenRef}>{children}</group>
          </group>
        </group>
      </context.Provider>
    );
  }
);
