import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MaterialModule } from 'material.module';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CategoryDatabase, CategoryTreeComponent } from './category-tree/category-tree.component';

import { MatTreeModule } from '@angular/material/tree';
import { CatergoryTreeService } from './services/catergory-tree.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    CategoryTreeComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    BrowserAnimationsModule,
    MatTreeModule,
    HttpClientModule
  ],
  providers: [
    CatergoryTreeService,
    CategoryDatabase
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
