importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"
);

onmessage = ({ data }) =>
  Array.isArray(data)
    ? postMessage(self.hljs.highlightAuto(data.pop(), data).value)
    : self.close();
