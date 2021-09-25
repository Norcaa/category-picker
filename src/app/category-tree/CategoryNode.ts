import { BehaviorSubject } from "rxjs";

export class CategoryNode {
    children: BehaviorSubject<CategoryNode[]>;
    constructor(
        public name: string, 
        public selected?: boolean, 
        children?: CategoryNode[], 
        public parent?: CategoryNode) {
      this.children = new BehaviorSubject(children === undefined ? [] : children);
    }
  }
