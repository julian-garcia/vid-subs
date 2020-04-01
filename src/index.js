import { run } from './app/app';
import { VideoViewportComponent } from './app/components/video-viewport.component';
import { SubtitleComponent } from './app/components/subtitle.component';
import './style/main.scss';

const videoComponent = new VideoViewportComponent();
const subtitleComponent = new SubtitleComponent();
run(videoComponent, subtitleComponent);
