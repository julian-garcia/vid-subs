export const run = (videoComponent, subtitleComponent) => {
  videoComponent.onUrlEntry();
  videoComponent.onMoveVideoMarkers();
  subtitleComponent.onUrlEntry();
  subtitleComponent.onAddSubtitle();
};