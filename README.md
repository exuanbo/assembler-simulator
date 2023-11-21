# Assembler Simulator

[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/exuanbo/assembler-simulator.svg?label=release&sort=semver)](https://github.com/exuanbo/assembler-simulator/tags)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/exuanbo/assembler-simulator/nodejs.yml.svg?branch=main)
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

A simulator of 8-bit CPU using the "Samphire" [Microprocessor Simulator](https://nbest.co.uk/Softwareforeducation/sms32v50/sms32v50_manual/index.htm) instruction set (similar to the Intel 8086 chip). "Samphire" is used for teaching CS1111 Systems Organisation at University College Cork, but it is restricted to Windows operating system.

This project aims to recreate as much of the "Samphire" application as possible and provide a better learning experience using modern front-end web technologies:

- [CodeMirror 6](https://codemirror.net/6/)
- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [RxJS](https://rxjs.dev/)
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

[GPL-3.0 License](https://github.com/exuanbo/assembler-simulator/blob/main/LICENSE) © 2022-Present [Exuanbo](https://github.com/exuanbo)
