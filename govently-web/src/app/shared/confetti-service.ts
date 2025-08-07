import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root'
})
export class ConfettiService {

    public launchConfetti() {
       confetti({
         particleCount: 100,
         spread: 80,
         origin: { y: 0.6 },
       });
     }
}
