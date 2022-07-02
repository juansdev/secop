import { TestBed } from '@angular/core/testing';

import { SecopLocalService } from './secop-local.service';

describe('SecopLocalService', () => {
  let service: SecopLocalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecopLocalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
