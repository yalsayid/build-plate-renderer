import { IModel } from '../types/types';

export const isModelOutOfPlate = (models: IModel[], buildPlateSize: [number, number, number]) => {
  let outOfPlateModels: IModel[] = [];

  models.forEach((model) => {
    const sizeAdjustmentX = model.size[0] / 2;
    const sizeAdjustmentZ = model.size[2] / 2;

    if (
      model.position[0] - sizeAdjustmentX < -buildPlateSize[0] / 2 ||
      model.position[0] + sizeAdjustmentX > buildPlateSize[0] / 2 ||
      model.position[2] - sizeAdjustmentZ < -buildPlateSize[1] / 2 ||
      model.position[2] + sizeAdjustmentZ > buildPlateSize[1] / 2 ||
      model.size[1] > buildPlateSize[2]
    ) {
      outOfPlateModels.push(model);
    }
  });

  return outOfPlateModels;
};
