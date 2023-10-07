import './rich-textarea/index';

export function setupRichTextarea(el: HTMLElement | null) {
  if (!el) return;

  el.innerHTML = /*html*/`
    <h3>实现 contenteditable 替换 textarea</h3>
    <div>
      <div contenteditable style="outline: none;border: 1px solid #f00;">
        <p><h1>hello</h1>world,<strong>hello</strong> <i>italic</i></p>
      </div>
      <rich-textarea value="hello world1"></rich-textarea>
      <rich-textarea value="hello world2"></rich-textarea>
    </div>
  `
}