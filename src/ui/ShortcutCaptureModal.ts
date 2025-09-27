import {
  App,
  ButtonComponent,
  Editor,
  EditorPosition,
  Modal,
  Setting,
} from "obsidian";

type CaptureResult = {
  display: string;
  key: string | null;
};

export interface ShortcutCaptureModalOptions {
  editor: Editor;
  onComplete?: (shortcut: string) => void;
}

const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);

const MODIFIER_LABELS = isMac
  ? {
      Mod: "⌘",
      Control: "⌃",
      Alt: "⌥",
      Shift: "⇧",
    }
  : {
      Mod: "Ctrl",
      Control: "Ctrl",
      Alt: "Alt",
      Shift: "Shift",
    };

const META_KEYS = new Set(["Meta", "OS"]);
const CONTROL_KEYS = new Set(["Control", "Ctrl"]);
const ALT_KEYS = new Set(["Alt", "Option"]);
const SHIFT_KEYS = new Set(["Shift"]);

const IGNORED_KEYS = new Set([
  "Dead",
  "Fn",
  "Hyper",
  "Super",
]);

const MODIFIER_KEYS = new Set([
  ...META_KEYS,
  ...CONTROL_KEYS,
  ...ALT_KEYS,
  ...SHIFT_KEYS,
]);

export class ShortcutCaptureModal extends Modal {
  private readonly editor: Editor;
  private readonly onComplete?: (shortcut: string) => void;

  private captureEl!: HTMLDivElement;
  private displayEl!: HTMLSpanElement;
  private confirmButton?: ButtonComponent;
  private currentShortcut: string | null = null;

  constructor(app: App, options: ShortcutCaptureModalOptions) {
    super(app);

    this.editor = options.editor;
    this.onComplete = options.onComplete;
  }

  onOpen(): void {
    this.titleEl.setText("Capture shortcut");

    this.contentEl.empty();
    this.currentShortcut = null;

    const description = this.contentEl.createEl("p", {
      text: "Press the shortcut you want to record.",
    });
    description.addClass("shortcut-capture-description");

    this.captureEl = this.contentEl.createDiv({
      cls: "shortcut-capture-input",
    });
    this.captureEl.setAttr("tabindex", "0");
    this.captureEl.setAttr("role", "button");
    this.captureEl.setAttr("aria-label", "Shortcut capture field");

    this.displayEl = this.captureEl.createEl("span", {
      text: "Press keys…",
    });

    this.captureEl.addEventListener("keydown", this.handleKeyDown, {
      passive: false,
    });
    this.captureEl.addEventListener("keyup", this.handleKeyUp, {
      passive: false,
    });

    new Setting(this.contentEl)
      .addButton((button) => {
        button.setButtonText("Cancel").onClick(() => this.close());
      })
      .addButton((button) => {
        this.confirmButton = button;
        button
          .setCta()
          .setButtonText("Insert")
          .setDisabled(true)
          .onClick(() => this.commitShortcut());
        this.updateConfirmState();
      });

    window.setTimeout(() => {
      this.captureEl.focus({ preventScroll: true });
    });
  }

  onClose(): void {
    this.captureEl.removeEventListener("keydown", this.handleKeyDown);
    this.captureEl.removeEventListener("keyup", this.handleKeyUp);
    this.confirmButton?.setDisabled(true);
    this.currentShortcut = null;
    this.contentEl.empty();
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    if (event.repeat) {
      return;
    }

    const result = this.buildShortcut(event);
    if (!result.key) {
      return;
    }

    this.currentShortcut = result.display;
    this.displayEl.setText(result.display || "Press keys…");
    this.updateConfirmState();
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  private buildShortcut(event: KeyboardEvent): CaptureResult {
    const modifiers: string[] = [];

    if (event.metaKey) {
      modifiers.push(MODIFIER_LABELS.Mod);
    }
    if (event.ctrlKey) {
      modifiers.push(MODIFIER_LABELS.Control);
    }
    if (event.altKey) {
      modifiers.push(MODIFIER_LABELS.Alt);
    }
    if (event.shiftKey) {
      modifiers.push(MODIFIER_LABELS.Shift);
    }

    const key = this.normalizeKey(event.key);
    const displayParts = [...modifiers];
    if (key) {
      displayParts.push(key);
    }

    return {
      display: displayParts.join(isMac ? "" : " + "),
      key,
    };
  }

  private normalizeKey(key: string): string | null {
    if (!key || IGNORED_KEYS.has(key)) {
      return null;
    }

    if (MODIFIER_KEYS.has(key)) {
      return null;
    }

    if (key === " ") {
      return "Space";
    }

    if (key.length === 1) {
      return key.toUpperCase();
    }

    switch (key) {
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
        return key.replace("Arrow", "");
      case "Escape":
        return "Esc";
      case "Backspace":
        return "Backspace";
      default:
        return key;
    }
  }

  private commitShortcut(): void {
    if (!this.currentShortcut) {
      return;
    }

    const { from, to } = this.getSelectionBounds();
    this.editor.replaceRange(this.currentShortcut, from, to);

    this.onComplete?.(this.currentShortcut);
    this.close();
  }

  private getSelectionBounds(): { from: EditorPosition; to: EditorPosition } {
    const selections = this.editor.listSelections();
    if (selections.length > 0) {
      const { anchor, head } = selections[0];
      return this.normalizeRange(anchor, head);
    }

    const cursor = this.editor.getCursor();
    return { from: cursor, to: cursor };
  }

  private normalizeRange(a: EditorPosition, b: EditorPosition): {
    from: EditorPosition;
    to: EditorPosition;
  } {
    if (a.line < b.line) {
      return { from: a, to: b };
    }
    if (a.line > b.line) {
      return { from: b, to: a };
    }

    if (a.ch <= b.ch) {
      return { from: a, to: b };
    }

    return { from: b, to: a };
  }

  private updateConfirmState(): void {
    if (this.confirmButton) {
      this.confirmButton.setDisabled(!this.currentShortcut);
    }
  }
}

export default ShortcutCaptureModal;
