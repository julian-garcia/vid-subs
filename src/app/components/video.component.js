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
          this.videoNavEnd.style.left = '0.5%';
        }
        this.subtitleStart.value = '00:00:00';
        this.subtitleEnd.value = '00:00:10';
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
            this.videoNavEnd.style.left = `${this.navPosition + .5}%`;
            this.setEndTime(this.navPosition + .5);
          }
  
          this.player.seekTo((this.navPosition / 100) * this.duration);
        }
      }
    });

    document.addEventListener('mousemove', (event) => {
      if (!document.querySelector('iframe.video__viewport')) { return; }
      if (this.mouseDown && (this.markerClasses.contains('video__marker-end') || this.markerClasses.contains('video__marker-start'))) {
        this.navPosition = (this.getMarkerPosition(event) / this.videoNav.offsetWidth) * 100;

        if (this.navPosition <= 99.5) {
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
      const startSeconds = this.convertHMStoSeconds(this.subtitleStart.value);
      const endSeconds = this.convertHMStoSeconds(this.subtitleEnd.value);
      this.videoNavStart.style.left = `${(startSeconds / this.duration) * 100}%`;
      this.videoNavEnd.style.left = `${(endSeconds / this.duration) * 100}%`;
      this.player.seekTo(startSeconds);
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
    return event.clientX - ((window.innerWidth - this.videoNav.offsetWidth) / 2);
  }

  onPlayerReady(event) {
    this.duration = event.target.getDuration();
    this.minimumPercentageGap = (10 / this.duration) * 100;
  }

  onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
      this.playLoop = setInterval(this.playing.bind(this,event), 1000);
    }
  }

  setCurrentTime(event) {
    this.currentTime = event.target.getCurrentTime();
    this.subtitleStart.value = this.convertSecondsToHMS(this.currentTime);
  }

  setEndTime(markerPosition) {
    this.endTime = this.duration * (markerPosition / 100);
    this.subtitleEnd.value = this.convertSecondsToHMS(this.endTime);
  }

  setStartTime(markerPosition) {
    this.currentTime = this.duration * (markerPosition / 100);
    this.subtitleStart.value = this.convertSecondsToHMS(this.currentTime);
  }
  
  convertSecondsToHMS(numSeconds) {
    let seconds, minutes, hours, secondsShow, minutesShow, hoursShow;

    hours = Math.floor(numSeconds / 60 / 60);
    minutes = Math.floor(numSeconds / 60) - (hours * 60);
    seconds = Math.floor(numSeconds - (minutes * 60) - (hours * 60 * 60));

    hoursShow = hours < 10 ? `0${hours}` : hours;
    minutesShow = minutes < 10 ? `0${minutes}` : minutes;
    secondsShow = seconds < 10 ? `0${seconds}` : seconds;

    return `${hoursShow}:${minutesShow}:${secondsShow}`;
  }

  convertHMStoSeconds(hms) {
    const hmsArray = hms.split(':');
    return (hmsArray[0] * 60 * 60) + (hmsArray[1] * 60) + Number(hmsArray[2]);
  }

  playing(event) {
    if (!this.mouseDown) {
      this.setCurrentTime(event);
      this.navPosition = (this.currentTime / this.duration) * 100;
      this.videoNavStart.style.left = `${this.navPosition}%`;
  
      let startSeconds = Number(this.subtitleStart.value.replace(/:/g,''));
      let endSeconds = Number(this.subtitleEnd.value.replace(/:/g,''));
  
      if (startSeconds + 9 >= endSeconds) {
        this.setEndTime(this.navPosition + this.minimumPercentageGap);
        this.videoNavEnd.style.left = `${this.navPosition + this.minimumPercentageGap}%`;
      }
    } else {
      event.target.pauseVideo();
    }
  }
}