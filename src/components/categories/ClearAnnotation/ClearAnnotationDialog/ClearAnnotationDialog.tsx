import { useDispatch } from "react-redux";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import { imageViewerSlice } from "store/image-viewer";
import { projectSlice } from "store/project";

import { Category } from "types";

type ClearAnnotationDialogProps = {
  category: Category;
  onClose: () => void;
  open: boolean;
};

export const ClearAnnotationDialog = ({
  category,
  onClose,
  open,
}: ClearAnnotationDialogProps) => {
  const dispatch = useDispatch();

  const onClear = () => {
    dispatch(
      imageViewerSlice.actions.clearCategoryAnnotations({ category: category })
    );

    dispatch(projectSlice.actions.clearAnnotations({ category: category }));

    onClose();
  };

  return (
    <Dialog fullWidth onClose={onClose} open={open}>
      <DialogTitle>Clear "{category.name}" annotations?</DialogTitle>

      <DialogContent>
        Annotations categorized as "{category.name}" will be deleted".
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>

        <Button onClick={onClear} color="primary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
