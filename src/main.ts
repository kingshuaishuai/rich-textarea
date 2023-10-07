import { setupRichTextarea } from './setup-rich-textarea'
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = /*html*/`
  <div>
    <div id="rich-textarea-wrapper"></div>
  </div>
`

setupRichTextarea(document.getElementById('rich-textarea-wrapper')) 