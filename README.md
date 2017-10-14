# Schwifty Markdown

This library allows you to generate Markdown files to HTML in your browser.

It understands all markdown syntax supported by Pandoc, and generates for you SVG version of your plantuml diagrams.  
If you add the following tag in your markdown file, a clean table of content will be generated linking to the headings of your document:

```markdown
<nav id="generated-toc"></nav>
```


### Install locally

First, you have to ensure that these dependencies are installed and available on your path:

* [Pandoc](http://pandoc.org/installing.html)
* [Yarn](yarnpkg.com) or [npm](npmjs.com)
* [Node (v8.5+)](nodejs.org)
* *(optional)* [Graphviz](graphviz.org) (to generate all plantuml diagram types)


To begin with, you need to download the dependecies using `yarn` or `npm` :

```sh
yarn install
```

### Run the server

```sh
yarn start path/to/directory/to/listen
```

Your default browser should open at [localhost:3000](http://localhost:3000).  
Then, as soon as you save a `.md` file, it will be loaded in your browser.

**N.B.:** Be sure that the support for [ES6 Modules is available for your browser](https://caniuse.com/#feat=es6-module)
to able to use the generated table of content and the automatic refresh.

