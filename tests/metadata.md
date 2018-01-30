---
title: "Title test: éàø-~\\ n"
author: Cypress \o/ Test
date: 1970-01-01

# Testing unknown metadata
schwifty: v1.5

application-name: Schwifty
keywords: test,schwifty,cypress
description:
    This file set a lot of metadata which should be inserted into HTML by Schwifty.

# Testing adding JS && CSS files
script:
    - script.js
    - //code.jquery.com/jquery.js
    - ftp://127.0.0.4/will_fail.js
    - ./empty.mjs # should be added as module
    - ./empty.css # CSS file as script
    - /dev/null

style:
    - script.css
    - //code.jquery.com/jquery.css
    - ftp://127.0.0.4/will_fail.css
    - ./empty.mjs # JS file as style
    - /dev/null
---

# Testing metadata

This file set a lot of metadata which should be inserted into HTML by Schwifty.
