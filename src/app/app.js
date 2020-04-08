export const run = (videoComponent, subtitleComponent) => {
  videoComponent.onUrlEntry();
  videoComponent.onMoveVideoMarkers();
  videoComponent.onClickVideoControls();
  videoComponent.onSubtitleEdit();
  subtitleComponent.onUrlEntry();
  subtitleComponent.onAddSubtitle();
  subtitleComponent.onDownloadSubtitles();
  subtitleComponent.onUploadSubtitles();
  subtitleComponent.onClickSubtitles();
  subtitleComponent.onDurationAvailable();
};