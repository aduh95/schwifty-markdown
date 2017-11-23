# Schwifty Markdown

This library allows you to generate Markdown files to HTML in your browser.

### Features

* Renders markdown files to HTML using Github CSS.
* Indexes your figures.
* Generates a table of content for your Markdown file if you add the following
  tag:

  ```html
  <nav id="toc" data-label="Table of content"></nav>
  ```

* Generates SVG charts in the browser.
* Renders yUML and PlantUML diagrams to SVG on the fly.

### Install locally

First, you have to ensure that these dependencies are installed and available on
your path:

* [Node (v8.5+)](//nodejs.org)
* [Yarn](//yarnpkg.com) or [npm](//npmjs.com)

> If you want schwifty to render PlantUML diagrams, you also need:
>
> * [Java](//java.com)
> * _(optional)_ [Graphviz](//graphviz.org) (to generate all PlantUML diagram
>   types)

Then, you need to download the package dependecies using `yarn` (you might need
to use `sudo`):

```sh
yarn global add schwifty-markdown
```

If you want to use `npm`:

```sh
npm -g install schwifty-markdown
```

#### Note for Windows Users

Because there is a small C++ component used for validating UTF-8 data, you will
need to install a few other software packages in addition to Node to be able to
build this module:

* [Microsoft Visual C++](//support.microsoft.com/fr-fr/help/2977003/the-latest-supported-visual-c-downloads)
* [Python 2.7](//python.org) (NOT Python 3.x)

If you have trouble to add Java on your path, you can disable Java-dependent
features to avoid crashing schwifty when it tries to call it. Add the
`--no-java` flag when you run schwifty:

```sh
schwifty --no-java path/to/directory/to/listen
```

### Run schwifty

#### Getting started

```sh
schwifty path/to/directory/to/listen
```

Schwifty is going to listen for changes in all the markdown files within the
`path/to/directory/to/listen` and its subdirectories. As soon a `.md` file is
saved, your default browser should open at
[localhost:3000](http://localhost:3000) or reload to render your document.

You can also watch only one file if that is more convenient to you:

```sh
schwifty path/to/file/to/render
```

You can get a detailed description of the possible options with some examples
using the `--help` flag:

```sh
schwifty --help
```

#### Browser support

* Schwifty Markdown uses HTML5, if your browser support it, it should work just
  fine.
* Be sure that the support for
  [ES6 Modules is available for your browser](//caniuse.com/#feat=es6-module) to
  able to use the generated table of content and the automatic refresh.

#### Print to PDF

To generate a PDF file, you have to use the print feature of your browser.

You can insert **page break** in your document like this:

```markdown
This goes on the first page

---

This goes on the second one
```

#### Syntax highlighting

You can insert snippet of code in your document:

````markdown
```c
int main(int argc, char* argv) {
    printf("Hello Wolrld!\n);
    return 0;
}
```
````

Schwifty Markdown uses [highlight.js](https://highlightjs.org/) to highlight
your code. You have to specify the language you are using, else it will be
interpreted as plain text.

**N.B.:** Schwifty uses the CDN hosted verion of `highlight.js`, which means a
network access is required to perform the syntax highlighting.

#### Automatic Table Of Content

If the file you are editing in huge, the need to index your headings and have a
table of content linking to the differents parts of the document. You can have
this by using this tag in your markdown file:

```html
<nav id="toc"></nav>
```

**N.B.:** Schwifty indexes only the headings which come after the `<nav>` tag.

**N.B.:** The tag must only appear once in your document.

By default, the TOC is collapsed into a `<summary>` element. You might want to
change its text for i18n. Exemple, for a document written in French:

```html
<nav id="toc" data-label="Table des matières"></nav>
```

Markdown allows you to have up to 6 levels of headings, which allows you to
define sub-part, and sub-sub-part, etc. in your document. However, you might
want the deepest levels not to be included in your TOC. You can specify a
maximum heading level for your TOC by adding an attribute to the tag:

```html
<!-- This will ask Schwifty to ignore headings of level 5 and 6 -->

<nav id="toc" data-deepest-level="4"></nav>
```

#### Figure indexing

By default, Schwifty Markdown indexes all your figures and displays the
incremented counter before the caption of the figure. If you want to change this
behavior, you can add the following code in your document:

```html
<!-- Remove the figure counter -->

<style>
figcaption::before{
    display:none;
}
</style>
```

Furthermore, if you want to completely disable the captions below the figures,
use the following:

```html
<!-- Remove all the figure captions -->

<style>
figcaption{
    display:none;
}
</style>
```

#### Charts

You can add charts on your document. Schwifty reads CSV, so you can link to your
data and it will render a line chart:

```markdown
![Title of the chart](./data.csv)
```

Your data can be represented this way in the `data.csv` file:

```csv
# Lines starting with `#` will be ignored, you can use them for your comments
# First the labels
Monday,Tuesday,Wednesday,Thursday,Friday
# BTW, you can ommit this first line, Schwifty will use a range of integers starting from 1
# Then comes the data
8,5,6,2,3
# You can have several lines of data
5,6,8,4,3
# Empty lines will be ignored, don't be afraid to take your space



5,6,1,2,3
```

If you need more customization, you can use a JSON file:

```json
{
  "type": "Line",
  "data": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "series": [[8, 5, 6, 2, 3], [5, 6, 8, 4, 3], [5, 6, 1, 2, 3]]
  },
  "options": {}
}
```

There are 3 types supported:

* Line
* Pie
* Bar

The list of available options is described on the
[Chartist documentation](//gionkunz.github.io/chartist-js/api-documentation.html).

You can combine the two methods by having a JSON file for the customization and
a CSV file for the data:

```markdown
![Title of the chart](./chart.json)
```

```json
{
  "type": "Bar",
  "data": "./data.csv"
}
```

_The rendering is done locally using a fork of
[Chartist](https://gionkunz.github.io/chartist-js/)._

#### yUML usage

Schwifty Markdown can render on-the-fly your PlantUML diagrams, just insert it
as an image, it will render as an SVG.

```markdown
![Legend](./diagram.yuml)
```

The syntax is described on this
[wiki page](https://github.com/jaime-olivares/vscode-yuml/wiki).

_The rendering is done locally using
[yuml2svg](https://github.com/aduh95/vscode-yuml) which relies on
[Viz.js](https://github.com/mdaines/viz.js) (a Javascript port of
[Dot/Graphviz](http://www.graphviz.org/))._

#### PlantUML usage

Schwifty Markdown can render on-the-fly your PlantUML diagrams, just insert it
as an image, it will render as an SVG.

```markdown
![Legend](./diagram.pu)
```

The syntax is described on the [PlantUML website](http://PlantUML.com/).

**N.B.:** As PlantUML rendering requires to call a Java dependency, the process
might be slow depending of your machine (about 4.6 times slower than yUML
rendering on my computer). All the rendering is done locally, you don't need a
network access to work with your diagrams.

**N.B.:** The PlantUML project is not published on `npm`, which means it has to
be updated manually. You can do so by typing `schwifty -u`.

**N.B.:** The only supported extension for PlantUML diagrams is `.pu`. If you
think I should add suppport more file extensions, please raise an issue or
submit a pull request.

**N.B.:** If you use [preprocessing includes](preprocessing) in your diagrams,
you might have trouble with the cache of your navigator. Most browser won't ask
schwifty to re-generate the SVG unless the target file has changed.
