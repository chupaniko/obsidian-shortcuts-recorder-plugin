import {
  Editor,
  EditorPosition,
  MarkdownView,
  Plugin,
} from 'obsidian';
import { ShortcutCaptureService } from './services/ShortcutCaptureService';

export default class ShortcutRecorderPlugin extends Plugin {
  private captureService!: ShortcutCaptureService;

  async onload(): Promise<void> {
    this.captureService = new ShortcutCaptureService(this.app);

    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu, editor, view) => {
        if (!(view instanceof MarkdownView)) {
          return;
        }

        const mode = view.getMode();
        if (mode !== 'source' && mode !== 'live') {
          return;
        }

        const cursor = editor.getCursor();
        if (!cursor) {
          return;
        }

        if (!this.isCursorInMarkdownTable(editor, cursor)) {
          return;
        }

        menu.addItem((item) => {
          item
            .setTitle('Record keyboard shortcut')
            .setIcon('keyboard')
            .onClick(() => {
              this.captureService.openCaptureModal(editor);
            });
        });
      })
    );
  }

  private isCursorInMarkdownTable(editor: Editor, cursor: EditorPosition): boolean {
    const lineText = editor.getLine(cursor.line) ?? '';
    if (!this.lineLooksLikeTable(lineText)) {
      return false;
    }

    const beforeCursor = lineText.slice(0, cursor.ch);
    const afterCursor = lineText.slice(cursor.ch);
    if (!beforeCursor.includes('|') || !afterCursor.includes('|')) {
      return false;
    }

    if (this.isDividerRow(lineText)) {
      return true;
    }

    const prevLine = cursor.line > 0 ? editor.getLine(cursor.line - 1) ?? '' : '';
    const nextLine = editor.getLine(cursor.line + 1) ?? '';

    if (this.isDividerRow(prevLine) || this.isDividerRow(nextLine)) {
      return true;
    }

    if (this.lineLooksLikeTable(prevLine) || this.lineLooksLikeTable(nextLine)) {
      return true;
    }

    return false;
  }

  private lineLooksLikeTable(line: string): boolean {
    if (!line) {
      return false;
    }

    const trimmed = line.trim();
    if (!trimmed.includes('|')) {
      return false;
    }

    // Avoid matching code blocks or frontmatter fences that contain '|'
    if (/^```/.test(trimmed) || /^---/.test(trimmed)) {
      return false;
    }

    return true;
  }

  private isDividerRow(line: string): boolean {
    if (!line) {
      return false;
    }

    const trimmed = line.trim();
    return /^\|?(\s*:?-+:?\s*\|)+\s*$/.test(trimmed);
  }
}
