import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrisisSupportService, CountryCrisisSupport, CrisisResource } from '../crisis-support.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-crisis-resources',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="crisis-resources" *ngIf="crisisSupport | async as support">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h6 class="text-danger mb-0">
          <i class="bi bi-telephone-fill me-2"></i>
          <span *ngIf="showTitle">Crisis Support - {{ support.countryName }}</span>
          <span *ngIf="!showTitle">Crisis Support</span>
        </h6>
        <small class="text-muted" *ngIf="showCountry">{{ support.countryCode }}</small>
      </div>

      <!-- Emergency Services -->
      <div class="crisis-resource mb-2" *ngIf="showEmergency">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong class="text-danger">{{ support.emergency.name }}</strong>
            <div class="small text-muted">{{ support.emergency.description }}</div>
          </div>
          <button 
            class="btn btn-danger btn-sm"
            (click)="callNumber(support.emergency.phone)"
            [attr.aria-label]="'Call ' + support.emergency.name">
            {{ support.emergency.phone }}
          </button>
        </div>
      </div>

      <!-- Suicide Prevention -->
      <div class="crisis-resource mb-2">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong class="text-primary">{{ support.suicide.name }}</strong>
            <div class="small text-muted">
              {{ support.suicide.description }}
              <span *ngIf="support.suicide.available24h" class="badge bg-success ms-1">24/7</span>
            </div>
          </div>
          <div class="text-end">
            <button 
              class="btn btn-primary btn-sm me-1"
              (click)="callNumber(support.suicide.phone)"
              [attr.aria-label]="'Call ' + support.suicide.name">
              Call {{ support.suicide.phone }}
            </button>
            <button 
              *ngIf="support.suicide.text && support.suicide.text !== support.suicide.phone"
              class="btn btn-outline-primary btn-sm"
              (click)="sendText(support.suicide.text)"
              [attr.aria-label]="'Text ' + support.suicide.name">
              Text {{ support.suicide.text }}
            </button>
          </div>
        </div>
      </div>

      <!-- Crisis Text Line -->
      <div class="crisis-resource mb-2" *ngIf="support.crisis && support.crisis.name !== support.suicide.name">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong class="text-info">{{ support.crisis.name }}</strong>
            <div class="small text-muted">
              {{ support.crisis.description }}
              <span *ngIf="support.crisis.available24h" class="badge bg-success ms-1">24/7</span>
            </div>
          </div>
          <div class="text-end">
            <button 
              *ngIf="support.crisis.phone && support.crisis.phone !== support.crisis.text"
              class="btn btn-info btn-sm me-1"
              (click)="callNumber(support.crisis.phone)"
              [attr.aria-label]="'Call ' + support.crisis.name">
              Call {{ support.crisis.phone }}
            </button>
            <button 
              *ngIf="support.crisis.text"
              class="btn btn-outline-info btn-sm"
              (click)="sendText(support.crisis.text)"
              [attr.aria-label]="'Text ' + support.crisis.name">
              Text {{ support.crisis.text }}
            </button>
          </div>
        </div>
      </div>

      <!-- Additional Resources -->
      <div *ngIf="support.additional && support.additional.length > 0" class="additional-resources">
        <div class="small text-muted mb-2">Additional Resources:</div>
        <div class="crisis-resource mb-1" *ngFor="let resource of support.additional">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ resource.name }}</strong>
              <div class="small text-muted">{{ resource.description }}</div>
            </div>
            <div class="text-end">
              <button 
                class="btn btn-secondary btn-sm"
                (click)="callNumber(resource.phone)"
                [attr.aria-label]="'Call ' + resource.name">
                {{ resource.phone }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Website Links -->
      <div *ngIf="showWebsites && (support.suicide.website || support.crisis.website)" class="mt-3">
        <div class="small text-muted mb-2">Online Resources:</div>
        <div class="d-flex gap-2 flex-wrap">
          <a 
            *ngIf="support.suicide.website"
            [href]="support.suicide.website" 
            target="_blank" 
            class="btn btn-outline-primary btn-sm">
            <i class="bi bi-globe me-1"></i>{{ support.suicide.name }}
          </a>
          <a 
            *ngIf="support.crisis.website && support.crisis.website !== support.suicide.website"
            [href]="support.crisis.website" 
            target="_blank" 
            class="btn btn-outline-info btn-sm">
            <i class="bi bi-globe me-1"></i>{{ support.crisis.name }}
          </a>
        </div>
      </div>

      <!-- Privacy Notice -->
      <div class="mt-3" *ngIf="showPrivacyNotice">
        <small class="text-muted">
          <i class="bi bi-shield-check me-1"></i>
          All crisis support services are confidential and available when you need help.
        </small>
      </div>
    </div>
  `,
  styles: [`
    .crisis-resources {
      background-color: #fff8f8;
      border: 1px solid #f8d7da;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .crisis-resource {
      padding: 0.5rem;
      background-color: white;
      border-radius: 0.25rem;
      border: 1px solid #e9ecef;
    }

    .crisis-resource:hover {
      background-color: #f8f9fa;
    }

    .btn-sm {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }

    .additional-resources .crisis-resource {
      background-color: #f8f9fa;
      border-color: #dee2e6;
    }

    @media (max-width: 576px) {
      .d-flex.justify-content-between {
        flex-direction: column;
        align-items: flex-start !important;
      }
      
      .text-end {
        text-align: left !important;
        margin-top: 0.5rem;
      }
    }
  `]
})
export class CrisisResourcesComponent implements OnInit {
  @Input() showTitle: boolean = true;
  @Input() showCountry: boolean = false;
  @Input() showEmergency: boolean = false;
  @Input() showWebsites: boolean = true;
  @Input() showPrivacyNotice: boolean = true;

  crisisSupport: Observable<CountryCrisisSupport>;

  constructor(private crisisSupportService: CrisisSupportService) {
    this.crisisSupport = this.crisisSupportService.getCurrentSupport();
  }

  ngOnInit(): void {
    // Component initialization
  }

  callNumber(phoneNumber: string): void {
    window.open(`tel:${phoneNumber}`, '_self');
  }

  sendText(textNumber: string): void {
    window.open(`sms:${textNumber}`, '_self');
  }
}