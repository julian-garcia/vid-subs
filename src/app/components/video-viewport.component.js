export class VideoViewportComponent {
  constructor() {
    this.urlEntryElement = document.getElementById('videoUrl');
    this.subtitleStart = document.getElementById('subtitleStart');
    this.videoNavStart = document.querySelector('.video__marker-start');
    this.player;
    this.currentTime;
    this.duration;
    this.navPosition;
  }

  injectVideoFrame(url) {
    const videoID = url.split('v=')[1];
    this.player = new YT.Player('videoViewport', {
      height: '390',
      width: '640',
      videoId: videoID,
      events: {
        'onReady': this.onPlayerReady.bind(this),
        'onStateChange': this.onPlayerStateChange.bind(this)
      }
    });
  }

  onUrlEntry() {
    this.urlEntryElement.addEventListener('change', (e) => {
      this.injectVideoFrame(e.target.value);
    });
  } 

  onPlayerReady(event) {
    this.duration = event.target.getDuration();
    event.target.playVideo();
  }

  onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
      setInterval(this.playing.bind(this,event), 1000);
    }
  }

  stopVideo() {
    this.player.stopVideo();
  }

  getCurrentTime(event) {
    let seconds, minutes, hours;
    this.currentTime = event.target.getCurrentTime();
    hours = Math.floor(this.currentTime / 60 / 60);
    minutes = Math.floor(this.currentTime / 60) - (hours * 60);
    seconds = Math.floor(this.currentTime - (minutes * 60) - (hours * 60 * 60));
    this.subtitleStart.value = `${hours}:${minutes}:${seconds}`;
  }

  getNavPosition() {
    this.navPosition = (this.currentTime / this.duration) * 100;
  }

  playing(event) {
    this.getCurrentTime(event);
    this.getNavPosition();
    this.moveVideoMarkers();
  }

  moveVideoMarkers() {
    this.videoNavStart.style.left = `${this.navPosition}%`;
  }
}