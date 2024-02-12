import { BufferGeometry } from 'three';
import { IModel } from '@/types/types';
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
} from '../zustand/selectors';
import { useTemporalStore, useVisualizerStore } from '../zustand/store';
import { isModelOutOfPlate } from '../utils/isModelOutOfPlate';
import { v4 as uuidv4 } from 'uuid';
import loadGeometry from '@/loaders/GeometryLoader';

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
    setBuildPlateSize,
    resetVisualizer,
  } = useVisualizerStore();

  const { undo, redo, clear } = useTemporalStore((state) => state);

  const warningModelsOutOfPlate = () => {
    return isModelOutOfPlate(allObjects, buildPlateSize).length > 0;
  };

  const addNewObject = async (
    model: Partial<IModel> & {
      modelId: number;
      modelUrl: string;
      format: 'stl' | 'obj' | '3mf';
    },
    combineGeometries?: boolean
  ) => {
    // Load geometry from the provided URL and format, respecting the combineGeometries preference
    const loaded = await loadGeometry(model.modelUrl, model.format, combineGeometries);

    // Determine if the result is a single geometry or an array of geometries
    const geometries = loaded.geometry instanceof BufferGeometry ? [loaded.geometry] : loaded.geometry;

    geometries.forEach((geometry) => {
      const newModel: IModel = {
        ...model,
        id: uuidv4(),
        geometry, // Use the loaded geometry
        position: model.position || [0, 0, 0],
        rotation: model.rotation || [0, 0, 0],
        scale: model.scale || [1, 1, 1],
        size: size.toArray() as [number, number, number],
      };

      addModel(newModel);
    });
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
    undoLastAction,
    redoLastAction,
    clearActionHistory,
    resetVisualizer,
  };
};

export default useReact3DPrintView;
