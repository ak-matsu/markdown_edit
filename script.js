const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const md = window.markdownit({
  highlight: function (str, lang) {
    if (lang && Prism.languages[lang]) {
      try {
        return Prism.highlight(str, Prism.languages[lang], lang);
      } catch (__) {}
    }
    return ''; // fallback: no highlight
  }
});

editor.addEventListener('input', updatePreview);

function updatePreview() {
  const rendered = md.render(editor.value);
  preview.innerHTML = rendered;
  Prism.highlightAll(); // コード再ハイライト
}

// 既存関数 wrapSelection, insertLine はそのまま

function wrapCodeBlock() {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.substring(start, end);

  const newText = "```\n" + selected + "\n```";

  editor.setRangeText(newText, start, end, 'end');
  updatePreview();
  editor.selectionStart = editor.selectionEnd = start + newText.length;
  editor.focus();
}


function insertLine(prefix) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const value = editor.value;

  // 選択範囲の先頭行の開始位置を取得
  let lineStart = value.lastIndexOf('\n', start - 1) + 1;
  if (lineStart < 0) lineStart = 0;

  const before = value.slice(0, lineStart);
  const after = value.slice(lineStart);

  // prefixを付けて差し替え
  editor.value = before + prefix + after;
  updatePreview();

  // カーソル位置調整（prefix分だけずらす）
  editor.selectionStart = editor.selectionEnd = start + prefix.length;
  editor.focus();
}

function wrapSelection(before, after) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.substring(start, end);

  const newText = before + selected + after;

  editor.setRangeText(newText, start, end, 'end');
  updatePreview();

  // 選択範囲の後にカーソルを置く（afterの長さを考慮）
  editor.selectionStart = editor.selectionEnd = start + newText.length;
  editor.focus();
}

// 1. プレビューのみ表示トグル
const togglePreviewBtn = document.getElementById('togglePreviewBtn');
togglePreviewBtn.addEventListener('click', () => {
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');

  if (editor.style.display === 'none') {
    editor.style.display = 'block';
    preview.style.flex = '1';
    togglePreviewBtn.textContent = 'プレビューのみ切替';
  } else {
    editor.style.display = 'none';
    preview.style.flex = '1 1 100%';
    togglePreviewBtn.textContent = '編集も表示';
  }
});

// 2. コード言語指定
function setCodeBlockLanguage(lang) {
  const editor = document.getElementById('editor');
  const value = editor.value;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;

  // 選択部分か、カーソル位置の前後からコードブロック範囲を探す
  const before = value.slice(0, start);
  const after = value.slice(end);

  // コードブロックの開始位置（```）を探す
  const blockStart = before.lastIndexOf('```');
  if (blockStart === -1) {
    alert('コードブロック内にカーソルを置いてください');
    return;
  }

  // コードブロックの終了位置を探す
  const blockEnd = value.indexOf('```', start);
  if (blockEnd === -1) {
    alert('閉じるコードブロックがありません');
    return;
  }

  // 開始行の ``` の後ろの言語指定部分を書き換え
  const afterBlockStart = value.indexOf('\n', blockStart);
  const beforeLang = value.substring(blockStart, afterBlockStart);

  // 新しいコードブロック開始行を作成
  const newBlockStart = '```' + (lang || '');

  // テキストの書き換え
  const newValue =
    value.substring(0, blockStart) +
    newBlockStart +
    value.substring(afterBlockStart);

  editor.value = newValue;
  updatePreview();
}

// 3. チェックリスト挿入
function insertCheckList() {
  insertLine('- [ ] ');
}

// 4. テーブル挿入
function insertTable() {
  const tableTemplate =
    `| ヘッダー1 | ヘッダー2 | ヘッダー3 |\n` +
    `| --- | --- | --- |\n` +
    `| データ1 | データ2 | データ3 |\n`;

  const editor = document.getElementById('editor');
  const start = editor.selectionStart;
  const before = editor.value.slice(0, start);
  const after = editor.value.slice(start);

  editor.value = before + tableTemplate + after;
  updatePreview();

  // 挿入したテーブルの先頭にカーソルを置く
  editor.selectionStart = editor.selectionEnd = start;
  editor.focus();
}

function openLangModal() {
  document.getElementById('codeLangModal').style.display = 'block';
}

function closeLangModal() {
  document.getElementById('codeLangModal').style.display = 'none';
}

function insertCodeBlockWithSelectedLang() {
  const lang = document.getElementById('modalCodeLangSelect').value;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.substring(start, end);

  const newText = `\`\`\`${lang}\n${selected}\n\`\`\`\n`;

  editor.setRangeText(newText, start, end, 'end');
  closeLangModal();
  updatePreview();
  editor.selectionStart = editor.selectionEnd = start + newText.length;
  editor.focus();
}
