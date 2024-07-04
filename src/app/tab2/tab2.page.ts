import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import Tesseract from 'tesseract.js';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements AfterViewInit, OnDestroy {
  @ViewChild('video', { static: false }) video?: ElementRef;
  @ViewChild('canvas', { static: false }) canvas?: ElementRef;
  text: string = '';
  isLoading: boolean = false;
  captureInterval: any;

  constructor() {
    this.speak("Detector de Textos");
  }

  ngAfterViewInit() {
    this.startCamera();
    this.startCaptureInterval();
  }

  startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(stream => {
      this.video!.nativeElement.srcObject = stream;
      this.video!.nativeElement.play();
    }).catch(err => {
      console.error("Error accessing the camera: ", err);
    });
  }

  stopCamera() {
    if (this.video && this.video.nativeElement.srcObject) {
      this.video.nativeElement.srcObject.getTracks().forEach((track: any) => {
        track.stop();
      });
    }
  }

  captureImage() {
    const context = this.canvas!.nativeElement.getContext('2d');
    context.drawImage(this.video!.nativeElement, 0, 0, this.canvas!.nativeElement.width, this.canvas!.nativeElement.height);
    const image = new Image();
    image.src = this.canvas!.nativeElement.toDataURL('image/png');
    this.recognizeText(image);
  }

  recognizeText(image: HTMLImageElement) {
    this.isLoading = true;
    this.recognizeTextocr(image).then((text) => {
      this.text = text;
      this.isLoading = false;
      this.speakText();
    }).catch(error => {
      console.error(error);
      this.isLoading = false;
    });
  }

  recognizeTextocr(image: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(
        image,
        'eng',
        {
          logger: m => console.log(m)
        }
      ).then(({ data: { text } }) => {
        resolve(text);
      }).catch(error => {
        reject(error);
      });
    });
  }

  speakText() {
    const speech = new SpeechSynthesisUtterance(this.text);
    window.speechSynthesis.speak(speech);
  }

  speak(text: string) {
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }

  startCaptureInterval() {
    this.captureInterval = setInterval(() => {
      this.captureImage();
    }, 10000); // Captura una imagen cada 10 segundos
  }

  ionViewWillLeave() {
    this.stopCamera();
    clearInterval(this.captureInterval);
  }

  async ionViewDidEnter() {
    await this.startCamera();
    this.startCaptureInterval();
  }

  ngOnDestroy(): void {
    this.stopCamera();
    clearInterval(this.captureInterval);
  }
}
