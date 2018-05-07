importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"
);

onmessage = event => {
  let data = event.data;
  if (Array.isArray(data)) {
    postMessage(self.hljs.highlightAuto(data.pop(), data).value);
  } else {
    close();
  }
};
