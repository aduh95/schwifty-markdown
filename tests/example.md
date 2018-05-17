<header>
This is an example document for Schwifty Markdown
</header>

# Title of the document

The first `<h1>` is used as the title document (except override by the metadata).

# An h1 header

Paragraphs are separated by a blank line.

2nd paragraph. _Italic_, **bold**, and `monospace`. Itemized lists look like:

* this one
* that one
* the other one

Note that --- not considering the asterisk --- the actual text content starts at
4-columns in.

> Block quotes are written like so.
>
> They can span multiple paragraphs, if you like.

Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., "it's all in chapters
12--14").\
Unicode is supported. ☺

## An h2 header

Here's a numbered list:

1. first item
2. second item
3. third item

Note again how the actual text starts at 4 columns in (4 characters from the
left side). Here's a code sample:

    # Let me re-iterate ...
    for i in 1 .. 10 { do-something(i) }

As you probably guessed, indented 4 spaces. By the way, instead of indenting the
block, you can use delimited blocks, if you like:

```c
void foobar() {
    printf("Welcome to flavor country!\n");
}
```

### An h3 header

#### An h4 header

##### An h5 header

###### An h6 header

Now a nested list:

1. First, get these ingredients:

   * carrots
   * celery
   * lentils

2. Boil some water.

3. Dump everything in the pot and follow this algorithm:

   > find wooden spoon\
   > uncover pot\
   > stir\
   > cover pot\
   > balance wooden spoon precariously on pot handle\
   > wait 10 minutes\
   > goto first step (or shut off burner when done)

   Do not bump wooden spoon or it will fall.

Notice again how text always lines up on 4-space indents (including that last
line which continues item 3 above).

Here's a link to [a website](http://foo.bar), to a [local doc](local-doc.html),
and to a [section heading in the current doc](#an-h2-header). Here's a footnote
[^1].

[^1]: Footnote text goes here.

(The above is the caption for the table.):

| keyword | text                                                       |
| ------- | ---------------------------------------------------------- |
| red     | Sunsets, apples, and other red or reddish things.          |
| green   | Leaves, grass, frogs and other things it's not easy being. |

A horizontal rule follows.

---

Here's a definition list:

apples : Good for making applesauce. oranges : Citrus! tomatoes : There's no "e"
in tomatoe.

Again, text is indented 4 spaces. (Put a blank line between each term/definition
pair to spread things out more.)

and images can be specified like so:

![example image](example-image.png "An exemplary image")

And note that you can backslash-escape any punctuation characters which you wish
to be displayed literally, ex.: \`foo\`, \*bar\*, etc.

<footer>
&copy; 2017 &mdash; aduh95
</footer>
