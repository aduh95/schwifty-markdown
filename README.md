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

### Run the server

```sh
yarn start path/to/directory/to/listen
```

Your default browser should open at [localhost:3000](http://localhost:3000).  
Then, as soon as you save a `.md` file, it will be rendered in your browser.

**N.B.:** Be sure that the support for [ES6 Modules is available for your browser](//caniuse.com/#feat=es6-module)
to able to use the generated table of content and the automatic refresh.

