import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';


export class CategoryNode {
  children: BehaviorSubject<CategoryNode[]>;
  constructor(public name: string, children?: CategoryNode[], public parent?: CategoryNode) {
    this.children = new BehaviorSubject(children === undefined ? [] : children);
  }
}

const TREE_DATA = [
  new CategoryNode('All', [
    new CategoryNode('Animation',[
      new CategoryNode('Animation')
    ]),
    new CategoryNode('Communication',[
      new CategoryNode('Communication')
    ]),
    new CategoryNode('Design',[
      new CategoryNode('Design')
    ]),
    new CategoryNode('Development', [
      new CategoryNode(`Application`),
      new CategoryNode(`Web`),
      new CategoryNode(`Stacks`, [
        new CategoryNode(`BackEnd`, [
          new CategoryNode('PHP'),
          new CategoryNode('Python'),
        ]),
        new CategoryNode(`FrontEnd`, [
          new CategoryNode('HTML/CSS'),
          new CategoryNode('Angular'),
        ]),
      ]),
    ]),
    new CategoryNode('Development',[
      new CategoryNode('Development')
    ]),
    new CategoryNode('Marketing',[
      new CategoryNode('Marketing')
    ]),
    new CategoryNode('Hardware',[
      new CategoryNode('Hardware')
    ]),
    new CategoryNode('Software',[
      new CategoryNode('Software')
    ]),
    new CategoryNode('Inventions',[
      new CategoryNode('Inventions')
    ]),
    new CategoryNode('Tech',[
      new CategoryNode('Tech')
    ]),
  ])
];

@Component({
  selector: 'app-category-tree',
  templateUrl: './category-tree.component.html',
  styleUrls: ['./category-tree.component.css']
})
export class CategoryTreeComponent implements OnInit {

  checkboxStatus = "check_box_outline_blank";

  recursive: boolean = false;
  levels = new Map<CategoryNode, number>();
  treeControl: NestedTreeControl<CategoryNode>;

  dataSource: MatTreeNestedDataSource<CategoryNode>;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  
    this.treeControl = new NestedTreeControl<CategoryNode>(this.getChildren);
    this.dataSource = new MatTreeNestedDataSource();
    this.dataSource.data = TREE_DATA;
  }

  getChildren = (node: CategoryNode) => {
    return node.children;
  };

  hasChildren = (_index: number, node: CategoryNode) => {
    return node.children.value.length > 0;
  }

  ngOnInit() {}

  setCheckbox() {
    if (this.checkboxStatus == "check_box_outline_blank") {
      this.checkboxStatus = "check_box";
    } else {
      this.checkboxStatus = "check_box_outline_blank";
    }
  }

}
