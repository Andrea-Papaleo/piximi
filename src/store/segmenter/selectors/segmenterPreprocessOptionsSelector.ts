import { PreprocessOptions } from "types/PreprocessOptions";
import { SegmenterStoreType } from "types/SegmenterStoreType";

export const segmenterPreprocessOptionsSelector = ({
  segmenter,
}: {
  segmenter: SegmenterStoreType;
}): PreprocessOptions => {
  return segmenter.preprocessOptions;
};
