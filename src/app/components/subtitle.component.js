import { Utilities } from '../utilities';

export class SubtitleComponent {
  constructor() {
    this.urlEntryElement = document.getElementById('videoUrl');
    this.subtitleText = document.getElementById('subtitleText');
    this.subtitleStart = document.getElementById('subtitleStart');
    this.subtitleEnd = document.getElementById('subtitleEnd');
    this.subtitleAdd = document.querySelector('.subtitle__add');
    this.subtitlesListing = document.querySelector('.subtitles__listing');
    this.subtitlesDownload = document.querySelector('.subtitles-download');
    this.subtitlesDownloadLink = document.getElementById('download');
    this.subtitlesUpload = document.querySelector('.subtitles-upload input');
    this.subtitleOriginal = document.querySelector('.subtitle__original');
    this.utilities = new Utilities();
    this.videoId;
    this.videoDuration;
  }

  onAddSubtitle() {
    this.subtitleAdd.addEventListener('click', () => {
      if (this.subtitleText.value && 
          this.subtitleStart.value && 
          this.subtitleEnd.value) {
        const subtitles = this.utilities.getStoredSubtitles(this.videoId);
        let existingIndex = -1;
        subtitles.forEach((subtitle, index) => {
          if (subtitle.startTime === this.subtitleStart.value && 
              subtitle.endTime === this.subtitleEnd.value) {
            existingIndex = index;
          }
        });
        if (existingIndex >= 0) {
          subtitles.splice(existingIndex,1);
          this.setStoredSubtitles(subtitles);
        }
        this.setVideoID();
        this.saveToLocalStorage();
        this.refreshSubtitleListing();
        this.subtitleText.value = '';
        this.subtitleOriginal.textContent = '';
      }
    });
  }

  onUrlEntry() {
    this.urlEntryElement.addEventListener('change', () => {
      this.setVideoID();
      this.refreshSubtitleListing();
    });
  } 

  onDownloadSubtitles() {
    this.subtitlesDownload.addEventListener('click', () => {
      this.generateVTT();
    });
  }

  onUploadSubtitles() {
    this.subtitlesUpload.addEventListener('change', (e) => {
      const importedFile = e.target.files;
      if (importedFile) {
        this.importVTT(importedFile[0]);
      }
    });
  }

  onClickSubtitles() {
    this.subtitlesListing.addEventListener('click', (event) => {
      const targetClass = event.target.classList;
      if (targetClass.contains('subtitle-edit')) {
        this.editSubtitle(event.target.parentNode.parentNode.getAttribute('data-index'));
      }
      if (targetClass.contains('subtitle-delete')) {
        this.deleteSubtitle(event.target.parentNode.parentNode.getAttribute('data-index'));
      }
    });
  }

  onDurationAvailable() {
    document.addEventListener('duration', (e) => {
      this.videoDuration = e.detail.duration;
    });
  }

  setVideoID() {
    this.videoId = localStorage.getItem('videoID');
  }

  setStoredSubtitles(subtitles) {
    subtitles.sort((a,b) => {
      if (a.startTime >= b.startTime) {
        return 1;
      }
      else return -1;
    });
    localStorage.setItem(`vidSubs-${this.videoId}`, JSON.stringify(subtitles));
  }

  saveToLocalStorage() {
    let subtitles = this.utilities.getStoredSubtitles(this.videoId);
    subtitles.push({
      startTime: `${this.subtitleStart.value}`,
      endTime: `${this.subtitleEnd.value}`,
      text: this.subtitleText.value
    });
    this.setStoredSubtitles(subtitles);
  }

  refreshSubtitleListing() {
    const subtitles = this.utilities.getStoredSubtitles(this.videoId);
    this.subtitlesListing.innerHTML = '';
    subtitles.forEach((subtitle, index) => {
      const newRow = document.createElement('tr');
      const text = document.createElement('td');
      const start = document.createElement('td');
      const end = document.createElement('td');
      const options = document.createElement('td');
      text.innerText = subtitle.text;
      text.classList.add('wide');
      start.innerText = subtitle.startTime;
      end.innerText = subtitle.endTime;
      options.innerHTML = `<i class="fas fa-edit subtitle-edit"></i>
                           <i class="fas fa-trash-alt subtitle-delete"></i>`
      start.style.textAlign = end.style.textAlign = options.style.textAlign = 'center';
      newRow.append(text);
      newRow.append(start);
      newRow.append(end);
      newRow.append(options);
      newRow.setAttribute('data-index', index);
      this.subtitlesListing.append(newRow);
    });
  }

  generateVTT() {
    let vttFile = 'WEBVTT\n\n';
    const subtitles = this.utilities.getStoredSubtitles(this.videoId);
    this.subtitlesDownloadLink.href = '#';
    this.subtitlesDownloadLink.removeAttribute('download');

    if (subtitles.length > 0) {
      subtitles.forEach(subtitle => {
        vttFile += `${subtitle.startTime}.000 --> ${subtitle.endTime}.000\n${subtitle.text}\n\n`;
      });

      const data = new Blob([vttFile], {type: 'text/plain'});
      this.subtitlesDownloadLink.href = window.URL.createObjectURL(data);
      this.subtitlesDownloadLink.download = `${this.videoId}.vtt`
    }
  }

  importVTT(vttFile) {
    if (this.videoId) {
      const reader = new FileReader();
      let vttArray = [];
      let subtitlesArray = [];
      reader.readAsText(vttFile);
      reader.onload = () => {
        vttArray = reader.result.split('\n').filter(line => line !== '').slice(1);

        for(let i = 0; i < vttArray.length; i += 2) {
          let timesArray = vttArray[i].split(' --> ');
          let startTime = timesArray[0].substr(0,8);
          let endTime = timesArray[1].substr(0,8);
          if (this.utilities.convertHMStoSeconds(startTime) <= this.videoDuration &&
              this.utilities.convertHMStoSeconds(endTime) <= this.videoDuration) {
            subtitlesArray.push({startTime: startTime, 
                                 endTime: endTime, 
                                 text: vttArray[i+1]});
          }
        }
        this.setStoredSubtitles(subtitlesArray);
        this.refreshSubtitleListing();
      };
    }
  }

  editSubtitle(subtitleIndex) {
    const subtitles = this.utilities.getStoredSubtitles(this.videoId);
    const selectedSubtitle = subtitles[subtitleIndex];
    this.subtitleText.value = selectedSubtitle.text;
    this.subtitleStart.value = selectedSubtitle.startTime;
    this.subtitleEnd.value = selectedSubtitle.endTime;
    this.subtitleOriginal.textContent = selectedSubtitle.text;
    document.dispatchEvent(new Event('editSubtitle'));
  }

  deleteSubtitle(subtitleIndex) {
    const subtitles = this.utilities.getStoredSubtitles(this.videoId);
    subtitles.splice(subtitleIndex, 1);
    this.setStoredSubtitles(subtitles);
    this.refreshSubtitleListing();
  }
}