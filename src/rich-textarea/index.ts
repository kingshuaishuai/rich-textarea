import { html, c, Component, Props, useRef } from 'atomico';
import { RichTextareaProps } from './types';
import { ALLOW_INPUT_TYPE } from './constant';
import { getCursorPosition, insertContentIntoEditor, redoHistory, undoHistory } from './utils'
import { EditorStack } from './editor-stack';
import platform from 'platform';

const isApplePlatform = () => ['iOS', 'OS X'].includes(platform.os?.family || '')

const style = /*css*/`
  .rich-textarea {
    border: 1px solid #646cffaa;
    border-radius: 4px;
    outline: none;
    padding: 6px 4px;
    line-height: 1.2;
    margin: 12px 0;
    white-space: pre-line;
    caret-color: #646cffaa;
  }
`

const RichTextarea: Component<Props<RichTextareaProps>> = (props) => {
  const editorRef = useRef<HTMLParagraphElement>();
  const editorHistory = useRef<EditorStack>(new EditorStack(props.historyStackSize));

  const updateValue = () => {
    console.log('update value, current value is:', JSON.stringify(editorRef.current?.innerText || ''))
  }

  const dispatchInnerInputEvent = (event: InputEvent, inputType: string, data: string | null = null) => {
    requestAnimationFrame(() => {
      event.target?.dispatchEvent(new InputEvent('input', {
        inputType,
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        data,
      }))
    })
  }

  const getCurrentText = () => {
    return editorRef.current?.innerText || ''
  }
  const onBeforeInput = (event: InputEvent) => {
    const eventType = event.inputType;
    const textareaNode = event.target as HTMLElement;

    // 非重点关注的事件类型直接阻止
    if (!ALLOW_INPUT_TYPE.includes(eventType)) {
      event.preventDefault();
      return;
    }

    // 通过粘贴输入
    if (eventType === 'insertFromPaste' && event.data) {
      event.preventDefault();
      const result = insertContentIntoEditor(event.data);
      if (result) {
        dispatchInnerInputEvent(event, eventType, event.data)
      }
      return;
    }

    // 通过拖拽输入
    if (eventType === 'insertFromDrop') {
      event.preventDefault();
      const dropData = event.dataTransfer?.getData('text') || '';
      if (dropData) {
        const result = insertContentIntoEditor(dropData);
        if (result) {
          dispatchInnerInputEvent(event, eventType, event.data)
        }
      }
      return;
    }

    if (['insertLineBreak', 'insertParagraph'].includes(eventType)) {
      event.preventDefault();
      const pos = getCursorPosition();
      const currentValue = getCurrentText();
      const insertDoubleBr = pos === currentValue.length;
      const insertData = insertDoubleBr ? '\n\n' : '\n';
      const result = insertContentIntoEditor(insertData, insertDoubleBr)

      if (result) {
        dispatchInnerInputEvent(event, eventType, event.data)
      }

      return;
    }

    if (['historyUndo', 'historyRedo'].includes(eventType)) {
      event.preventDefault();
      if (eventType === 'historyUndo') {
        undoHistory(editorHistory.current!, textareaNode);
      } else {
        redoHistory(editorHistory.current!, textareaNode);
      }
      dispatchInnerInputEvent(event, eventType)
      return;
    }

  }

  const onPaste = (event: ClipboardEvent) => {
    event.preventDefault();
    const pasteText = event.clipboardData?.getData("text") || '';
    if (pasteText) {
      event.target?.dispatchEvent(new InputEvent('beforeinput', {
        inputType: 'insertFromPaste',
        data: pasteText,
        bubbles: true,
        cancelable: true
      }))
    }
  }

  const onInput = (event: InputEvent) => {
    if (!['historyUndo', 'historyRedo'].includes(event.inputType)) {
      editorHistory.current?.push({
        content: (event.target as HTMLElement).innerText,
        pos: getCursorPosition()
      })
    }
    updateValue()
  }

  const onKeydown = (event: KeyboardEvent) => {
    const ctrlKey = isApplePlatform() ? event.metaKey : event.ctrlKey;

    if (event.code === 'KeyZ' && ctrlKey && !event.shiftKey) {
      event.preventDefault();
      const textareaNode = event.target as HTMLElement;
      textareaNode.dispatchEvent(new InputEvent('beforeinput', {
        data: null,
        inputType: 'historyUndo'
      }))
      return;
    }

    if (event.code === 'KeyZ' && ctrlKey && event.shiftKey) {
      event.preventDefault();
      const textareaNode = event.target as HTMLElement;
      textareaNode.dispatchEvent(new InputEvent('beforeinput', {
        data: null,
        inputType: 'historyRedo'
      }))
      return;
    }
  }

  const onFocus = (event: FocusEvent) => {
    // 使用 requestAnimationFrame 是因为刚 focus 时，获取到的 pos 是不准确的
    requestAnimationFrame(() => {
      const textareaNode = event.target as HTMLElement;
      if (!editorHistory.current!.size) {
        editorHistory.current?.push({
          content: textareaNode.innerText,
          pos: getCursorPosition()
        })
      }
    })
  }

  return html`
    <host>
      <style>${style}</style>
      <p 
        ref=${editorRef}
        class="rich-textarea"
        data-rich-textarea
        contenteditable
        onbeforeinput=${onBeforeInput}
        oninput=${onInput}
        onpaste=${onPaste}
        onkeydown=${onKeydown}
        onfocus=${onFocus}
      >
        ${props.value}
      </p>
    </host>
  `
}

RichTextarea.props = {
  value: {
    type: String,
    reflect: true,
    value: ''
  },
  historyStackSize: {
    type: Number,
    reflect: true,
    value: 20
  }
}

customElements.define('rich-textarea', c(RichTextarea))
