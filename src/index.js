import { run } from './app/app';
import { VideoViewportComponent } from './app/components/video-viewport.component';
import './style/main.scss';

const videoComponent = new VideoViewportComponent();
run(videoComponent);
