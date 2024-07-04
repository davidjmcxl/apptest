import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import * as $ from 'jquery';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild("video") public video?: ElementRef;
  public availableDevices!: MediaDeviceInfo[];
  public hasDevices!: boolean;
  loadImageInterval: any;
  originalText: string = '';
  translatedText: string = '';

  error: any;
  predictionValue = [{ class: '- - -', score: 0 }];
  totalObjectsDetected = 0;
  dataLoading = false;
  model: cocoSsd.ObjectDetection | null = null;

  constructor() {}

  async ngAfterViewInit() {
    await this.loadModel();
  }

  async ngOnInit() {
    this.speak("Detector de Objetos");
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  async loadModel() {
    await tf.setBackend('webgl'); // Use WebGL for better performance
    this.model = await cocoSsd.load();
  }

  startDetectionInterval() {
    this.loadImageInterval = setInterval(async () => {
      await this.loadImageDetection();
    }, 5000);
  }

  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: 640, height: 480 } // Use back camera for better performance
        });
        if (stream) {
          this.video!.nativeElement.srcObject = stream;
          this.video!.nativeElement.play();
          this.error = null;
        } else {
          this.error = "No output video device available";
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  stopCamera() {
    if (this.video && this.video.nativeElement.srcObject) {
      this.video.nativeElement.srcObject.getTracks().forEach((track: any) => {
        track.stop();
      });
    }
  }

  async startCamera() {
    await this.setupDevices();
  }

  async loadImageDetection() {
    if (!this.model) return;
    this.dataLoading = true;

    try {
      const predictions = await this.model.detect(this.video!.nativeElement);
      this.predictionValue = predictions;
      if (predictions.length > 0) {
        this.originalText = predictions[0].class;
        this.translateAndSpeak();
      }
      this.totalObjectsDetected = predictions.length;
    } catch (error) {
      console.error('Error during detection:', error);
    } finally {
      this.dataLoading = false;
    }
  }

  async translateAndSpeak() {
    try {
      const response = await $.ajax({
        url: 'https://api.mymemory.translated.net/get',
        type: 'GET',
        dataType: 'json',
        data: {
          q: this.originalText,
          langpair: 'en|es'
        }
      });
      if (response && response.responseData && response.responseData.translatedText) {
        this.translatedText = response.responseData.translatedText;
        this.speak(this.translatedText);
      }
    } catch (error) {
      console.error('Error translating:', error);
    }
  }

  speak(text: string) {
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }

  ionViewWillLeave() {
    this.stopCamera();
    clearInterval(this.loadImageInterval);
  }

  async ionViewDidEnter() {
    await this.startCamera();
    this.startDetectionInterval();
  }

  ngOnDestroy(): void {
    this.stopCamera();
    clearInterval(this.loadImageInterval);
  }
}
