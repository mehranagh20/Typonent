/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CompeteComponent } from './compete.component';

describe('CompeteComponent', () => {
  let component: CompeteComponent;
  let fixture: ComponentFixture<CompeteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompeteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompeteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
