# Schwifty Markdown

This library allows you to generate Markdown files to HTML in your browser.

### Features

* Renders markdown files to HTML using Github CSS.
* Indexes your figures
* Generates a table of content for your Markdown file if you add the following tag:

    ```markdown
    <nav id="generated-toc"></nav>
    ```

* Renders your plantuml diagrams to SVG on the fly


### Install locally

First, you have to ensure that these dependencies are installed and available on your path:

* [Pandoc](http://pandoc.org/installing.html)
* [Yarn](//yarnpkg.com) or [npm](//npmjs.com)
* [Node (v8.5+)](//nodejs.org)
* [Java](//java.com) *(only if you include plantuml diagrams)*
* *(optional)* [Graphviz](//graphviz.org) (to generate all plantuml diagram types)


Then, you need to download the package dependecies using `yarn` or `npm` :

```sh
yarn install
```

#### Note for Windows Users

Because there is a small C++ component used for validating UTF-8 data, you will need to install a few other software packages in addition to Node to be able to build this module:

 * [Microsoft Visual C++](//support.microsoft.com/fr-fr/help/2977003/the-latest-supported-visual-c-downloads)
 * [Python 2.7](//python.org) (NOT Python 3.x)

### Run the server

```sh
yarn start path/to/directory/to/listen
```

Schwifty is going to listen for changes in all the markdown files within the
`path/to/directory/to/listen` and its subdirectories. As soon a `.md` file is saved, 
your default browser should open at [localhost:3000](http://localhost:3000) or reload to render your document.

**N.B.:** Be sure that the support for [ES6 Modules is available for your browser](//caniuse.com/#feat=es6-module)
to able to use the generated table of content and the automatic refresh.

