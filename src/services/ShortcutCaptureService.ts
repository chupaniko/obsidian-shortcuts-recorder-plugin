import { App, Modal } from 'obsidian';

export class ShortcutCaptureService {
  constructor(private readonly app: App) {}

  openCaptureModal(): void {
    new ShortcutCaptureModal(this.app).open();
  }
}

class ShortcutCaptureModal extends Modal {
  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: 'Record keyboard shortcut' });
    contentEl.createEl('p', {
      text: 'Press the desired keyboard shortcut to record it.',
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
