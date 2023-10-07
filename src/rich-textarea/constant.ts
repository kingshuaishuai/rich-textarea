/**
 * 重点关注的输入类型
 */
export const ALLOW_INPUT_TYPE = [
  // 输入类型
  'insertParagraph', // 输入新行 (直接按下 回车)
  'insertLineBreak', // 输入换行符 (按下 shift + 回车)
  'insertText', // 输入文本
  'insertCompositionText', // 中文合成输入
  'insertFromPaste', // 粘贴输入
  'insertFromDrop', // 从别的地方拖拽输入，在 firefox 中尝试
  // 删除类型
  'deleteContentBackward', // 向前删除，即直接按下删除键
  'deleteContentForward', // 向后删除，win 按下 delete 键，mac 按下 fn + delete
  'deleteByCut', // 剪切，通过 ctrl + x 或 cmd + x 剪切
  'deleteByDrag', // 从当前输入框中拖拽到其他地方
  // 历史
  'historyUndo', // ctrl + z 或 cmd + z
  'historyRedo', // ctrl + shift + z 或 cmd + shift + z
]