import { performance } from "perf_hooks";

async function measure() {
  const start = performance.now();
  console.log("Start");
  // Just testing if we can execute
}
measure();
