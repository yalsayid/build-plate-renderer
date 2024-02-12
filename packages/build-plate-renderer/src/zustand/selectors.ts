import { useVisualizerStore } from "@/zustand/store";
import { IModel } from "@/types/types";

const swapModelValues = (model: IModel): IModel => {
  const clonedModel = {
    ...model,
    position: [...model.position],
    scale: [...model.scale],
    size: [...model.size],
    rotation: [...model.rotation],
  };

  clonedModel.position = [clonedModel.position[0], -clonedModel.position[2], clonedModel.position[1]];
  clonedModel.scale = [clonedModel.scale[0], clonedModel.scale[2], clonedModel.scale[1]];
  clonedModel.size = [clonedModel.size[0], clonedModel.size[2], clonedModel.size[1]];
  clonedModel.rotation = [clonedModel.rotation[0], clonedModel.rotation[2], clonedModel.rotation[1]];

  return {
    ...model,
    position: clonedModel.position as [number, number, number],
    rotation: clonedModel.rotation as [number, number, number],
    scale: clonedModel.scale as [number, number, number],
    size: clonedModel.size as [number, number, number]
  };
};

export const useHoveredModelId = (): string | null => {
  return useVisualizerStore((state) => state.hoveredModel);
};

export const useHoveredModel = (): IModel | null => {
  const models = useVisualizerStore((state) => state.models);
  const hoveredModelId = useHoveredModelId();
  if (!hoveredModelId) return null;

  const model = models.find((m) => m.id === hoveredModelId);
  if (!model) return null;

  return swapModelValues(model);
};

export const useSelectedModelId = (): string | null => {
  return useVisualizerStore((state) => state.currentModel);
};

export const useSelectedModel = (): IModel | null => {
  const models = useVisualizerStore((state) => state.models);
  const selectedModelId = useSelectedModelId();
  if (!selectedModelId) return null;

  const model = models.find((m) => m.id === selectedModelId);
  if (!model) return null;

  return swapModelValues(model);
};

export const useSelectedModelRaw = (): IModel | null => {
  const models = useVisualizerStore((state) => state.models);
  const selectedModelId = useSelectedModelId();
  if (!selectedModelId) return null;

  const model = models.find((m) => m.id === selectedModelId);
  if (!model) return null;

  return model;
};

export const useSelectedModelFormat = (): string | null => {
  const model = useSelectedModel();
  return model ? model.format : null;
};

export const useModels = (): IModel[] => {
  const models = useVisualizerStore((state) => state.models);
  return models.map(swapModelValues);
};

export const useBuildPlateSize = (): [number, number, number] => {
  return useVisualizerStore((state) => state.buildPlateSize);
};

export const useSelectedModelPosition = (): [number, number, number] | null => {
  const model = useSelectedModel();
  return model ? model.position : null;
};

export const useSelectedModelRotation = (): [number, number, number] | null => {
  const model = useSelectedModel();
  return model ? model.rotation : null;
};

export const useSelectedModelScale = (): [number, number, number] | null => {
  const model = useSelectedModel();
  return model ? model.scale : null;
};

export const useSelectedModelSize = (): [number, number, number] | null => {
  const model = useSelectedModel();
  return model ? model.size : null;
};
