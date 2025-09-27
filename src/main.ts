import { Editor, Plugin } from "obsidian";
import { ShortcutCaptureModal } from "./ui/ShortcutCaptureModal";

export default class ShortcutsRecorderPlugin extends Plugin {
  async onload(): Promise<void> {
    this.addCommand({
      id: "capture-shortcut",
      name: "Capture shortcut",
      editorCallback: (editor: Editor) => {
        const modal = new ShortcutCaptureModal(this.app, {
          editor,
          onComplete: (shortcut) => {
            console.debug("Captured shortcut", shortcut);
          },
        });

        modal.open();
      },
    });
  }
}
