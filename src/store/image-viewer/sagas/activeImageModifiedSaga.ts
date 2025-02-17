import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, select } from "redux-saga/effects";

import { imageViewerSlice } from "store/image-viewer";
import { imageSelector } from "store/common";

import { Color } from "types";

import {
  convertImageURIsToImageData,
  mapChannelsToSpecifiedRGBImage,
} from "image/imageHelper";

export function* activeImageIDChangeSaga({
  payload: { imageId, execSaga },
}: PayloadAction<{ imageId: string | undefined; execSaga: boolean }>) {
  if (!execSaga) return;

  const image: ReturnType<typeof imageSelector> = yield select(imageSelector);

  if (!image) {
    yield put(
      imageViewerSlice.actions.setActiveImageRenderedSrcs({
        renderedSrcs: [],
      })
    );
    return;
  }

  /*
   * Since converting each plane to image data, and mapping them to RGBs
   * can take some time, there is a a window of time where the previous
   * active image will be shown in the annotator. To avoid this, we want
   * to first set renderedSrcs to just the already rendered image src,
   * then after prerendering srcs for each plane, we replace it.
   */
  yield put(
    imageViewerSlice.actions.setActiveImageRenderedSrcs({
      renderedSrcs: [image.src],
    })
  );

  const planesData: Awaited<ReturnType<typeof convertImageURIsToImageData>> =
    yield call(convertImageURIsToImageData, image.originalSrc);

  const renderedSrcs = planesData.map((planeData) => {
    return mapChannelsToSpecifiedRGBImage(
      planeData,
      image.colors,
      image.shape.height,
      image.shape.width
    );
  });

  yield put(
    imageViewerSlice.actions.setActiveImageRenderedSrcs({ renderedSrcs })
  );
}

export function* activeImageColorChangeSaga({
  payload: { colors, execSaga },
}: PayloadAction<{
  colors: Array<Color>;
  execSaga: boolean;
}>) {
  if (!execSaga) return;

  const image: ReturnType<typeof imageSelector> = yield select(imageSelector);

  if (!image) return;

  const planesData: Awaited<ReturnType<typeof convertImageURIsToImageData>> =
    yield call(convertImageURIsToImageData, image.originalSrc);

  const renderedSrcs = planesData.map((planeData, idx) => {
    return mapChannelsToSpecifiedRGBImage(
      planeData,
      colors,
      image.shape.height,
      image.shape.width
    );
  });

  yield put(
    imageViewerSlice.actions.setActiveImageRenderedSrcs({ renderedSrcs })
  );
}
