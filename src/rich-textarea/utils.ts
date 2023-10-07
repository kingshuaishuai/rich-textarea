import { EditorStack } from "./editor-stack";

export function insertContentIntoEditor(content: string, isFirstCreateNewLine = false) {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return false;

  if (!selection.isCollapsed) {
    // 将已选中内容删除，删除后，selection 的属性会自动更新，后续不必重新获取 selection
    selection.deleteFromDocument();
  }

  // 根据已有第一个 range ，clone 创建一个新的 range
  const range = selection.getRangeAt(0).cloneRange();
  
  // 移除当前所有选区
  selection.removeAllRanges();

  // 创建待插入的文本节点
  const textNode = document.createTextNode(content);

  // 插入新的文本节点
  range.insertNode(textNode);
  // 光标聚焦到尾部
  if (isFirstCreateNewLine) {
    range.setStart(textNode, 1);
    range.setEnd(textNode, 1);
  } else {
    range.collapse();
  }
  // 将新的 range 添加到选区
  selection.addRange(range);
  return true;
}

function isTextNode(node: unknown): node is Text {
  return !!node && node instanceof Text;
}

function isBrNode(node: unknown): node is HTMLBRElement {
  return !!node && node instanceof HTMLBRElement;
}

function isRichTextarea(node: unknown): node is HTMLElement {
  return !!((node instanceof HTMLElement) && node.dataset.richTextarea);
}

function findRichTextarea(node: Node | null) {
  if (!node) return null;

  if (isRichTextarea(node)) {
    return node;
  }
  
  return findRichTextarea(node.parentNode)
}

/**
 * 获取光标位置
 * 
 * @returns 
 */
export function getCursorPosition() {
  const selection = window.getSelection();

  /**
   * 1. 返回默认值 0 的情况:
   * - selection 不存在
   * - 当前不存在被选择的内容
   * - 当前选区有被选中文本，而非光标状态
   */

  if (!selection || !selection.rangeCount || !selection.isCollapsed) return 0;

  const anchorNode = selection.anchorNode;
  const textareaNode = findRichTextarea(anchorNode);

  /**
   * 2. 光标不在输入框内，返回默认值
   */
  if (!textareaNode) return 0;

  /**
   * 3. 获取光标位置
   * 分析：
   * - 当前 textarea 内只会存在文本节点与 br 标签，如果 range 选中的是 br 节点，
   * 则 anchorNode 为 br 的父节点，即 textarea 节点，range 选中内容为节点时，
   * offset 计算单位是同级节点数量；
   * - 如果选中内容是文本内容，anchorNode 则是 TextNode
   * - 需要计算当前位置之前，所有文本长度与br数量之和
   */
  if (isRichTextarea(anchorNode)) {
    let pos = 0;

    const childNodes = textareaNode.childNodes;
    const anchorOffset = selection.anchorOffset;

    for (let i = 0; i < anchorOffset; i++) {
      const child = childNodes[i];
      if (isTextNode(child)) {
        pos += child.length
      } else if (isBrNode(child)) {
        pos += 1;
      }
    }
    return pos;
  }
  
  if (isTextNode(anchorNode)) {
    let pos = 0;

    const childNodes = textareaNode.childNodes;
    const anchorOffset = selection.anchorOffset;

    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      // 当前光标刚好在文本节点上
      if (child === anchorNode) {
        pos += anchorOffset;

        return pos;
      }

      pos += isTextNode(child) ? child.length : 1;
    }
  }

  // 这里的返回基本不会执行，但是为了 ts 的类型安全，返回一个数字
  return 0;
}

export function moveCursorTo(textareaNode: Node, pos: number) {
  const selection = window.getSelection();
  if (!selection) return;
  
  const childNodes = textareaNode.childNodes;

  const range = document.createRange()

  let acc = 0;

  for(let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i];
    if (isTextNode(child)) {
      if (acc + child.length >= pos) {
        const offset = pos - acc;

        range.setStart(child, offset)
        range.setEnd(child, offset)
        break;
      }
      acc += child.length;
    }

    if (isBrNode(child)) {
      if (acc + 1 === pos) {
        range.setStartAfter(child)
        range.setEndAfter(child)
        break;
      }
      acc += 1;
    }
  }

  if (selection.rangeCount) {
    selection.removeAllRanges()
  }

  selection.addRange(range)
}

export function undoHistory(stack: EditorStack, textareaNode: HTMLElement) {
  const item = stack.undo();
  if (!item) return false;

  textareaNode.innerText = item.content;

  moveCursorTo(textareaNode, item.pos);

  return true;
}

export function redoHistory(stack: EditorStack, textareaNode: HTMLElement) {
  const item = stack.redo();
  if (!item) return false;

  textareaNode.innerText = item.content;
  console.log('redo: ', item.content)

  moveCursorTo(textareaNode, item.pos);

  return true;
}
