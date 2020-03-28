export class VideoViewportComponent {
  constructor() {
    this.urlEntryElement = document.getElementById('videoUrl');
    this.subtitleStart = document.getElementById('subtitleStart');
    this.subtitleEnd = document.getElementById('subtitleEnd');
    this.videoNav = document.querySelector('.video__nav');
    this.videoNavStart = document.querySelector('.video__marker-start');
    this.videoNavEnd = document.querySelector('.video__marker-end');
    this.player;
    this.currentTime;
    this.endTime;
    this.duration;
    this.navPosition;
    this.markerClasses;
  }

  injectVideoFrame(url) {
    const videoID = url.split('v=')[1];
    this.player = new YT.Player('videoViewport', {
      height: '440',
      width: '900',
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

  onMoveVideoMarkers() {
    let mouseDown = false;
    this.videoNav.addEventListener('mousedown', (event) => {
      event.preventDefault();
      this.markerClasses = event.target.classList;
      mouseDown = true;
    });

    this.videoNav.addEventListener('mouseup', (event) => {
      mouseDown = false;

      if (!this.markerClasses.contains('video__marker-end')) {
        let offset = event.offsetX;
        if (event.target.classList.contains('video__marker-start')) {
          offset += event.target.offsetLeft;
        }
        this.navPosition = (offset / this.videoNav.offsetWidth) * 100;
        this.videoNavStart.style.left = `${this.navPosition}%`;
        if (this.currentTime >= this.endTime) {
          this.videoNavEnd.style.left = `${this.navPosition + 2}%`;
        }

        this.player.seekTo((this.navPosition / 100) * this.duration);
        // this.player.pauseVideo();
      }

      // if (this.markerClasses.contains('video__marker-end')) {
      //   const endMarkerPosition = (event.offsetX / this.videoNav.offsetWidth) * 100;
      //   const startMarkerPosition = Number(this.videoNavStart.style.left.replace('%',''));

      //   if (endMarkerPosition > startMarkerPosition) {
      //     this.videoNavEnd.style.left = `${endMarkerPosition}%`;
      //     this.setEndTime(endMarkerPosition);
      //   }
      // }
    });

    this.videoNav.addEventListener('mousemove', (event) => {
      if (mouseDown && this.markerClasses.contains('video__marker-end')) {
        let markerPosition = event.clientX - ((window.innerWidth - this.videoNav.offsetWidth) / 2);
        let markerPercent = (markerPosition / this.videoNav.offsetWidth) * 100;
        console.log(event.offsetX, markerPosition, markerPercent);
        if (markerPercent <= 99) {
          this.videoNavEnd.style.left = `${markerPercent}%`;
          this.setEndTime(markerPercent);
        }
      }
    });
  }

  onPlayerReady(event) {
    this.duration = event.target.getDuration();
  }

  onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
      setInterval(this.playing.bind(this,event), 1000);
    }
  }

  setCurrentTime(event) {
    this.currentTime = event.target.getCurrentTime();
    this.subtitleStart.value = this.convertSecondsToHMS(this.currentTime);
  }

  setEndTime(endMarkerPosition) {
    this.endTime = this.duration * (endMarkerPosition / 100);
    this.subtitleEnd.value = this.convertSecondsToHMS(this.endTime);
  }
  
  convertSecondsToHMS(numSeconds) {
    let seconds, minutes, hours;
    hours = Math.floor(numSeconds / 60 / 60);
    minutes = Math.floor(numSeconds / 60) - (hours * 60);
    seconds = Math.floor(numSeconds - (minutes * 60) - (hours * 60 * 60));
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${hours}:${minutes}:${seconds}`;
  }

  playing(event) {
    this.setCurrentTime(event);
    this.navPosition = (this.currentTime / this.duration) * 100;
    this.videoNavStart.style.left = `${this.navPosition}%`;
    if (this.navPosition + 2 >= Number(this.videoNavEnd.style.left.replace('%',''))) {
      this.videoNavEnd.style.left = `${this.navPosition + 2}%`;
    }
    if (this.subtitleStart.value >= this.subtitleEnd.value) {
      this.setEndTime(this.navPosition + 2);
    }
  }
}