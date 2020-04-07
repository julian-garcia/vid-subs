export class Utilities {
  getStoredSubtitles(videoID) {
    return JSON.parse(localStorage.getItem(`vidSubs-${videoID}`)) || [];
  }
}