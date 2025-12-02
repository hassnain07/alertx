const faceapi = require("face-api.js");
const path = require("path");
const canvas = require("canvas");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function loadModels() {
  const MODEL_URL = path.join(__dirname, "models");

  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);

  console.log("face-api.js models loaded");
}

module.exports = { faceapi, canvas, loadModels };
