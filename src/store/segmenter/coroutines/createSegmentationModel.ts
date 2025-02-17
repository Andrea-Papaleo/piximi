import { ModelType, SegmenterArchitectureOptions } from "types";
import {
  createFCNSegmenterModel,
  createSimpleFCNSegmenterModel,
} from "../../coroutine-models";

export const createSegmentationModel = async (
  architectureOptions: SegmenterArchitectureOptions,
  numClasses: number
) => {
  switch (architectureOptions.selectedModel.modelType) {
    case ModelType.FCNSegmenter: {
      return createFCNSegmenterModel(
        architectureOptions.inputShape,
        numClasses
      );
    }
    case ModelType.SimpleFCNSegmenter: {
      return createSimpleFCNSegmenterModel(
        architectureOptions.inputShape,
        numClasses
      );
    }
    default: {
      throw new Error("Invalid model selected");
    }
  }
};
