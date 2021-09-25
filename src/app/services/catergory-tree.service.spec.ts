import { TestBed } from '@angular/core/testing';

import { CatergoryTreeService } from './catergory-tree.service';

describe('CatergoryTreeService', () => {
  let service: CatergoryTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatergoryTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
