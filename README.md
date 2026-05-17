# ScratchJr Web Port

[Demo site](https://vroby65.github.io/scratchJr-web/)

An unofficial web port of the official [ScratchJr](https://www.scratchjr.org/) Android application, built to run directly in a browser with no installation required.

## What is ScratchJr?

ScratchJr is an introductory programming language that enables young children (ages 5–7) to create their own interactive stories and games. Children snap together graphical programming blocks to make characters move, jump, dance, and sing. It's a project from the DevTech Research Group at Tufts University, the Lifelong Kindergarten Group at the MIT Media Lab, and the Playful Invention Company.

## How it works

This port adapts the original Android app's logic and assets to run as a pure web application using:

- **JavaScript (app.bundle.js)** — the core engine, block logic, and UI rendering
- **HTML pages** — `index.html` (launcher), `editor.html` (project editor), `home.html` (project gallery), and `gettingstarted.html` (tutorial)
- **CSS** — styling for the editor, lobby, paint tool, and other UI panels
- **Assets** — SVG/PNG libraries for characters and backgrounds, sound effects, fonts, and localization files

No server-side processing is required. The entire app runs client-side in the browser and stores projects locally.

## License

This project is fully open source. ScratchJr itself is licensed under the MIT License, and this port follows the same open source spirit. See the [LICENSE](../LICENSE) file for details.

---

*This is an unofficial port and is not affiliated with or endorsed by the ScratchJr team, Tufts University, or the MIT Media Lab.*
