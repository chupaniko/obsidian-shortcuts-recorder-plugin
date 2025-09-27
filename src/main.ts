import { Notice, Plugin } from "obsidian";

export default class ShortcutRecorderPlugin extends Plugin {
  private statusBarItemEl: HTMLElement | null = null;

  async onload(): Promise<void> {
    console.log("Loading Shortcuts Recorder plugin");

    this.statusBarItemEl = this.addStatusBarItem();
    this.statusBarItemEl.setText("Shortcuts Recorder: Ready");

    this.addCommand({
      id: "shortcuts-recorder-show-status",
      name: "Show recorder status",
      callback: () => {
        new Notice("Shortcuts Recorder is ready to capture shortcuts.");
      }
    });
  }

  onunload(): void {
    console.log("Unloading Shortcuts Recorder plugin");

    if (this.statusBarItemEl) {
      this.statusBarItemEl.remove();
      this.statusBarItemEl = null;
    }
  }
}
