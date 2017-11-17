# Change log

### Upcoming

- Integrate into VSCode (like Instant Markdown)

### v1.0.0(2017-11-17)

- Add `highlight.js` for code highlightning (require internet connection)
- Fix bug with `--no-browser` option ([yargs#1011](https://github.com/yargs/yargs/issues/1011))
- Improve test speed

### v0.8.0(2017-11-16)

- Add tests
- Add `deepeset-level` option for the TOC
- Remove error when listening to a directory with only one md file
- Add async export on the index file
- Add `--port` option
- Add `--browser=` and `--no-browser` options
- Do not throw error when *address already in use* and print an error message instead

### v0.7.0(2017-11-06)

- Add custom label to the generated TOC for i18n
- **Breaking changes**: The `id` of the TOC is now `toc` instead of `generated-toc`

### v0.6.0(2017-10-24)

- Add CSS for printing and PDF generation

### v0.5.0(2017-10-21)

- Switch from Pandoc to marked to parse Markdown