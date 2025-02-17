import { AnnotationType, ImageViewer, ShadowImageType } from "types";

export const unselectedAnnotationsSelector = ({
  imageViewer,
}: {
  imageViewer: ImageViewer;
}): Array<AnnotationType> => {
  if (!imageViewer.images.length) return [];

  const image = imageViewer.images.find((image: ShadowImageType) => {
    return image.id === imageViewer.activeImageId;
  });

  if (!image) return [];

  const ids = imageViewer.selectedAnnotations.map(
    (annotation: AnnotationType) => {
      return annotation.id;
    }
  );

  return image.annotations.filter((annotation: AnnotationType) => {
    return !ids.includes(annotation.id);
  });
};
