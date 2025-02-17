import { ImageViewer, ShadowImageType } from "types";

export const imageHeightSelector = ({
  imageViewer,
}: {
  imageViewer: ImageViewer;
}) => {
  if (!imageViewer.images.length || !imageViewer.activeImageId) return;

  const image = imageViewer.images.find((image: ShadowImageType) => {
    return image.id === imageViewer.activeImageId;
  });

  if (!image) return;

  return image.shape.height;
};
