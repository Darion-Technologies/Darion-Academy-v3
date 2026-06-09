import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let model: cocoSsd.ObjectDetection | null = null;

self.onmessage = async (e: MessageEvent) => {
  if (e.data.type === 'load') {
    await tf.ready();
    model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
    self.postMessage({ type: 'loaded' });
  } else if (e.data.type === 'detect') {
    if (!model) return;
    try {
      const predictions = await model.detect(e.data.imageData, 10, 0.4);
      self.postMessage({ type: 'result', predictions });
    } catch (err) {
      console.error("[Proctor Worker] Detection error:", err);
    }
  }
};
