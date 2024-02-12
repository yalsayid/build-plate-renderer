import { IModel } from '@/types/types';

export const isModelOutOfPlate = (models: IModel[], buildPlateSize: [number, number, number]) => {
  let outOfPlateModels: IModel[] = [];

  models.forEach((model) => {
    // Assuming the geometry's boundingBox property has been computed elsewhere
    if (!model.geometry.boundingBox) {
      model.geometry.computeBoundingBox();
    }
    // Ensure boundingBox is not null after computeBoundingBox call
    if (model.geometry.boundingBox) {
      const sizeX = model.geometry.boundingBox.max.x - model.geometry.boundingBox.min.x;
      const sizeZ = model.geometry.boundingBox.max.z - model.geometry.boundingBox.min.z;
      const sizeY = model.geometry.boundingBox.max.y - model.geometry.boundingBox.min.y;

      const sizeAdjustmentX = sizeX / 2;

      const sizeAdjustmentZ = sizeZ / 2;

      if (
        model.position[0] - sizeAdjustmentX < -buildPlateSize[0] / 2 ||
        model.position[0] + sizeAdjustmentX > buildPlateSize[0] / 2 ||
        model.position[2] - sizeAdjustmentZ < -buildPlateSize[1] / 2 ||
        model.position[2] + sizeAdjustmentZ > buildPlateSize[1] / 2 ||
        sizeY > buildPlateSize[2]
      ) {
        outOfPlateModels.push(model);
      }
    } else {
      console.warn('Bounding box not computed for model', model.id);
    }
  });

  return outOfPlateModels;
};
