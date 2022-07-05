import { TestBed } from '@angular/core/testing';

import { SecopService } from './secop.service';

describe('SecopService', () => {
  let service: SecopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
