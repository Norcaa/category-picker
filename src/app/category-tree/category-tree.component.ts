import { ChangeDetectorRef, Component, Injectable, OnInit } from '@angular/core';
import { CatergoryTreeService } from 'src/app/services/catergory-tree.service';
import { CategoryFace } from 'src/app/Category';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export class CategoryClass {
  categories: CategoryClass[] = [];

  id?: number;
  name!: string;
  selected!: boolean;
  children: BehaviorSubject<CategoryClass[]> = new BehaviorSubject<CategoryClass[]>(this.categories);

  addchildren(nodes: CategoryClass[]) {
    this.categories = this.categories.concat(this.categories, nodes);
    this.children.next(this.categories);
  }

  insertChildren(node: CategoryClass) {
    console.log("Eredeti: ", this.categories);
    console.log("Hozzáadás: ", node);
    console.log("Eredmény: ", this.categories.concat(node));
    //this.categories = this.categories.concat(this.categories, nodes);
    this.categories = this.categories.concat(node);
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
    return Object.keys(obj).reduce<CategoryClass[]>((accumulator, key) => {
      const value = obj[key];
      const node = new CategoryClass();
      node.name = value.name;
      node.selected = false;

      if (value != null) {
        if (typeof value === 'object' && value.children != null) {
          node.addchildren(this.buildFileTree(value.children, level + 1));
        } else {
          node.name = value.name;
        }
      }
      return accumulator.concat(node);
    }, []);
  }

  insertItem(parent: CategoryClass, name: string) {
    if (parent.children) {
      console.log(parent.children.getValue());
      const node = new CategoryClass();
        node.name = name;
        node.selected = false;
      parent.insertChildren(node);
      //parent.children.getValue().push({item: name} as CategoryClass;
      this.dataChange.next(this.data);
    }
  }

  updateItem(parent: CategoryClass, node: CategoryClass) {
    this.categoryService.addCategory(node).subscribe((node) => {
      parent.children.getValue().push(node);
    });
    this.dataChange.next(this.data);
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

  addNewItem(node: CategoryClass) {
    const parents = this.getParentNode(this.dataSource.data, node.name);
    const parentNode = parents[parents.length-1];
    this.database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  saveNode(node: CategoryClass, itemValue: string) {
    const parents = this.getParentNode(this.dataSource.data, node.name);
    const parentNode = parents[parents.length-2];
    console.log("Szülő: ", parentNode);

    const newNode = new CategoryClass();
      if (node.id) {
        newNode.id = node.id+1;
      } else {
        newNode.id = 11;
      }
      newNode.name = itemValue;
      newNode.selected = false;

    this.database.updateItem(parentNode!, newNode);
  }
}
