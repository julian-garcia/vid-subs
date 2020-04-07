export class Utilities {
  getStoredSubtitles(videoID) {
    return JSON.parse(localStorage.getItem(`vidSubs-${videoID}`)) || [];
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
}