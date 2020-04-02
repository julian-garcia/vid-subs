import { run } from './app/app';
import { VideoComponent } from './app/components/video.component';
import { SubtitleComponent } from './app/components/subtitle.component';
import './style/main.scss';

const videoComponent = new VideoComponent();
const subtitleComponent = new SubtitleComponent();
run(videoComponent, subtitleComponent);
