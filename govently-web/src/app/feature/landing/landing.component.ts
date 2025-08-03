import { Component } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-landing',
  standalone: true,       // if using standalone components
  imports: [NgbCarouselModule],            // list any components/modules you import here
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {}
