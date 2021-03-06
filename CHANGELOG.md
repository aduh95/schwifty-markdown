# Change log

### v2.0.0 (2020-06-11)

- BREAKING: drop support for Node.js 8, 9, 10, and 11. Support for Node.js 12
  LTS and Node.js 14+.
- BREAKING: use dynamic imports (lazy-loading) to improve parallel processing
  (requires Node.js 10+).
- BREAKING: use worker_threads for yUML and PlantUML rendering (requires Node.js
  12+).
- BREAKING: use unflagged ESM (requires Node.js 12.17+).
- Can now read Markdown from stdin.
- No more child process spawning.
- Remove use of paths relative to cwd.
- Export `md2html` function for external API usage.
- Improve SVG error visibility.
- Update dependencies.

### v1.8.5(2018-11-10)

- Update dependencies

### v1.8.4(2018-09-05)

- Fix a bug with code highlighting
- Fix a bug with links internal to a document
- Update dependencies for Node 11

### v1.8.3(2018-08-18)

- Update dependencies
- Fix a bug with inline charts

### v1.8.2(2018-08-15)

- Add support for uppercase markdown extension

### v1.8.1(2018-05-28)

- Install does not fail on unsupported Node version anymore
- Update `yuml2svg` dependency
- Remove usage of `is-windows` package to improve perf

### v1.8.0(2018-05-17)

- Add support for yUML sequence diagrams
- Add support for inline charts and UML diagrams
- Add support for mermaid diagrams (experimental)
- Remove `fs-extra` dependency in favor of `fs/promises`
- Improve package API access
- Fix bug on metadata with Windows-like EOL
- Improve performance of yUML diagrams rendering (lazy-load to improve startup
  time, rendering 10 times faster)
- Add preview for yUML and PlantUML inlined code

### v1.7.1(2018-03-08)

- Fix bug on Node 8.10

### v1.7.0(2018-02-19)

- Add CLI flag `--output` to output a PDF
- Add automatic non breaking spaces (helping French people mostly)
- Remove relative links on printing to avoid broken links

### v1.6.4(2018-02-16)

- Patch bug when clicking on a link containing a sub-element

### v1.6.3(2018-02-16)

- Add warning when no preload support on browser (break syntax highlighting)
- Add `.npmignore` file
- Update dependencies

### v1.6.2(2018-02-12)

- Fix page break around TOC

### v1.6.1(2018-02-05)

- Allow back navigation within local links with History API
- Fix a bug in Firefox causing tab to close unexpectedly

### v1.6.0(2018-01-31)

- Add support for YAML metadata (including external JS&CSS files)
- Update HTML `id` generation for `<hX>` tags to match behavior other markdown
  parsers
- Title is now set by the first h1 it it appears first in the document

### v1.5.3(2018-01-27)

- Fix HTML error
- Fix multiple tabs opening on Firefox

### v1.5.2(2018-01-13)

- Update dependencies
- Improve fallback message

### v1.5.1(2018-01-12)

- Use passive scroll listeners to improve performance

### v1.5.0(2018-01-12)

- Add support for images embedded in table
- Add warning message for browsers with no module support

### v1.4.4(2018-01-08)

- Fix typo

### v1.4.3(2017-12-22)

- Fix npm installation performance

### v1.4.2(2017-12-14)

- Update dependencies

### v1.4.1(2017-12-14)

- Add support for section without subsections in the TOC for bigger screens

### v1.4.0(2017-12-14)

- Add support for header and footer elements (experimental)

### v1.3.5(2017-12-11)

- Fix bug opening multiple instances of browser when saving markdown file
  several times in a row

### v1.3.4(2017-11-29)

- Fix bugs with xivmap

### v1.3.3(2017-11-28)

- Fix a bug with TOC
- Fix a bug when printing PlantUML diagram

### v1.3.2(2017-11-25)

- Add version script

### v1.3.1(2017-11-24)

- Fix glitches on xivmap
- Add support for SVG and table elements in xivmap

### v1.3.0(2017-11-24)

- Add xivmap to preview whole document (Sublime Text like)
- Place a minimal version of the TOC on the side with a scroll spy if viewport
  is large enough
- Fix a bug on Windows and `--no-java` flag

### v1.2.0(2017-11-23)

- Add `--no-java` flag to avoid crashes if Java is not on the PATH

### v1.1.0(2017-11-23)

- Add Chartist fork to render chart
- Add yUML support
- Add support for data URLs for images
- Fix bug when installing from npm
- Don't load highlight.js external script when there is no code to highlight

### v1.0.1(2017-11-17)

- Postpone the loading of images to get syntax highlighting sooner

### v1.0.0(2017-11-17)

- Add `highlight.js` for code highlighting(require internet connection)
- Fix bug with `--no-browser` option
  ([yargs#1011](https://github.com/yargs/yargs/issues/1011))
- Improve test speed

### v0.8.0(2017-11-16)

- Add tests
- Add `deepeset-level` option for the TOC
- Remove error when listening to a directory with only one md file
- Add async export on the index file
- Add `--port` option
- Add `--browser=` and `--no-browser` options
- Do not throw error when _address already in use_ and print an error message
  instead

### v0.7.0(2017-11-06)

- Add custom label to the generated TOC for i18n
- **Breaking changes**: The `id` of the TOC is now `toc` instead of
  `generated-toc`

### v0.6.0(2017-10-24)

- Add CSS for printing and PDF generation

### v0.5.0(2017-10-21)

- Switch from Pandoc to marked to parse Markdown
