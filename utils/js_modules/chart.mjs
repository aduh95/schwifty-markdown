import Chartist from "./chartist.mjs";
import { registerImageHandler } from "./lazyload.mjs";

const asyncLoadScript = (globalObject, src) =>
  new Promise(resolve => {
    if (globalObject in window) {
      resolve(window[globalObject]);
    } else {
      let script = document.createElement("script");
      script.async = true;
      script.addEventListener("load", () => resolve(window[globalObject]));
      script.src = src;
      document.head.appendChild(script);
    }
  });

const getPapa = () => asyncLoadScript("Papa", "/papaparse.min.js");

const parseCSV = (file, header) =>
  getPapa().then(
    Papa =>
      new Promise(resolve =>
        Papa.parse(file, {
          header,
          download:
            file.startsWith(".") || /^((?:(?:[a-z]+:)?\/\/)|data:)/i.test(file),
          complete: results => resolve(results.data),
          error: err => console.error(err),
          skipEmptyLines: true,
          comments: true,
        })
      )
  );

const getAbsolutePath = (path, cwd) =>
  path.startsWith(".") ? cwd + "/" + path : path;

const generate = async img => {
  const cache = "default";
  let chart = await fetch(img.src, { cache }).then(img => img.json());
  let imgWorkingDir = img.src.substr(0, img.src.lastIndexOf("/"));

  if ("string" === typeof chart.data) {
    let chartData = await parseCSV(
      getAbsolutePath(chart.data, imgWorkingDir),
      true
    );
    chart.data = {
      labels: Object.keys(chartData[0]),
      series: chartData.map(line => Object.values(line)),
    };
  } else if ("string" === typeof chart.data.series) {
    chart.data.series = await parseCSV(
      getAbsolutePath(chart.data.series, imgWorkingDir),
      false
    );
  }

  return new Chartist[chart.type](img.parentNode, chart.data, chart.options);
};

registerImageHandler(
  src => src.endsWith(".json") || src.startsWith("data:application/json,"),
  img => {
    img.hidden = true;
    return generate(img);
  }
);

registerImageHandler(
  src => src.endsWith(".csv") || src.startsWith("data:text/csv,"),
  img => {
    img.hidden = true;
    return parseCSV(img.src, /%0A/.test(img.src)).then(
      chartData =>
        new Chartist.Line(img.parentNode, {
          labels: Object.keys(chartData[0]),
          series: chartData.map(line => Object.values(line)),
        })
    );
  }
);
