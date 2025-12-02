import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs-core";
import * as faceapi from "face-api.js";

const FaceCapture = ({ onVectorReady }) => {
  const videoRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [message, setMessage] = useState("Loading face models...");
  const [step, setStep] = useState(0); // 0 = straight, 1 = left, 2 = right
  const [embeddings, setEmbeddings] = useState([]);

  // ────────────────────────────────────────────
  // SPEAK FUNCTION (TEXT-TO-SPEECH)
  // ────────────────────────────────────────────
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1; // speed
    utterance.pitch = 1; // tone
    utterance.volume = 1; // volume
    speechSynthesis.cancel(); // stop previous voice
    speechSynthesis.speak(utterance);
  };

  // ────────────────────────────────────────────
  // LOAD MODELS
  // ────────────────────────────────────────────
  useEffect(() => {
    const loadModels = async () => {
      await tf.setBackend("cpu");
      await tf.ready();

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);

      setModelsLoaded(true);
      setMessage("Models loaded. Click Start Camera.");
      speak("Models loaded. Please click Start Camera.");
    };

    loadModels();
  }, []);

  // ────────────────────────────────────────────
  // START CAMERA
  // ────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setCameraStarted(true);
        setStep(0);
        setMessage("Look straight and click Capture.");
        speak("Camera started. Please look straight and click Capture.");
      };
    } catch (err) {
      setMessage("Camera error: " + err.message);
      speak("Camera error occurred.");
    }
  };

  // ────────────────────────────────────────────
  // STOP CAMERA
  // ────────────────────────────────────────────
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
    setCameraStarted(false);
  };

  // ────────────────────────────────────────────
  // CAPTURE CURRENT ANGLE
  // ────────────────────────────────────────────
  const captureEmbedding = async () => {
    setMessage("Capturing...");
    speak("Capturing. Hold still.");

    const result = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 160,
          scoreThreshold: 0.5,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!result) {
      setMessage("❌ No face detected. Try again.");
      speak("No face detected. Please try again.");
      return;
    }

    const newEmbeddings = [...embeddings, result.descriptor];
    setEmbeddings(newEmbeddings);

    if (step === 0) {
      setStep(1);
      setMessage("Turn LEFT and click Capture.");
      speak("Good. Now turn left and click Capture.");
    } else if (step === 1) {
      setStep(2);
      setMessage("Turn RIGHT and click Capture.");
      speak("Great. Now turn right and click Capture.");
    } else if (step === 2) {
      stopCamera();
      setMessage("Processing average vector...");
      speak("Captures complete. Processing face data.");

      const averaged = averageEmbeddings(newEmbeddings);
      onVectorReady(averaged);

      setMessage("✅ Face captured successfully!");
      speak("Face captured successfully.");
    }
  };

  // ────────────────────────────────────────────
  // AVERAGE 3 EMBEDDINGS (128-D)
  // ────────────────────────────────────────────
  const averageEmbeddings = (vectors) => {
    const avg = Array(128).fill(0);

    for (let i = 0; i < 128; i++) {
      avg[i] = (vectors[0][i] + vectors[1][i] + vectors[2][i]) / 3;
    }

    return avg;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Face Capture (Multi-Angle + Voice Guide)</h2>

      <div
        style={{
          width: 320,
          height: 240,
          margin: "auto",
          border: "3px solid black",
          borderRadius: 10,
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{ width: "100%", height: "100%", borderRadius: 10 }}
        />
      </div>

      <p style={{ fontWeight: "bold", marginTop: 10 }}>{message}</p>

      {!cameraStarted && (
        <button onClick={startCamera} disabled={!modelsLoaded}>
          Start Camera
        </button>
      )}

      {cameraStarted && (
        <button
          style={{ marginTop: 10, background: "#4CAF50", color: "white" }}
          onClick={captureEmbedding}
        >
          Capture Angle
        </button>
      )}
    </div>
  );
};

export default FaceCapture;
