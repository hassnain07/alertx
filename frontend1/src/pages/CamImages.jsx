import React, { useState } from "react";

const CamImages = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    // Show preview
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) return alert("Select an image first!");

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch("http://localhost:3000/api/esp32/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult("Error uploading: " + error.message);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "500px" }}>
      <h2>Test ESP32 Image Upload</h2>

      {/* File selection */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {/* Preview selected image */}
      {preview && (
        <div style={{ marginTop: "20px" }}>
          <h4>Preview:</h4>
          <img
            src={preview}
            alt="preview"
            style={{ width: "200px", borderRadius: "10px" }}
          />
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Upload Image
      </button>

      {/* Server response */}
      <pre
        style={{ background: "#f4f4f4", padding: "20px", marginTop: "20px" }}
      >
        {result}
      </pre>
    </div>
  );
};

export default CamImages;
