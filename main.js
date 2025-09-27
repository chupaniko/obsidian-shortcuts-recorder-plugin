"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ShortcutRecorderPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/ui/ShortcutCaptureModal.ts
var import_obsidian = require("obsidian");
var isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);
var MODIFIER_LABELS = isMac ? {
  Mod: "\u2318",
  Control: "\u2303",
  Alt: "\u2325",
  Shift: "\u21E7"
} : {
  Mod: "Ctrl",
  Control: "Ctrl",
  Alt: "Alt",
  Shift: "Shift"
};
var META_KEYS = /* @__PURE__ */ new Set(["Meta", "OS"]);
var CONTROL_KEYS = /* @__PURE__ */ new Set(["Control", "Ctrl"]);
var ALT_KEYS = /* @__PURE__ */ new Set(["Alt", "Option"]);
var SHIFT_KEYS = /* @__PURE__ */ new Set(["Shift"]);
var IGNORED_KEYS = /* @__PURE__ */ new Set([
  "Dead",
  "Fn",
  "Hyper",
  "Super"
]);
var MODIFIER_KEYS = /* @__PURE__ */ new Set([
  ...META_KEYS,
  ...CONTROL_KEYS,
  ...ALT_KEYS,
  ...SHIFT_KEYS
]);
var ShortcutCaptureModal = class extends import_obsidian.Modal {
  constructor(app, options) {
    super(app);
    this.currentShortcut = null;
    this.handleKeyDown = (event) => {
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
      this.displayEl.setText(result.display || "Press keys\u2026");
      this.updateConfirmState();
    };
    this.handleKeyUp = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    this.editor = options.editor;
    this.onComplete = options.onComplete;
  }
  onOpen() {
    this.titleEl.setText("Capture shortcut");
    this.contentEl.empty();
    this.currentShortcut = null;
    const description = this.contentEl.createEl("p", {
      text: "Press the shortcut you want to record."
    });
    description.addClass("shortcut-capture-description");
    this.captureEl = this.contentEl.createDiv({
      cls: "shortcut-capture-input"
    });
    this.captureEl.setAttr("tabindex", "0");
    this.captureEl.setAttr("role", "button");
    this.captureEl.setAttr("aria-label", "Shortcut capture field");
    this.displayEl = this.captureEl.createEl("span", {
      text: "Press keys\u2026"
    });
    this.captureEl.addEventListener("keydown", this.handleKeyDown, {
      passive: false
    });
    this.captureEl.addEventListener("keyup", this.handleKeyUp, {
      passive: false
    });
    new import_obsidian.Setting(this.contentEl).addButton((button) => {
      button.setButtonText("Cancel").onClick(() => this.close());
    }).addButton((button) => {
      this.confirmButton = button;
      button.setCta().setButtonText("Insert").setDisabled(true).onClick(() => this.commitShortcut());
      this.updateConfirmState();
    });
    window.setTimeout(() => {
      this.captureEl.focus({ preventScroll: true });
    });
  }
  onClose() {
    var _a;
    this.captureEl.removeEventListener("keydown", this.handleKeyDown);
    this.captureEl.removeEventListener("keyup", this.handleKeyUp);
    (_a = this.confirmButton) == null ? void 0 : _a.setDisabled(true);
    this.currentShortcut = null;
    this.contentEl.empty();
  }
  buildShortcut(event) {
    const modifiers = [];
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
      key
    };
  }
  normalizeKey(key) {
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
  commitShortcut() {
    var _a;
    if (!this.currentShortcut) {
      return;
    }
    const { from, to } = this.getSelectionBounds();
    this.editor.replaceRange(this.currentShortcut, from, to);
    (_a = this.onComplete) == null ? void 0 : _a.call(this, this.currentShortcut);
    this.close();
  }
  getSelectionBounds() {
    const selections = this.editor.listSelections();
    if (selections.length > 0) {
      const { anchor, head } = selections[0];
      return this.normalizeRange(anchor, head);
    }
    const cursor = this.editor.getCursor();
    return { from: cursor, to: cursor };
  }
  normalizeRange(a, b) {
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
  updateConfirmState() {
    if (this.confirmButton) {
      this.confirmButton.setDisabled(!this.currentShortcut);
    }
  }
};
var ShortcutCaptureModal_default = ShortcutCaptureModal;

// src/services/ShortcutCaptureService.ts
var ShortcutCaptureService = class {
  constructor(app) {
    this.app = app;
  }
  openCaptureModal(editor, onComplete) {
    new ShortcutCaptureModal_default(this.app, { editor, onComplete }).open();
  }
};

// src/main.ts
var ShortcutRecorderPlugin = class extends import_obsidian2.Plugin {
  async onload() {
    this.captureService = new ShortcutCaptureService(this.app);
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor, view) => {
        if (!(view instanceof import_obsidian2.MarkdownView)) {
          return;
        }
        const mode = view.getMode();
        if (mode !== "source" && mode !== "live") {
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
          item.setTitle("Record keyboard shortcut").setIcon("keyboard").onClick(() => {
            this.captureService.openCaptureModal(editor);
          });
        });
      })
    );
  }
  isCursorInMarkdownTable(editor, cursor) {
    var _a, _b, _c;
    const lineText = (_a = editor.getLine(cursor.line)) != null ? _a : "";
    if (!this.lineLooksLikeTable(lineText)) {
      return false;
    }
    const beforeCursor = lineText.slice(0, cursor.ch);
    const afterCursor = lineText.slice(cursor.ch);
    if (!beforeCursor.includes("|") || !afterCursor.includes("|")) {
      return false;
    }
    if (this.isDividerRow(lineText)) {
      return true;
    }
    const prevLine = cursor.line > 0 ? (_b = editor.getLine(cursor.line - 1)) != null ? _b : "" : "";
    const nextLine = (_c = editor.getLine(cursor.line + 1)) != null ? _c : "";
    if (this.isDividerRow(prevLine) || this.isDividerRow(nextLine)) {
      return true;
    }
    if (this.lineLooksLikeTable(prevLine) || this.lineLooksLikeTable(nextLine)) {
      return true;
    }
    return false;
  }
  lineLooksLikeTable(line) {
    if (!line) {
      return false;
    }
    const trimmed = line.trim();
    if (!trimmed.includes("|")) {
      return false;
    }
    if (/^```/.test(trimmed) || /^---/.test(trimmed)) {
      return false;
    }
    return true;
  }
  isDividerRow(line) {
    if (!line) {
      return false;
    }
    const trimmed = line.trim();
    return /^\|?(\s*:?-+:?\s*\|)+\s*$/.test(trimmed);
  }
};
