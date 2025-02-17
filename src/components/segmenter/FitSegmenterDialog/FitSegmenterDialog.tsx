import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Dialog, DialogContent, List } from "@mui/material";

import { FitSegmenterDialogAppBar } from "../FitSegmenterDialogAppBar";
import { SegmenterArchitectureSettingsListItem } from "../ArchitectureSettingsListItem";

import { OptimizerSettingsListItem } from "components/common/OptimizerSettingsListItem";
import { DatasetSettingsListItem } from "components/common/DatasetSettingsListItem/DatasetSettingsListItem";
import { AlertDialog } from "components/common/AlertDialog/AlertDialog";
import { ModelSummaryTable } from "components/common/ModelSummary";
import { TrainingHistoryPlot } from "components/common/TrainingHistoryPlot";
import { DialogTransition } from "components/common/DialogTransition";

import { alertStateSelector } from "store/application";
import { annotatedImagesSelector } from "store/project";
import {
  segmenterTrainingFlagSelector,
  segmenterCompiledModelSelector,
  segmenterFitOptionsSelector,
  segmenterCompileOptionsSelector,
  segmenterTrainingPercentageSelector,
  segmenterSlice,
} from "store/segmenter";

import {
  AlertStateType,
  AlertType,
  LossFunction,
  OptimizationAlgorithm,
} from "types";

type FitSegmenterDialogProps = {
  closeDialog: () => void;
  openedDialog: boolean;
};

export const FitSegmenterDialog = (props: FitSegmenterDialogProps) => {
  const dispatch = useDispatch();
  const { closeDialog, openedDialog } = props;

  const [currentEpoch, setCurrentEpoch] = useState<number>(0);

  const [showWarning, setShowWarning] = useState<boolean>(true);
  const [noLabeledImages, setNoLabeledImages] = useState<boolean>(false);
  const [showPlots, setShowPlots] = useState<boolean>(false);

  const [trainingAccuracy, setTrainingAccuracy] = useState<
    { x: number; y: number }[]
  >([]);

  const [validationAccuracy, setValidationAccuracy] = useState<
    { x: number; y: number }[]
  >([]);

  const [trainingLoss, setTrainingLoss] = useState<{ x: number; y: number }[]>(
    []
  );

  const [validationLoss, setValidationLoss] = useState<
    { x: number; y: number }[]
  >([]);

  const currentlyTraining = useSelector(segmenterTrainingFlagSelector);
  const annotatedImages = useSelector(annotatedImagesSelector);
  const compiledModel = useSelector(segmenterCompiledModelSelector);
  const alertState = useSelector(alertStateSelector);

  const fitOptions = useSelector(segmenterFitOptionsSelector);
  const compileOptions = useSelector(segmenterCompileOptionsSelector);

  const trainingPercentage = useSelector(segmenterTrainingPercentageSelector);

  const dispatchBatchSizeCallback = (batchSize: number) => {
    dispatch(
      segmenterSlice.actions.updateSegmentationBatchSize({
        batchSize: batchSize,
      })
    );
  };

  const dispatchLearningRateCallback = (learningRate: number) => {
    dispatch(
      segmenterSlice.actions.updateSegmentationLearningRate({
        learningRate: learningRate,
      })
    );
  };

  const dispatchEpochsCallback = (epochs: number) => {
    dispatch(
      segmenterSlice.actions.updateSegmentationEpochs({ epochs: epochs })
    );
  };

  const dispatchOptimizationAlgorithmCallback = (
    optimizationAlgorithm: OptimizationAlgorithm
  ) => {
    dispatch(
      segmenterSlice.actions.updateSegmentationOptimizationAlgorithm({
        optimizationAlgorithm: optimizationAlgorithm,
      })
    );
  };

  const dispatchLossFunctionCallback = (lossFunction: LossFunction) => {
    dispatch(
      segmenterSlice.actions.updateSegmentationLossFunction({
        lossFunction: lossFunction,
      })
    );
  };

  const dispatchTrainingPercentageCallback = (trainPercentage: number) => {
    dispatch(
      segmenterSlice.actions.updateSegmentationTrainingPercentage({
        trainingPercentage: trainPercentage,
      })
    );
  };

  const noLabeledImageAlert: AlertStateType = {
    alertType: AlertType.Info,
    name: "No labeled images",
    description: "Please label images to train a model.",
  };

  useEffect(() => {
    if (annotatedImages.length === 0) {
      setNoLabeledImages(true);
      if (!noLabeledImages) {
        setShowWarning(true);
      }
    } else {
      setNoLabeledImages(false);
    }
  }, [annotatedImages, noLabeledImages]);

  const trainingHistoryCallback = (epoch: number, logs: any) => {
    const epochCount = epoch + 1;
    const trainingEpochIndicator = epochCount - 0.5;
    setCurrentEpoch(epochCount);

    if (logs.categoricalAccuracy) {
      setTrainingAccuracy((prevState) =>
        prevState.concat({
          x: trainingEpochIndicator,
          y: logs.categoricalAccuracy,
        })
      );
    }
    if (logs.val_categoricalAccuracy) {
      setValidationAccuracy((prevState) =>
        prevState.concat({ x: epochCount, y: logs.val_categoricalAccuracy })
      );
    }
    if (logs.loss) {
      setTrainingLoss((prevState) =>
        prevState.concat({ x: trainingEpochIndicator, y: logs.loss })
      );
    }

    if (logs.val_loss) {
      setValidationLoss((prevState) =>
        prevState.concat({ x: epochCount, y: logs.val_loss })
      );
    }

    setShowPlots(true);
  };

  const cleanUpStates = () => {
    setTrainingAccuracy([]);
    setValidationAccuracy([]);
    setTrainingLoss([]);
    setValidationLoss([]);
    setShowPlots(false);

    setCurrentEpoch(0);
  };

  const onFit = async () => {
    if (!currentlyTraining) {
      cleanUpStates();
    }

    dispatch(
      segmenterSlice.actions.fitSegmenter({
        onEpochEnd: trainingHistoryCallback,
        execSaga: true,
      })
    );
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      onClose={closeDialog}
      open={openedDialog}
      TransitionComponent={DialogTransition}
      style={{ zIndex: 1203, height: "100%" }}
    >
      <FitSegmenterDialogAppBar
        closeDialog={closeDialog}
        fit={onFit}
        disableFitting={noLabeledImages}
        epochs={fitOptions.epochs}
        currentEpoch={currentEpoch}
      />

      {showWarning && noLabeledImages && (
        <AlertDialog
          setShowAlertDialog={setShowWarning}
          alertState={noLabeledImageAlert}
        />
      )}

      {alertState.visible && <AlertDialog alertState={alertState} />}

      <DialogContent>
        <List dense>
          <SegmenterArchitectureSettingsListItem />

          <OptimizerSettingsListItem
            compileOptions={compileOptions}
            dispatchLossFunctionCallback={dispatchLossFunctionCallback}
            dispatchOptimizationAlgorithmCallback={
              dispatchOptimizationAlgorithmCallback
            }
            dispatchEpochsCallback={dispatchEpochsCallback}
            fitOptions={fitOptions}
            dispatchBatchSizeCallback={dispatchBatchSizeCallback}
            dispatchLearningRateCallback={dispatchLearningRateCallback}
          />

          <DatasetSettingsListItem
            trainingPercentage={trainingPercentage}
            dispatchTrainingPercentageCallback={
              dispatchTrainingPercentageCallback
            }
          />
        </List>

        {showPlots && (
          <div>
            <TrainingHistoryPlot
              metric={"accuracy"}
              currentEpoch={currentEpoch}
              trainingValues={trainingAccuracy}
              validationValues={validationAccuracy}
            />

            <TrainingHistoryPlot
              metric={"loss"}
              currentEpoch={currentEpoch}
              trainingValues={trainingLoss}
              validationValues={validationLoss}
              dynamicYRange={true}
            />
          </div>
        )}

        {compiledModel && (
          <div>
            <ModelSummaryTable compiledModel={compiledModel} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
