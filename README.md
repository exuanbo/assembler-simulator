# Assembler Simulator

[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/exuanbo/assembler-simulator.svg?label=release&sort=semver)](https://github.com/exuanbo/assembler-simulator/tags)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/exuanbo/assembler-simulator/Node.js%20CI/main.svg)](https://github.com/exuanbo/assembler-simulator/actions/workflows/nodejs.yml)
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

A simulator of 8-bit CPU using the "Samphire" [Microprocessor Simulator](https://web.archive.org/web/20220417233401/http://www.softwareforeducation.com/sms32v50/index.php) instruction set (similar to the Intel 8086 chip). "Samphire" is used for teaching CS1111 Systems Organisation at University College Cork, but it is restricted to Windows.

This project aims to recreate as much of the "Samphire" application as possible and provide a better learning experience using modern front-end web technologies:

- [CodeMirror 6](https://codemirror.net/6/)
- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Windi CSS](https://windicss.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)

You can try it online [here](https://exuanbo.xyz/assembler-simulator/).

## Features

- 8-bit CPU with 4 general purpose registers
- 256 bytes of RAM
- Procedures / Subroutines
- Software and hardware interrupts
- Input from keyboard
- Output devices:
  - Memory mapped Visual Display Unit
  - Traffic lights
  - Seven-segment display
  - (More to come)
- Breakpoints and step-by-step execution
- Editor with syntax highlighting

## Inspired by

- [osslate/babassu](https://github.com/osslate/babassu) - special thanks 😀
- [Schweigi/assembler-simulator](https://github.com/Schweigi/assembler-simulator)
- [parraman/asm-simulator](https://github.com/parraman/asm-simulator)

## License

[GPL-3.0 License](https://github.com/exuanbo/assembler-simulator/blob/main/LICENSE) © 2022 [Exuanbo](https://github.com/exuanbo)
