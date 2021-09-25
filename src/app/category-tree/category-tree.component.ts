import { ChangeDetectorRef, Component, Injectable, OnInit } from '@angular/core';
import { CatergoryTreeService } from 'src/app/services/catergory-tree.service';
import { CategoryFace } from 'src/app/Category';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { unescapeIdentifier } from '@angular/compiler';

export class CategoryClass {
  categories: CategoryClass[] = [];

  id?: string;
  name!: string;
  selected!: boolean;
  children: BehaviorSubject<CategoryClass[]> = new BehaviorSubject<CategoryClass[]>(this.categories);

  addchildren(nodes: CategoryClass[]) {
    this.categories = this.categories.concat(this.categories, nodes);
    this.children.next(this.categories);
  }
}


@Injectable()
export class CategoryDatabase {
  dataChange = new BehaviorSubject<CategoryClass[]>([]);

  treeData: CategoryClass[] = [];

  get data(): CategoryClass[] { return this.dataChange.value; }

  constructor(public categoryService: CatergoryTreeService,
    private http: HttpClient) {
    this.getDatas();
  }

  getDatas() {
    this.categoryService.getCategories().subscribe(treeData => {
      this.treeData = treeData;
      console.log(this.treeData);
      this.initialize();
    });
  }

  initialize() {
    const data = this.buildFileTree(this.treeData, 1);
    this.dataChange.next(data);
  }

  buildFileTree(obj: { [key: string]: any }, level: number): CategoryClass[] {
    console.log("objektum:", obj);
    console.log("kulcsok: ", Object.keys(obj));

    const result = Object.keys(obj).reduce<CategoryClass[]>((accumulator, key) => { 

      const value = obj[key];
      console.log("value:", value);

      const node = new CategoryClass();
      node.name = value.name;
      console.log("name:", value.name);
      node.selected = false;

      if (value != null) {
        if (typeof value === 'object' && value.children != null) {
          node.addchildren(this.buildFileTree(value.children, level + 2));
        } else {
          node.name = value.name;
        }
      }
      return accumulator.concat(node);}, 
    []);
    console.log(result);
    console.log("build runned")
    return result;
  }
}

@Component({
  selector: 'app-category-tree',
  templateUrl: './category-tree.component.html',
  styleUrls: ['./category-tree.component.css'],
  providers:  [ CatergoryTreeService ]
})
export class CategoryTreeComponent implements OnInit {
  categories: CategoryClass[] = [];

  levels = new Map<CategoryClass, CategoryClass>();
  treeControl: NestedTreeControl<CategoryClass>;
  dataSource: MatTreeNestedDataSource<CategoryClass>;

  constructor(
    public categoryService: CatergoryTreeService,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
    private database: CategoryDatabase
  ) {
    this.treeControl = new NestedTreeControl<CategoryClass>(this.getChildren);
    this.dataSource = new MatTreeNestedDataSource();
    this.dataSource.data = this.categories;
    database.dataChange.subscribe(data => this.dataSource.data = data );
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
      console.log(this.categories);
    });
  }

  dataChange = new BehaviorSubject<CategoryClass[]>([]);
  get data(): CategoryClass[] {
    return this.dataChange.value;
  }

  checklistSelection = new SelectionModel<CategoryClass>(true);

  getChildren = (node: CategoryClass) => {
    return node.children;
  };

  hasChildren = (_index: number, node: CategoryClass) => {
    if (node.children.value == undefined) {
      return false;
    } else {
      return node.children.value.length > 0;
    }
  };


  isChecked(node: CategoryClass) {
    node.selected = !node.selected;
  }


  hasNoContent = (_: number, _nodeData: CategoryClass) => _nodeData.name === '';
}
