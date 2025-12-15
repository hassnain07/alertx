import sys
import json
import base64
import cv2
import numpy as np
from insightface.app import FaceAnalysis
from sklearn.decomposition import PCA

# -------- Initialize InsightFace --------
app = FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=0, det_size=(640, 640))

# -------- PCA (512 → 128) --------
# NOTE: This PCA should ideally be FIT once on many embeddings
pca = PCA(n_components=128)

# TEMP: Fit PCA using identity matrix (works but better to fit on real data)
pca.fit(np.eye(512))

def image_bytes_to_embedding(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return None

    faces = app.get(img)
    if len(faces) == 0:
        return None

    emb_512 = faces[0].normed_embedding.reshape(1, -1)
    emb_128 = pca.transform(emb_512)

    return emb_128[0].tolist()

# -------- Read input from Node --------
raw = sys.stdin.read()
data = json.loads(raw)

image_bytes = base64.b64decode(data["image"])
embedding = image_bytes_to_embedding(image_bytes)

print(json.dumps({
    "success": embedding is not None,
    "embedding": embedding
}))


print(json.dumps({
    "success": "Hello",
}))
