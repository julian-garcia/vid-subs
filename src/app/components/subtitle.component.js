export class SubtitleComponent {
  constructor() {
    this.urlEntryElement = document.getElementById('videoUrl');
    this.subtitleText = document.getElementById('subtitleText');
    this.subtitleStart = document.getElementById('subtitleStart');
    this.subtitleEnd = document.getElementById('subtitleEnd');
    this.subtitleAdd = document.querySelector('.subtitle__add');
    this.subtitlesListing = document.querySelector('.subtitles__listing');
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
    this.urlEntryElement.addEventListener('change', (e) => {
      this.setVideoID();
      this.refreshSubtitleListing();
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
      startTime: `${this.subtitleStart.value}.000`,
      endTime: `${this.subtitleEnd.value}.000`,
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
      options.innerHTML = `<i class="fas fa-edit"></i>
                           <i class="fas fa-trash-alt"></i>`
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

  }
}