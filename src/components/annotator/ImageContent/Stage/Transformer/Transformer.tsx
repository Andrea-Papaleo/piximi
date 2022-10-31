import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Konva from "konva";
import * as ReactKonva from "react-konva";
import * as _ from "lodash";
import * as ImageJS from "image-js";
import useSound from "use-sound";

import {
  imageViewerSlice,
  imageWidthSelector,
  stageScaleSelector,
  selectedAnnotationSelector,
  selectedAnnotationsSelector,
  soundEnabledSelector,
  activeImageIdSelector,
  cursorSelector,
  imageHeightSelector,
  setSelectedAnnotations,
  unselectedAnnotationsSelector,
} from "store/image-viewer";

import { AnnotationModeType, AnnotationStateType, AnnotationType } from "types";

import { AnnotationTool } from "annotator/image/Tool";
import { decode, encode } from "annotator/image/rle";
import createAnnotationSoundEffect from "annotator/sounds/pop-up-on.mp3";
import deleteAnnotationSoundEffect from "annotator/sounds/pop-up-off.mp3";

type box = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

type TransformerProps = {
  transformPosition: ({
    x,
    y,
  }: {
    x: number;
    y: number;
  }) => { x: number; y: number } | undefined;
  annotationId: string;
  annotationTool?: AnnotationTool;
};

export const Transformer = ({
  transformPosition,
  annotationId,
  annotationTool,
}: TransformerProps) => {
  const unselectedAnnotations = useSelector(unselectedAnnotationsSelector);

  const selectedAnnotation = useSelector(selectedAnnotationSelector);

  const selectedAnnotations = useSelector(selectedAnnotationsSelector);

  const transformerRef = useRef<Konva.Transformer | null>(null);

  const activeImageId = useSelector(activeImageIdSelector);

  const dispatch = useDispatch();

  const [boundBox, setBoundBox] = useState<box | null>(null);

  const [startBox, setStartBox] = useState<box>({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    rotation: 0,
  });

  const [center, setCenter] = useState<{ x: number; y: number } | undefined>();

  const stageScale = useSelector(stageScaleSelector);

  const cursor = useSelector(cursorSelector);

  const soundEnabled = useSelector(soundEnabledSelector);

  const imageWidth = useSelector(imageWidthSelector);
  const imageHeight = useSelector(imageHeightSelector);

  const [playCreateAnnotationSoundEffect] = useSound(
    createAnnotationSoundEffect
  );

  const [playDeleteAnnotationSoundEffect] = useSound(
    deleteAnnotationSoundEffect
  );

  const boundingBoxFunc = (oldBox: box, newBox: box) => {
    if (newBox.width < 5 || newBox.height < 5) {
      return oldBox;
    }
    return newBox;
  };

  const onTransformEnd = (e: any) => {};

  const onSaveAnnotationClick = (event: Konva.KonvaEventObject<Event>) => {
    const container = event.target.getStage()!.container();
    container.style.cursor = cursor;

    if (!activeImageId) return;

    dispatch(
      imageViewerSlice.actions.setImageInstances({
        instances: [...unselectedAnnotations, ...selectedAnnotations],
        imageId: activeImageId,
      })
    );

    transformerRef.current!.detach();
    transformerRef.current!.getLayer()?.batchDraw();

    clearAnnotations();
    if (soundEnabled) playCreateAnnotationSoundEffect();
  };

  const onClearAnnotationClick = (event: Konva.KonvaEventObject<Event>) => {
    const container = event.target.getStage()!.container();
    container.style.cursor = cursor;

    clearAnnotations();
    if (soundEnabled) playDeleteAnnotationSoundEffect();
  };

  const clearAnnotations = () => {
    if (annotationTool) {
      annotationTool.deselect();
    } else {
      dispatch(
        imageViewerSlice.actions.setAnnotationState({
          annotationState: AnnotationStateType.Blank,
          annotationTool: annotationTool,
          execSaga: true,
        })
      );
    }

    dispatch(
      imageViewerSlice.actions.setSelectionMode({
        selectionMode: AnnotationModeType.New,
      })
    );

    dispatch(
      setSelectedAnnotations({
        selectedAnnotations: [],
        selectedAnnotation: undefined,
      })
    );
  };

  const onMouseEnter = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const container = event.target.getStage()!.container();
    container.style.cursor = "pointer";
  };

  const onMouseLeave = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const container = event.target.getStage()!.container();
    container.style.cursor = cursor;
  };

  let posX = 0;
  let posY = 0;

  if (selectedAnnotation && selectedAnnotations.length === 1) {
    posX =
      Math.max(
        selectedAnnotation.boundingBox[0],
        selectedAnnotation.boundingBox[2]
      ) * stageScale;
    posY =
      Math.max(
        selectedAnnotation.boundingBox[1],
        selectedAnnotation.boundingBox[3]
      ) * stageScale;
  }

  return (
    <>
      <ReactKonva.Group>
        <ReactKonva.Transformer
          boundBoxFunc={boundingBoxFunc}
          onTransformEnd={onTransformEnd}
          id={"tr-".concat(annotationId)}
          ref={transformerRef}
          rotateEnabled={false}
        />
        {selectedAnnotation && selectedAnnotations.length === 1 && (
          <>
            <ReactKonva.Group>
              <ReactKonva.Label
                position={{
                  x: posX - 58,
                  y: posY + 6,
                }}
                onClick={onSaveAnnotationClick}
                onTap={onSaveAnnotationClick}
                id={"label"}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <ReactKonva.Tag
                  cornerRadius={3}
                  fill={"darkgreen"}
                  lineJoin={"round"}
                  shadowColor={"black"}
                  shadowBlur={10}
                  shadowOffset={{ x: 5, y: 5 }}
                />
                <ReactKonva.Text
                  fill={"white"}
                  fontSize={14}
                  padding={6}
                  text={"Confirm"}
                />
              </ReactKonva.Label>
              <ReactKonva.Label
                position={{
                  x: posX - 52,
                  y: posY + 35,
                }}
                onClick={onClearAnnotationClick}
                onTap={onClearAnnotationClick}
                id={"label"}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <ReactKonva.Tag
                  cornerRadius={3}
                  fill={"darkred"}
                  lineJoin={"round"}
                  shadowColor={"black"}
                  shadowBlur={10}
                  shadowOffset={{ x: 5, y: 5 }}
                />
                <ReactKonva.Text
                  fill={"white"}
                  fontSize={14}
                  padding={6}
                  text={"Cancel"}
                />
              </ReactKonva.Label>
            </ReactKonva.Group>
          </>
        )}
      </ReactKonva.Group>
    </>
  );
};
