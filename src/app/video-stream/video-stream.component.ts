import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  Input,
  AfterViewInit,
  AfterContentInit
} from '@angular/core';
import JSMpeg from '@cycjimmy/jsmpeg-player';

import { environment } from '../../environments/environment';
import { DroneService } from '../services/drone-service/drone.service';

@Component({
  selector: 'app-video-stream',
  templateUrl: './video-stream.component.html',
  styleUrls: ['./video-stream.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class VideoStreamComponent implements AfterViewInit, AfterContentInit {
  @Input() uavid: string;
  @Input() classProp: string;
  @Input() index: number;
  @ViewChild('stream', { static: false }) stream: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoPlayer') videoPlayer: ElementRef;

  player: JSMpeg;

  videoSource: string = '';
  playing: boolean = false;

  constructor(private droneService: DroneService) {
  }

  ngAfterViewInit(): void {
    this.videoPlayer.nativeElement.muted = true;
    let url = environment.VIDEO_SOCKET_ENDPOINT + '/' + this.uavid;
    // this.player = new JSMpeg.VideoElement(
    //   this.stream.nativeElement, url,
    //   { autoplay: true },
    //   { disableGl: true }
    // )
  }

  ngAfterContentInit(): void {
    this.videoSource = `../../assets/video_${this.uavid}.mp4`;
  }

  playVideo(): void {
    if (this.playing) {
      this.videoPlayer.nativeElement.pause();
    } else {
      this.videoPlayer.nativeElement.play();
    }
    this.playing = !this.playing;
  }

  showTabs(index: number): void {
    if (this.classProp !== 'full') {
      this.droneService.setVisibleTab(index, true);
      this.droneService.setActiveTab(index);
    }
  }
}
