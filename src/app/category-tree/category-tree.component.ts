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

  hasNoContent = (_: number, _nodeData: CategoryClass) => _nodeData.name === '';

  getLevel(data: any[], node: CategoryClass): number {
    let path = data.find((branch: CategoryClass) => {
      return this.treeControl
        .getDescendants(branch)
        .some(n => n.name === node.name);
    });
    return path ? this.getLevel(path.children, node) + 1 : 0 ; 
  }

  getParentNode(data: CategoryClass[], name: string): any {
    if (typeof data != "undefined") {
      for (let i = 0; i < data.length; i++) {
        if (data[i].name === name) {
          return [data[i]];
        }
        const a = this.getParentNode(data[i].children.value, name);
        if (a !== null) {
          a.unshift(data[i]);
          return a;
        }
      }
    }
    return null;
  }

  descendantsAllSelected(node: CategoryClass): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }

  descendantsPartiallySelected(node: CategoryClass): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) =>
      this.checklistSelection.isSelected(child)
    );

    return result && !this.descendantsAllSelected(node);
  }

  todoItemSelectionToggle(node: CategoryClass): void {
    node.selected = !node.selected;
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    //this.checkAllParentsSelection(node);
  }

  todoLeafItemSelectionToggle(node: CategoryClass): void {
    node.selected = !node.selected;
    this.checklistSelection.toggle(node);
    console.log('Az adott node: ', this.checklistSelection.isSelected(node));
    //this.checkAllParentsSelection(node);
  }
}
