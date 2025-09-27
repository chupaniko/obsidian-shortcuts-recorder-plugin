# obsidian-shortcuts-recorder-plugin
Records keyboard shortcuts into Obsidian notes to memorise them easily.

## Manual testing

To validate the shortcut capture flow, exercise the plugin manually in Obsidian 1.5 or newer on:

- macOS (for example, macOS Sonoma 14) – ensure Command/Option-based combinations render with platform-specific symbols such as `⌘`, `⌥`, and `⇧`.
- Windows 11 or a modern Linux distribution – ensure Control/Alt-based combinations render in the `Ctrl +`/`Alt +` format.

> **Limitations:** Operating systems and Obsidian reserve some global shortcuts (for example, `Cmd+Tab`, `Ctrl+Alt+Delete`, or `Cmd+Space`). These combinations cannot be intercepted by plugins, so they will not be recordable through the modal.
