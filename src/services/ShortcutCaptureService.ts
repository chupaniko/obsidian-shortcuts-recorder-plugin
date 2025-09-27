import { App, Editor } from 'obsidian';
import ShortcutCaptureModal from '../ui/ShortcutCaptureModal';

export class ShortcutCaptureService {
  constructor(private readonly app: App) {}

  openCaptureModal(
    editor: Editor,
    onComplete?: (shortcut: string) => void
  ): void {
    new ShortcutCaptureModal(this.app, { editor, onComplete }).open();
  }
}
