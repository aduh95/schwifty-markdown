# Change log

### Upcoming

* Integrate into VSCode (like Instant Markdown)

### v1.5.3(2018-01-27)

* Fix HTML error
* Fix multiple tabs opening on Firefox

### v1.5.2(2018-01-13)

* Update dependencies
* Improve fallback message

### v1.5.1(2018-01-12)

* Use passive scroll listeners to improve performance

### v1.5.0(2018-01-12)

* Add support for images embedded in table
* Add warning message for browsers with no module support

### v1.4.4(2018-01-08)

* Fix typo

### v1.4.3(2017-12-22)

* Fix npm installation performance

### v1.4.2(2017-12-14)

* Update dependencies

### v1.4.1(2017-12-14)

* Add support for section without subsections in the TOC for bigger screens

### v1.4.0(2017-12-14)

* Add support for header and footer elements (experimental)

### v1.3.5(2017-12-11)

* Fix bug opening multiple instances of browser when saving markdown file
  several times in a row

### v1.3.4(2017-11-29)

* Fix bugs with xivmap

### v1.3.3(2017-11-28)

* Fix a bug with TOC
* Fix a bug when printing PlantUML diagram

### v1.3.2(2017-11-25)

* Add version script

### v1.3.1(2017-11-24)

* Fix glitches on xivmap
* Add support for SVG and table elements in xivmap

### v1.3.0(2017-11-24)

* Add xivmap to preview whole document (Sublime Text like)
* Place a minimal version of the TOC on the side with a scroll spy if viewport
  is large enough
* Fix a bug on Windows and `--no-java` flag

### v1.2.0(2017-11-23)

* Add `--no-java` flag to avoid crashes if Java is not on the PATH

### v1.1.0(2017-11-23)

* Add Chartist fork to render chart
* Add yUML support
* Add support for data URLs for images
* Fix bug when installing from npm
* Don't load highlight.js external script when there is no code to highlight

### v1.0.1(2017-11-17)

* Postpone the loading of images to get syntax highlighting sooner

### v1.0.0(2017-11-17)

* Add `highlight.js` for code highlightning (require internet connection)
* Fix bug with `--no-browser` option
  ([yargs#1011](https://github.com/yargs/yargs/issues/1011))
* Improve test speed

### v0.8.0(2017-11-16)

* Add tests
* Add `deepeset-level` option for the TOC
* Remove error when listening to a directory with only one md file
* Add async export on the index file
* Add `--port` option
* Add `--browser=` and `--no-browser` options
* Do not throw error when _address already in use_ and print an error message
  instead

### v0.7.0(2017-11-06)

* Add custom label to the generated TOC for i18n
* **Breaking changes**: The `id` of the TOC is now `toc` instead of
  `generated-toc`

### v0.6.0(2017-10-24)

* Add CSS for printing and PDF generation

### v0.5.0(2017-10-21)

* Switch from Pandoc to marked to parse Markdown
