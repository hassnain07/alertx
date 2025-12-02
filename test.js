import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";

const FaceCapture = ({ onVectorReady }) => {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const circleRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [message, setMessage] = useState("Loading face models...");
  const [borderColor, setBorderColor] = useState("red");
  const [progress, setProgress] = useState(0);

  let stabilityTimer = useRef(0);
  let lastGuide = useRef("");

  // ───────────────────────────────────────────────
  // SPEAK HELP TEXT
  // ───────────────────────────────────────────────
  const speak = (text) => {
    if (lastGuide.current === text) return; // avoid repeating
    lastGuide.current = text;

    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US";
    msg.rate = 1;
    window.speechSynthesis.speak(msg);
  };

  // ───────────────────────────────────────────────
  // LOAD MODELS
  // ───────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    ]).then(() => {
      setModelsLoaded(true);
      setMessage("Models loaded. Click Start Camera.");
      speak("Models loaded. Click start camera when ready.");
    });
  }, []);

  // ───────────────────────────────────────────────
  // START CAMERA
  // ───────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 720, height: 720 },
      });

      videoRef.current.srcObject = stream;
      setCameraStarted(true);
      setMessage("Camera started. Position your face.");
      speak("Camera started. Position your face in the center circle.");
      runLiveFaceGuide();
    } catch (err) {
      setMessage("Camera error.");
    }
  };

  // ───────────────────────────────────────────────
  // STOP CAMERA
  // ───────────────────────────────────────────────
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraStarted(false);
    setProgress(0);
  };

  // ───────────────────────────────────────────────
  // BLUR detection using Laplacian variance (approx)
  // ───────────────────────────────────────────────
  const calculateBlurScore = (canvas) => {
    const ctx = canvas.getContext("2d");
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let sum = 0;

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      const intensity = (r + g + b) / 3;
      sum += intensity;
    }

    const mean = sum / (imgData.data.length / 4);
    let variance = 0;

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      const intensity = (r + g + b) / 3;
      variance += (intensity - mean) ** 2;
    }

    return variance / (imgData.data.length / 4);
  };

  // ───────────────────────────────────────────────
  // LIGHT detection
  // ───────────────────────────────────────────────

  const getLightLevel = (canvas) => {
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }

    return total / (data.length / 4); // brightness 0-255
  };

  // ───────────────────────────────────────────────
  // LIVE REAL-TIME FACE GUIDANCE
  // ───────────────────────────────────────────────
  const runLiveFaceGuide = () => {
    const canvas = overlayRef.current;
    const circle = circleRef.current;
    const video = videoRef.current;

    const displaySize = { width: 320, height: 320 };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw circular guide
      const c = canvas.getContext("2d");
      c.beginPath();
      c.strokeStyle = "white";
      c.lineWidth = 3;
      c.arc(160, 160, 120, 0, 2 * Math.PI);
      c.stroke();

      if (!detection) {
        setBorderColor("red");
        setMessage("❌Face not detected.");
        speak("Face not detected. Move into the frame.");
        setProgress(0);
        return;
      }

      // Light level
      const brightness = getLightLevel(canvas);

      // Much more forgiving lighting conditions
      if (brightness < 25) {
        setMessage("❌ Too dark.");
        speak("Too dark. Try to increase lighting.");
        setProgress(Math.max(progress - 10, 0));
        return;
      }

      if (brightness > 235) {
        setMessage("❌ Too bright.");
        speak("Too bright. Reduce lighting.");
        setProgress(Math.max(progress - 10, 0));
        return;
      }

      const resized = faceapi.resizeResults(detection, displaySize);

      // draw face box
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);

      // Check face position
      const guideStatus = evaluateFacePosition(resized);
      setMessage(guideStatus.message);

      if (guideStatus.color !== "green") {
        setBorderColor("red");
        speak(guideStatus.voice);
        setProgress(0);
        return;
      }

      const blurScore = calculateBlurScore(canvas);

      // Less strict blur requirement
      if (blurScore < 90) {
        setMessage("⚠ Slightly blurry.");
        speak("Image is slightly blurry, hold still.");
        setProgress(Math.max(progress - 5, 0));
        return;
      }

      setBorderColor("green");
      setMessage("✔ Perfect! Hold still...");
      speak("Perfect. Hold still.");

      stabilityTimer.current += 200;
      setProgress(Math.min((stabilityTimer.current / 1500) * 100, 100));

      if (stabilityTimer.current >= 1500) {
        stabilityTimer.current = 0;
        startAdvancedCapture();
      }
    }, 200);
  };

  // ───────────────────────────────────────────────
  // POSITION CHECKS
  // ───────────────────────────────────────────────
  const evaluateFacePosition = (detection) => {
    const box = detection.detection.box;
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    const distFromCenter = Math.sqrt(
      (centerX - 160) ** 2 + (centerY - 160) ** 2
    );

    // More forgiving center circle
    if (distFromCenter > 90)
      return {
        color: "yellow",
        message: "⚠ Adjust to center",
        voice: "Move slightly to the center",
      };

    // More forgiving size limits
    if (box.width < 100)
      return {
        color: "yellow",
        message: "⚠ Move closer",
        voice: "Move a little closer",
      };

    if (box.width > 300)
      return {
        color: "yellow",
        message: "⚠ Move back",
        voice: "Move a little back",
      };

    return { color: "green", message: "✔ Good", voice: "Good" };
  };

  // ───────────────────────────────────────────────
  // CAPTURE FACE DESCRIPTOR
  // ───────────────────────────────────────────────
  const captureDescriptor = async () => {
    const r = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    return r || null;
  };

  // ───────────────────────────────────────────────
  // MULTI-ANGLE ADVANCED CAPTURE
  // ───────────────────────────────────────────────
  const ANGLES = [
    { msg: "Look straight", wait: 1200 },
    { msg: "Turn slightly left", wait: 1200 },
    { msg: "Turn slightly right", wait: 1200 },
  ];

  const startAdvancedCapture = async () => {
    setMessage("📸 Capturing...");
    speak("Capturing, please keep your face steady.");

    const all = [];

    for (let angle of ANGLES) {
      setMessage(`➡ ${angle.msg}`);
      speak(angle.msg);
      await new Promise((r) => setTimeout(r, angle.wait));

      for (let i = 0; i < 8; i++) {
        const r = await captureDescriptor();
        if (r) all.push(r.descriptor);
        await new Promise((res) => setTimeout(res, 120));
      }
    }

    if (all.length === 0) {
      setMessage("❌ Unable to capture.");
      speak("Unable to capture your face. Please try again.");
      return;
    }

    // average embeddings
    const finalVector = Array(128).fill(0);
    all.forEach((vec) => {
      vec.forEach((v, i) => (finalVector[i] += v));
    });
    for (let i = 0; i < 128; i++) finalVector[i] /= all.length;

    setMessage("✅ Capture complete!");
    speak("Capture complete. You can move to the next step.");
    stopCamera();
    onVectorReady(finalVector);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>AI Face Capture</h2>

      <div
        style={{
          width: 320,
          height: 320,
          margin: "auto",
          border: `5px solid ${borderColor}`,
          borderRadius: 10,
          position: "relative",
        }}
      >
        <video
          ref={videoRef}
          width={320}
          height={320}
          autoPlay
          muted
          style={{ borderRadius: 10 }}
        />

        <canvas
          ref={overlayRef}
          width={320}
          height={320}
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        <canvas
          ref={circleRef}
          width={320}
          height={320}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>

      {/* Progress Bar */}
      {cameraStarted && (
        <div
          style={{
            width: 200,
            height: 10,
            margin: "10px auto",
            background: "#ddd",
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: progress + "%",
              height: "100%",
              background: "green",
              transition: "0.2s",
            }}
          ></div>
        </div>
      )}

      <p style={{ fontWeight: "bold" }}>{message}</p>

      {!cameraStarted && (
        <button
          onClick={startCamera}
          disabled={!modelsLoaded}
          style={{ marginTop: 10 }}
        >
          Start Camera
        </button>
      )}
      {cameraStarted && (
        <button
          onClick={stopCamera}
          style={{ marginTop: 10, background: "red", color: "white" }}
        >
          Stop Camera
        </button>
      )}
    </div>
  );
};

export default FaceCapture;
