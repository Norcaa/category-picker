import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryFace } from '../Category';
import { CategoryClass } from '../category-tree/category-tree.component';

const httpOptions = {
  header: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
};

@Injectable({
  providedIn: 'root'
})
export class CatergoryTreeService {

  private Url = "http://localhost:3000/all"

  constructor(private http: HttpClient) { }

  deleteCategory(category: CategoryClass): Observable<CategoryClass> {
    const url = `${this.Url}/${category.id}`;
    return this.http.delete<CategoryClass>(url); 
  }

  addCategory(category: CategoryClass): Observable<CategoryClass> {
    return this.http.post<CategoryClass>(this.Url, category);
  }

  getCategories(): Observable<CategoryClass[]> {
    return this.http.get<CategoryClass[]>(this.Url);
  }

  /*update method
  updateTaskReminder(category: CategoryClass): Observable<CategoryClass> {
    const url = `${this.Url}/${category.name}`; //http://localhost:3000/tasks/*frissítendőid*
    return this.http.put<CategoryClass>(url, category); // put request, mert update-elünk egy infot   
  }*/
}
