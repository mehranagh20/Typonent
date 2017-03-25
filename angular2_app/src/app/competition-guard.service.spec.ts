/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CompetitionGuardService } from './competition-guard.service';

describe('CompetitionGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompetitionGuardService]
    });
  });

  it('should ...', inject([CompetitionGuardService], (service: CompetitionGuardService) => {
    expect(service).toBeTruthy();
  }));
});
