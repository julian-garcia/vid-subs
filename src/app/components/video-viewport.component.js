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
    this.loop;
  }

  injectVideoFrame(url) {
    const videoID = url.split('v=')[1];
    if (this.player) { this.player.destroy(); }
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
      const urlEntered = e.target.value;
      if (/^https:\/\/www.youtube.com\/watch\?v=/.test(urlEntered)) {
        if (this.loop) { 
          clearInterval(this.loop); 
          this.currentTime = 0;
          this.navPosition = 0;
          this.subtitleStart.value = '';
          this.subtitleEnd.value = '';
          this.videoNavStart.style.left = '0%';
          this.videoNavEnd.style.left = '2%';
        }
        this.subtitleStart.value = '0:00:00';
        this.subtitleEnd.value = '0:00:01';
        this.injectVideoFrame(urlEntered);
      }
    });
  } 

  onMoveVideoMarkers() {
    let mouseDown = false;
    this.videoNav.addEventListener('mousedown', (event) => {
      if (!document.querySelector('iframe.video__viewport')) { return; }
      event.preventDefault();
      this.markerClasses = event.target.classList;
      mouseDown = true;
    });

    this.videoNav.addEventListener('mouseup', (event) => {
      if (!document.querySelector('iframe.video__viewport')) { return; }
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
      }
    });

    this.videoNav.addEventListener('mousemove', (event) => {
      if (!document.querySelector('iframe.video__viewport')) { return; }
      if (mouseDown && this.markerClasses.contains('video__marker-end')) {
        let markerPosition = event.clientX - ((window.innerWidth - this.videoNav.offsetWidth) / 2);
        let markerPercent = (markerPosition / this.videoNav.offsetWidth) * 100;

        if (markerPercent <= 98.5) {
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
      this.loop = setInterval(this.playing.bind(this,event), 1000);
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