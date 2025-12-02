import React, { useState } from "react";

const CamImages = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) return alert("Select an image first!");

    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch("http://localhost:3000/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Test Face Image Upload</h2>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br />
      <button onClick={handleUpload}>Upload & Compare</button>

      <pre style={{ background: "#eee", padding: "20px", marginTop: "20px" }}>
        {result}
      </pre>
    </div>
  );
};

export default CamImages;
