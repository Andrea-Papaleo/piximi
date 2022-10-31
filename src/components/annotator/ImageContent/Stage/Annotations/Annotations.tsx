import { AnnotationTool } from "annotator/image/Tool";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectedAnnotationObjectsSelector,
  unselectedAnnotationObjectsSelector,
} from "store/common";
import { Annotation } from "./Annotation/Annotation";
import { Transformer } from "./Annotation/Transformer";

export const Annotations = ({
  selected,
  unselected,
  annotationTool,
}: {
  selected?: boolean;
  unselected?: boolean;
  annotationTool?: AnnotationTool;
}) => {
  const selectedAnnotationObjects = useSelector(
    selectedAnnotationObjectsSelector
  );
  const stagedAnnotationObjects = useSelector(
    unselectedAnnotationObjectsSelector
  );

  return (
    <>
      {(selected || !unselected) &&
        selectedAnnotationObjects.map((annotationObject) => (
          <>
            <Annotation
              key={annotationObject.annotation.id}
              annotation={annotationObject.annotation}
              imageShape={annotationObject.imageShape}
              fillColor={annotationObject.fillColor}
            />
            <Transformer
              annotationId={annotationObject.annotation.id}
              annotationTool={annotationTool}
              key={`tr-${annotationObject.annotation.id}`}
            />
          </>
        ))}
      {(unselected || !selected) &&
        stagedAnnotationObjects.map((annotationObject) => (
          <Annotation
            annotation={annotationObject.annotation}
            imageShape={annotationObject.imageShape}
            fillColor={annotationObject.fillColor}
            key={annotationObject.annotation.id}
          />
        ))}
    </>
  );
};
