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
  }

  onAddSubtitle() {
    this.subtitleAdd.addEventListener('click', () => {
      if (this.subtitleText.value && 
          this.subtitleStart.value && 
          this.subtitleEnd.value) {
        this.setVideoID();
        this.saveToLocalStorage();
        this.refreshSubtitleListing();
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

  onClickSubtitles() {
    this.subtitlesListing.addEventListener('click', (event) => {
      const targetClass = event.target.classList;
      if (targetClass.contains('subtitle-edit')) {
        this.editSubtitle(event.target.parentNode.parentNode.getAttribute('data-index'));
      }
    });
  }

  setVideoID() {
    this.videoId = localStorage.getItem('videoID');
  }

  getStoredSubtitles() {
    return JSON.parse(localStorage.getItem(`vidSubs-${this.videoId}`)) || [];
  }

  saveToLocalStorage() {
    let subtitles = this.getStoredSubtitles();
    subtitles.push({
      startTime: `${this.subtitleStart.value}`,
      endTime: `${this.subtitleEnd.value}`,
      text: this.subtitleText.value
    });
    localStorage.setItem(`vidSubs-${this.videoId}`, JSON.stringify(subtitles));
  }

  refreshSubtitleListing() {
    const subtitles = this.getStoredSubtitles();
    this.subtitlesListing.innerHTML = '';
    subtitles.forEach((subtitle, index) => {
      const newRow = document.createElement('tr');
      const text = document.createElement('td');
      const start = document.createElement('td');
      const end = document.createElement('td');
      const options = document.createElement('td');
      text.innerText = subtitle.text;
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
    let subtitles = this.getStoredSubtitles();
    let vttFile = 'WEBVTT\n\n';
    subtitles.forEach(subtitle => {
      vttFile += `${subtitle.startTime}.000 --> ${subtitle.endTime}.000\n${subtitle.text}\n\n`;
    });

    const data = new Blob([vttFile], {type: 'text/plain'});
    const url = window.URL.createObjectURL(data);
    this.subtitlesDownloadLink.href = url;
    this.subtitlesDownloadLink.download = `${this.videoId}.vtt`
  }

  editSubtitle(subtitleIndex) {
    const selectedSubtitle = this.getStoredSubtitles()[subtitleIndex];
    this.subtitleText.value = selectedSubtitle.text;
    this.subtitleStart.value = selectedSubtitle.startTime;
    this.subtitleEnd.value = selectedSubtitle.endTime;
  }
}