import { temporal, TemporalState } from 'zundo';
import { Box3, Mesh, Vector3 } from 'three';
import { produce } from 'immer';
import { IModel, TransformMode } from '../types/types';
import { shallow } from 'zustand/shallow';
import { useStore, create } from 'zustand';

interface StoreState {
  // State
  currentModel: string | null;
  hoveredModel: string | null;
  models: IModel[];
  buildPlateSize: [number, number, number];
  // Methods
  setCurrentModel: (id: string | null) => void;
  setHoveredModel: (id: string | null) => void;
  removeCurrentModel: () => void;
  addModel: (model: IModel) => void;
  removeModel: (id: string) => void;
  clearAllModels: () => void;
  translateModel: (id: string, position: [number, number, number]) => void;
  translateModelAxis: (id: string, axis: string, value: number) => void;
  rotateModel: (id: string, rotation: [number, number, number]) => void;
  rotateModelAxis: (id: string, axis: string, value: number) => void;
  scaleModel: (id: string, scale: [number, number, number]) => void;
  scaleModelAxis: (id: string, axis: string, value: number) => void;
  scaleModelUniform: (id: string, value: number) => void;
  transformModel: (
    id: string,
    position: [number, number, number],
    rotation: [number, number, number],
    scale: [number, number, number]
  ) => void;
  setModelTransformMode: (id: string, transformMode: TransformMode) => void;
  setBuildPlateSize: (size: [number, number, number]) => void;
  resetVisualizer: () => void;
}

type PartialStoreState = Omit<
  StoreState,
  'buildPlateSize' | 'hoveredModel' | 'currentModel'
>;

function calculateNewSizeAndPosition(
  model: IModel,
  newPosition: [number, number, number],
  newRotation: [number, number, number],
  newScale: [number, number, number]
): { newSize: [number, number, number]; newPosition: [number, number, number] } {
  // Clone the input values to ensure that they are not modified elsewhere
  const clonedPosition = [...newPosition] as [number, number, number];
  const clonedRotation = [...newRotation] as [number, number, number];
  const clonedScale = [...newScale] as [number, number, number];

  const transformedObject = new Mesh(model.geometry.clone()); // Clone the geometry if needed
  transformedObject.position.set(...clonedPosition);
  transformedObject.rotation.setFromVector3(new Vector3(...clonedRotation), 'YXZ');
  transformedObject.scale.set(...clonedScale);

  // Compute the bounding box of the transformed object
  const bbox = new Box3().setFromObject(transformedObject, true);

  // Compute the size of the bounding box
  const sizeVector = bbox.getSize(new Vector3());

  // Calculate the new position, adjusting the y-coordinate based on the lower bound of the bounding box
  const adjustedPosition: [number, number, number] = [
    clonedPosition[0],
    clonedPosition[1] - bbox.min.y,
    clonedPosition[2],
  ];

  return { newSize: [sizeVector.x, sizeVector.y, sizeVector.z], newPosition: adjustedPosition };
}

export const useVisualizerStore = create<StoreState>()(
  temporal(
    (set) => ({
      currentModel: null,
      hoveredModel: null,
      models: [],
      buildPlateSize: [235, 235, 250],
      setCurrentModel: (id) => {
        set({ currentModel: id });
      },
      setHoveredModel: (id) => {
        set({ hoveredModel: id });
      },
      removeCurrentModel: () =>
        set(
          produce((draft) => {
            if (draft.currentModel) {
              draft.models = draft.models.filter((m: IModel) => m.id !== draft.currentModel);
              draft.currentModel = null;
            }
          })
        ),
      addModel: (model) =>
        set(
          produce((draft) => {
            draft.models.push(model);
          })
        ),
      removeModel: (id) =>
        set(
          produce((draft) => {
            draft.models = draft.models.filter((m: IModel) => m.id !== id);
          })
        ),
      clearAllModels: () => set({ models: [] }),
      translateModel: (id, position) =>
        set(
          produce((draft) => {
            const model = draft.models.find((m: IModel) => m.id === id);
            if (model) {
              model.position = position;
            }
          })
        ),
      translateModelAxis: (id, axis, value) =>
        set(
          produce((draft) => {
            const model = draft.models.find((m: IModel) => m.id === id);
            if (model) {
              const axisIdx = 'xyz'.indexOf(axis);
              if (axisIdx !== -1) {
                model.position[axisIdx] = value;
              }
            }
          })
        ),
      rotateModel: (id, rotation) =>
        set(
          produce((draft) => {
            const model = draft.models.find((m: IModel) => m.id === id);
            if (model) {
              const { newSize, newPosition: adjustedPosition } = calculateNewSizeAndPosition(
                model,
                model.position,
                rotation,
                model.scale
              );

              model.rotation = rotation;
              model.position = adjustedPosition;
              model.size = newSize;
            }
          })
        ),
      rotateModelAxis: (id, axis, value) =>
        set(
          produce((draft) => {
            const model = draft.models.find((m: IModel) => m.id === id);
            if (model) {
              const axisIdx = 'xyz'.indexOf(axis);
              if (axisIdx !== -1) {
                model.rotation[axisIdx] = value;

                const { newSize, newPosition: adjustedPosition } = calculateNewSizeAndPosition(
                  model,
                  model.position,
                  model.rotation,
                  model.scale
                );

                model.position = adjustedPosition;
                model.size = newSize;
              }
            }
          })
        ),
      scaleModel: (id, scale) =>
        set(
          produce((draft) => {
            const model = draft.models.find((m: IModel) => m.id === id);
            if (model) {
              const { newSize, newPosition: adjustedPosition } = calculateNewSizeAndPosition(
                model,
                model.position,
                model.rotation,
                scale
              );

              model.scale = scale;
              model.position = adjustedPosition;
              model.size = newSize;
            }
          })
        ),
      scaleModelAxis: (id, axis, value) =>
        set(
          produce((draft) => {
            const model = draft.models.find((m: IModel) => m.id === id);
            if (model) {
              const axisIdx = 'xyz'.indexOf(axis);
              if (axisIdx !== -1) {
                model.scale[axisIdx] = value;

                const { newSize, newPosition: adjustedPosition } = calculateNewSizeAndPosition(
                  model,
                  model.position,
                  model.rotation,
                  model.scale
                );

                model.position = adjustedPosition;
                model.size = newSize;
              }
            }
          })
        ),
      scaleModelUniform: (id, value) =>
        set(
          produce((draft) => {
            const model = draft.models.find((m: IModel) => m.id === id);
            if (model) {
              const { newSize, newPosition: adjustedPosition } = calculateNewSizeAndPosition(
                model,
                model.position,
                model.rotation,
                [value, value, value]
              );

              model.scale = [value, value, value];
              model.position = adjustedPosition;
              model.size = newSize;
            }
          })
        ),
      transformModel: (id, position, rotation, scale) =>
        set(
          produce((draft) => {
            const model = draft.models.find((m: IModel) => m.id === id);
            if (model) {
              const { newSize, newPosition: adjustedPosition } = calculateNewSizeAndPosition(
                model,
                position,
                rotation,
                scale
              );

              model.position = adjustedPosition;
              model.rotation = rotation;
              model.scale = scale;
              model.size = newSize;
            }
          })
        ),
      setModelTransformMode: (id, transformMode) =>
        set(
          produce((draft) => {
            const model = draft.models.find((m: IModel) => m.id === id);
            if (model) {
              model.transformMode = transformMode;
            }
          })
        ),
      setBuildPlateSize: (size) => {
        set({ buildPlateSize: size });
      },
      resetVisualizer: () => {
        set({
          currentModel: null,
          models: [],
          buildPlateSize: [235, 235, 250],
        });
      },
    }),
    {
      equality: shallow,
      partialize: (state) => {
        const { buildPlateSize, hoveredModel, currentModel, ...rest } = state;
        return rest;
      },
    }
  )
);

export const useTemporalStore = <T,>(selector: (state: TemporalState<PartialStoreState>) => T) =>
  useStore(useVisualizerStore.temporal, selector);
