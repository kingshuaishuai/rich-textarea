import { EditorStackItem } from "./types";

export class EditorStack {
  constructor(private stackSize = 20) {}

  private histories: EditorStackItem[] = [];
  private index: number = -1;
  
  get size() {
    return this.histories.length;
  }

  push(item: EditorStackItem) {
    if (this.index + 1 === this.stackSize) {
      this.histories = this.histories.slice(1, this.index + 1);
    } else {
      this.histories = this.histories.slice(0, this.index + 1);
    }
    
    this.histories.push(item);
    this.index = this.histories.length - 1;
  }

  undo(){
    if (this.index <= 0) {
      return null;
    }
    
    this.index--;
    const item = this.histories[this.index];
    return item;
  }

  redo() {
    if (this.index + 1 < this.histories.length) {
      this.index++;
      return this.histories[this.index]
    }
    
    return null;
  }
}
