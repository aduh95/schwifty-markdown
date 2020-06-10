import { isMainThread, Worker, parentPort, workerData } from "worker_threads";
import path from "path";
import { CONFIG } from "./definitions.mjs";

let exports;

if (isMainThread) {
  exports = (media, onError) => {
    const worker = new Worker(new URL(import.meta.url), {
      workerData: CONFIG.getItem("PLANTUML_CONFIG"),
      stdout: true,
    });
    worker.postMessage(media);
    worker.on("error", onError);
    return worker.stdout;
  };
} else {
  parentPort.on("message", media =>
    import("node-plantuml").then(module => {
      const { out } = module.default.generate(media, {
        format: "svg",
        include: path.dirname(media),
        config: workerData,
      });
      out.on("close", () => process.exit());
      out.pipe(process.stdout);
    })
  );
}

export default exports;
