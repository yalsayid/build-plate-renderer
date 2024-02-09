import { BufferGeometry, Vector3 } from 'three';
import { IModel, TransformMode } from '@/types/types';
import {
  useBuildPlateSize,
  useHoveredModel,
  useHoveredModelId,
  useModels,
  useSelectedModel,
  useSelectedModelFormat,
  useSelectedModelId,
  useSelectedModelPosition,
  useSelectedModelRaw,
  useSelectedModelRotation,
  useSelectedModelScale,
  useSelectedModelSize,
  useSelectedModelTransformMode,
} from '../zustand/selectors';
import { useTemporalStore, useVisualizerStore } from '../zustand/store';
import { isModelOutOfPlate } from '../utils/isModelOutOfPlate';
import { v4 as uuidv4 } from 'uuid';

const useReact3DPrintView = () => {
  const allObjects = useModels();
  const selectedObject = useSelectedModel();
  const hoveredObject = useHoveredModel();
  const hoveredObjectID = useHoveredModelId();
  const selectedObjectRaw = useSelectedModelRaw();
  const selectedObjectID = useSelectedModelId();
  const selectedObjectFormat = useSelectedModelFormat();
  const selectedObjectPosition = useSelectedModelPosition();
  const selectedObjectRotation = useSelectedModelRotation();
  const selectedObjectScale = useSelectedModelScale();
  const selectedObjectSize = useSelectedModelSize();
  const buildPlateSize = useBuildPlateSize();
  const selectedObjectTransformMode = useSelectedModelTransformMode();

  const {
    addModel,
    setCurrentModel,
    setHoveredModel,
    removeCurrentModel,
    removeModel,
    clearAllModels,
    translateModelAxis,
    rotateModelAxis,
    scaleModelAxis,
    scaleModelUniform,
    setModelTransformMode,
    setBuildPlateSize,
    resetVisualizer,
  } = useVisualizerStore();

  const { undo, redo, clear } = useTemporalStore((state) => state);

  const warningModelsOutOfPlate = () => {
    return isModelOutOfPlate(allObjects, buildPlateSize).length > 0;
  };

  /**
   * Adds a new model to the existing collection of models.
   *
   * @param model - This is a combination of two TypeScript types.
   *                1. Partial<IModel>: This allows for an object that partially fulfills the IModel interface.
   *                   Not all fields of IModel are required, only those fields that are actually provided will be used.
   *                2. { id: string; name: string; geometry: BufferGeometry; format: 'stl' | 'obj' | '3mf'; size: [number, number, number]; lowestPoint: number }:
   *                   This is an object type that enforces the model object must always include these fields, as they are essential for the function logic.
   *
   * The function creates a new IModel object, using the provided fields from the model object.
   * If some optional fields are not provided, it sets some default values.
   *
   * Finally, it calls the addModel function to add the new IModel object to the collection of models.
   */
  const addNewObject = (
    model: Partial<IModel> & {
      modelId: number;
      modelUrl: string;
      name: string;
      geometry: BufferGeometry;
      format: 'stl' | 'obj' | '3mf';
    }
  ) => {
    const { geometry } = model;
    if (!geometry || !geometry.boundingBox) return;

    const size = new Vector3();
    geometry.boundingBox.getSize(size);

    const lowestPoint = geometry.boundingBox.min.y;

    const newModel: IModel = {
      ...model,
      id: uuidv4(),
      position: model.position || [0, -lowestPoint || 0, 0],
      rotation: model.rotation || [0, 0, 0],
      scale: model.scale || [1, 1, 1],
      size: size.toArray() as [number, number, number],
      transformMode: model.transformMode || TransformMode.Translate,
    };

    addModel(newModel);
  };

  const setHoveredObjectById = (id: string | null) => {
    setHoveredModel(id);
  };

  const setSelectedObjectById = (id: string | null) => {
    setCurrentModel(id);
  };

  const removeSelectedObject = () => {
    removeCurrentModel();
  };

  const removeObjectById = (id: string) => {
    removeModel(id);
  };

  const clearAllObjects = () => {
    clearAllModels();
  };

  const updateBuildPlateSize = (size: [number, number, number]) => {
    setBuildPlateSize(size);
  };

  const updateModelTransformMode = (transformMode: TransformMode) => {
    if (!selectedObjectID) {
      return;
    }
    setModelTransformMode(selectedObjectID, transformMode);
  };

  const translateXSelectedObject = (translation: number) => {
    if (!selectedObjectID) {
      return;
    }
    translateModelAxis(selectedObjectID, 'x', translation);
  };

  const translateYSelectedObject = (translation: number) => {
    if (!selectedObjectID) {
      return;
    }
    translateModelAxis(selectedObjectID, 'z', -translation);
  };

  const translateZSelectedObject = (translation: number) => {
    if (!selectedObjectID) {
      return;
    }
    translateModelAxis(selectedObjectID, 'y', translation);
  };

  const rotateXSelectedObject = (rotation: number) => {
    if (!selectedObjectID) {
      return;
    }
    rotateModelAxis(selectedObjectID, 'x', rotation);
  };

  const rotateYSelectedObject = (rotation: number) => {
    if (!selectedObjectID) {
      return;
    }
    rotateModelAxis(selectedObjectID, 'z', rotation);
  };

  const rotateZSelectedObject = (rotation: number) => {
    if (!selectedObjectID) {
      return;
    }
    rotateModelAxis(selectedObjectID, 'y', rotation);
  };

  const scaleXSelectedObject = (scale: number) => {
    if (!selectedObjectID) {
      return;
    }
    scaleModelAxis(selectedObjectID, 'x', scale);
  };

  const scaleYSelectedObject = (scale: number) => {
    if (!selectedObjectID) {
      return;
    }
    scaleModelAxis(selectedObjectID, 'z', scale);
  };

  const scaleZSelectedObject = (scale: number) => {
    if (!selectedObjectID) {
      return;
    }
    scaleModelAxis(selectedObjectID, 'y', scale);
  };

  const scaleUniformSelectedObject = (scale: number) => {
    if (!selectedObjectID) {
      return;
    }
    scaleModelUniform(selectedObjectID, scale);
  };

  const undoLastAction = () => {
    undo();
  };

  const redoLastAction = () => {
    redo();
  };

  const clearActionHistory = () => {
    clear();
  };

  return {
    allObjects,
    hoveredObject,
    hoveredObjectID,
    setHoveredObjectById,
    selectedObject,
    selectedObjectRaw,
    selectedObjectID,
    selectedObjectFormat,
    selectedObjectSize,
    selectedObjectPosition,
    selectedObjectRotation,
    selectedObjectScale,
    setSelectedObjectById,
    buildPlateSize,
    selectedObjectTransformMode,
    warningModelsOutOfPlate,
    addNewObject,
    removeSelectedObject,
    removeObjectById,
    translateXSelectedObject,
    translateYSelectedObject,
    translateZSelectedObject,
    rotateXSelectedObject,
    rotateYSelectedObject,
    rotateZSelectedObject,
    scaleXSelectedObject,
    scaleYSelectedObject,
    scaleZSelectedObject,
    scaleUniformSelectedObject,
    clearAllObjects,
    updateBuildPlateSize,
    updateModelTransformMode,
    undoLastAction,
    redoLastAction,
    clearActionHistory,
    resetVisualizer,
  };
};

export default useReact3DPrintView;
