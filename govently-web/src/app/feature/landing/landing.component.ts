import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-landing',
  standalone: true,       // if using standalone components
  imports: [NgbCarouselModule],            // list any components/modules you import here
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {
   constructor(private router: Router) {}

  startJournaling() {
    // your checks here, e.g. authentication or form validation
    if (this.canNavigate()) {
      this.router.navigate(['/journaling']);
    } else {
      alert('You must complete the checks first!');
    }
  }

  chatWithAI() {
    if (this.canNavigate()) {
      this.router.navigate(['/chat']);
    } else {
      alert('You must complete the checks first!');
    }
  }

  private canNavigate(): boolean {
    // your logic here, return true or false
    return true;
  }
}
