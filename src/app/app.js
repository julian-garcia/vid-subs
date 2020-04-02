export const run = (videoComponent, subtitleComponent) => {
  videoComponent.onUrlEntry();
  videoComponent.onMoveVideoMarkers();
  videoComponent.onClickVideoControls();
  subtitleComponent.onUrlEntry();
  subtitleComponent.onAddSubtitle();
};