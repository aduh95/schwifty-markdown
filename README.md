# Schwifty Markdown

This library allows you to generate Markdown files to HTML in your browser.

### Features

* Renders markdown files to HTML using Github CSS.
* Indexes your figures
* Generates a table of content for your Markdown file if you add the following tag:

    ```markdown
    <nav id="toc" data-label="Table of content"></nav>
    ```

* Renders your plantuml diagrams to SVG on the fly


### Install locally

First, you have to ensure that these dependencies are installed and available on your path:

* [Node (v8.5+)](//nodejs.org)
* [Yarn](//yarnpkg.com) or [npm](//npmjs.com)
* [Java](//java.com) *(only if you include plantuml diagrams)*
* *(optional)* [Graphviz](//graphviz.org) (to generate all plantuml diagram types)


Then, you need to download the package dependecies using `yarn` (you might need to use `sudo`):

```sh
yarn global add schwifty-markdown
```

If you want to use `npm`:

```sh
npm -g install schwifty-markdown
```

#### Note for Windows Users

Because there is a small C++ component used for validating UTF-8 data, you will need to install a few other software packages in addition to Node to be able to build this module:

 * [Microsoft Visual C++](//support.microsoft.com/fr-fr/help/2977003/the-latest-supported-visual-c-downloads)
 * [Python 2.7](//python.org) (NOT Python 3.x)

### Run schwifty

#### Getting started

```sh
schwifty path/to/directory/to/listen
```

Schwifty is going to listen for changes in all the markdown files within the
`path/to/directory/to/listen` and its subdirectories. As soon a `.md` file is saved, 
your default browser should open at [localhost:3000](http://localhost:3000) or reload to render your document.

You can also watch only one file if that is more convenient to you:

```sh
schwifty path/to/file/to/render
```

#### Plantuml usage

Schwifty Markdown can render on-the-fly your Plantuml diagrams, just insert it as an image, it will render as an SVG.

```markdown
![Legend](./diagram.pu)
```

**N.B.:** The only supported extension for plantuml diagrams is `.pu`. If you think I should add suppport more
file extensions, please raise an issue or submit a pull request.

**N.B.:** If you use [preprocessing includes](preprocessing) in your diagrams, you might have trouble with the cache of
your navigator. Most browser won't ask schwifty to re-generate the SVG unless the target file has changed.

#### Browser support

 * Schwifty Markdown uses HTML5, if your browser support it, it should work just fine.
 * Be sure that the support for [ES6 Modules is available for your browser](//caniuse.com/#feat=es6-module)
   to able to use the generated table of content and the automatic refresh.

#### PDF generator

To generate a PDF file, you have to use the print feature of your browser.

You can insert **page break** in your document like this:

```markdown
This goes on the first page

---------------

This goes on the second one
```

By default, Schwifty Markdown indexes all your figures and displays the incremented counter
before the caption of the figure. If you want to change this behavior, you can add the following
code in your document:

```markdown
<!-- Remove the figure counter -->
<style>
figcaption::before{
    display:none;
}
</style>

<!-- Remove all the figure captions -->
<style>
figcaption{
    display:none;
}
</style>
```