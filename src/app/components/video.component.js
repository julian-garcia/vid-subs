import { Utilities } from '../utilities';

export class VideoComponent {
  constructor() {
    this.urlEntryElement = document.getElementById('videoUrl');
    this.subtitleStart = document.getElementById('subtitleStart');
    this.subtitleEnd = document.getElementById('subtitleEnd');
    this.videoNavContainer = document.querySelector('.video-nav-container');
    this.videoNav = document.querySelector('.video__nav');
    this.videoNavStart = document.querySelector('.video__marker-start');
    this.videoNavEnd = document.querySelector('.video__marker-end');
    this.videoControls = document.querySelector('.video-controls');
    this.videoVolume = document.querySelector('.video__volume-container');
    this.videoVolumeLevel = document.querySelector('.video__volume-level');
    this.subtitleOverlay = document.querySelector('.subtitle-overlay');
    this.subtitleOverlayText = document.querySelector('.subtitle-overlay__text');
    this.player;
    this.currentTime;
    this.endTime;
    this.duration;
    this.navPosition;
    this.markerClasses;
    this.playLoop;
    this.videoID;
    this.volumeAdjust;
    this.mouseDown = false;
    this.utilities = new Utilities();
  }

  injectVideoFrame(url) {
    this.videoID = url.split('v=')[1];
    if (this.player) { this.player.destroy(); }
    this.player = new YT.Player('videoViewport', {
      height: '440',
      width: '900',
      videoId: this.videoID,
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
        if (this.playLoop) { 
          clearInterval(this.playLoop); 
          this.currentTime = 0;
          this.navPosition = 0;
          this.subtitleStart.value = '';
          this.subtitleEnd.value = '';
          this.videoNavStart.style.left = '0%';
          this.videoNavEnd.style.left = '0%';
        }
        this.subtitleStart.value = '00:00:00';
        this.subtitleEnd.value = '00:00:01';
        this.injectVideoFrame(urlEntered);
        localStorage.setItem('videoID', this.videoID);
      }
    });
  } 

  onMoveVideoMarkers() {
    this.mouseDown = false;

    this.videoNavContainer.addEventListener('mousedown', (event) => {
      if (!document.querySelector('iframe.video__viewport')) { return; }
      event.preventDefault();
      this.markerClasses = event.target.classList;
      this.mouseDown = true;
    });
    
    document.addEventListener('mouseup', (event) => {
      if (!document.querySelector('iframe.video__viewport')) { return; }

      let mouseDownVideoNav = false;
      event.target.classList.forEach(className => {
        if (className.indexOf('video-nav-container') !== -1 ||
            className.indexOf('video__nav')          !== -1 ||
            className.indexOf('video__marker')       !== -1) {
          mouseDownVideoNav = true;
        }
      });

      if (mouseDownVideoNav) {
        this.mouseDown = false;
        
        if (!this.markerClasses.contains('video__marker-end')) {
          this.navPosition = (this.getMarkerPosition(event) / this.videoNav.offsetWidth) * 100;
          this.setStartTime(this.navPosition);

          this.videoNavStart.style.left = `${this.navPosition}%`;
      
          if (this.currentTime >= (this.endTime || 0)) {
            this.videoNavEnd.style.left = `${this.navPosition + this.minimumPercentageGap}%`;
            this.setEndTime(this.navPosition + this.minimumPercentageGap);
          }

          this.player.seekTo((this.navPosition / 100) * this.duration);
        }
      }
    });

    document.addEventListener('mousemove', (event) => {
      if (!document.querySelector('iframe.video__viewport')) { return; }
      if (this.mouseDown && (this.markerClasses.contains('video__marker-end') || this.markerClasses.contains('video__marker-start'))) {
        this.navPosition = (this.getMarkerPosition(event) / this.videoNav.offsetWidth) * 100;

        if (this.navPosition <= 99.9) {
          if (this.markerClasses.contains('video__marker-end')) {
            this.videoNavEnd.style.left = `${this.navPosition}%`;
            this.setEndTime(this.navPosition);
          } else {
            this.videoNavStart.style.left = `${this.navPosition}%`;
            this.setStartTime(this.navPosition);
          }
        }
      }
    });
  }

  onClickVideoControls() {
    this.videoControls.addEventListener('click', (event) => {
      const controlClass = event.target.classList;
      if (this.player) {
        if (controlClass.contains('video__play')) { this.player.playVideo(); }
        if (controlClass.contains('video__pause')) { this.player.pauseVideo(); }
      }
    });

    this.videoControls.addEventListener('mousedown', (event) => {
      const controlClass = event.target.classList;
      this.adjustVolume(controlClass);
    });

    this.videoControls.addEventListener('mouseup', () => {
      clearInterval(this.volumeAdjust);
    });

    this.videoVolume.addEventListener('click', (event) => {
      let volumeLevel = (event.offsetX / this.videoVolume.offsetWidth) * 100;
      if (this.player) { 
        this.player.setVolume(volumeLevel); 
        this.videoVolumeLevel.style.width = `${volumeLevel}%`;
      }
    });
  }

  onSubtitleEdit() {
    document.addEventListener('editSubtitle', () => {
      const startSeconds = this.utilities.convertHMStoSeconds(this.subtitleStart.value);
      const endSeconds = this.utilities.convertHMStoSeconds(this.subtitleEnd.value);
      this.videoNavStart.style.left = `${(startSeconds / this.duration) * 100}%`;
      this.videoNavEnd.style.left = `${(endSeconds / this.duration) * 100}%`;
      this.player.seekTo(startSeconds);
      this.player.pauseVideo();
    });
  }

  adjustVolume(className) {
    let increment = 0;
    if (className.contains('video__volume-up') || className.contains('video__volume-down')) {
      increment = className.contains('video__volume-up') ? 1 : -1;
      if(this.player) {
        this.volumeAdjust = setInterval(() => {
          let playerVolume = this.player.getVolume();
          this.player.setVolume(playerVolume + increment);
          this.videoVolumeLevel.style.width = `${playerVolume}%`
        }, 100);
      }
    }
  }

  getMarkerPosition(event) {
    return Math.max(event.clientX - ((window.innerWidth - this.videoNav.offsetWidth) / 2), 0);
  }

  onPlayerReady(event) {
    this.duration = event.target.getDuration();
    this.minimumPercentageGap = (1 / this.duration) * 100;
    this.videoVolumeLevel.style.width = `${this.player.getVolume()}%`;
    document.dispatchEvent(new CustomEvent('duration', {detail: {duration: this.duration}}));
  }

  onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
      this.playLoop = setInterval(this.playing.bind(this,event), 1000);
    }
  }

  setCurrentTime(event) {
    this.currentTime = event.target.getCurrentTime();
    this.subtitleStart.value = this.utilities.convertSecondsToHMS(this.currentTime);
  }

  setEndTime(markerPosition) {
    this.endTime = this.duration * (markerPosition / 100);
    if (this.endTime <= 0  && !this.currentTime) { this.endTime  = 1; }
    if ((this.endTime <= this.currentTime) && this.currentTime) { this.endTime = this.currentTime + 1; }
    this.subtitleEnd.value = this.utilities.convertSecondsToHMS(this.endTime);
  }

  setStartTime(markerPosition) {
    this.currentTime = this.duration * (markerPosition / 100);
    this.subtitleStart.value = this.utilities.convertSecondsToHMS(this.currentTime);
  }

  playing(event) {
    if (!this.mouseDown) {
      this.setCurrentTime(event);
      this.navPosition = (this.currentTime / this.duration) * 100;
      this.videoNavStart.style.left = `${this.navPosition}%`;
  
      let startSeconds = Number(this.subtitleStart.value.replace(/:/g,''));
      let endSeconds = Number(this.subtitleEnd.value.replace(/:/g,''));
  
      if (startSeconds + 1 >= endSeconds) {
        this.setEndTime(this.navPosition + this.minimumPercentageGap);
        this.videoNavEnd.style.left = `${this.navPosition + this.minimumPercentageGap}%`;
      }
      this.showSubtitle();
    } else {
      event.target.pauseVideo();
    }
  }

  showSubtitle() {
    const subtitles = this.utilities.getStoredSubtitles(this.videoID);
    this.subtitleOverlayText.textContent = '';

    let showSubtitle = false;
    subtitles.forEach(subtitle => {
      if (this.currentTime >= this.utilities.convertHMStoSeconds(subtitle.startTime) &&
          this.currentTime <= this.utilities.convertHMStoSeconds(subtitle.endTime)) {
        this.subtitleOverlayText.textContent = subtitle.text;
        showSubtitle = true;
      }
    });

    if (showSubtitle) { 
      this.subtitleOverlay.classList.add('show'); 
    } else {
      this.subtitleOverlay.classList.remove('show');
    }
  }
}