import sys
import os
import json
import base64

# Add current folder to Python import path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from pipeline import FacePipeline

pipeline = FacePipeline()

# Read JSON from Node
raw = sys.stdin.read()
data = json.loads(raw)

# Base64 → bytes
image_bytes = base64.b64decode(data["image"])

result = pipeline.process(image_bytes)

# Ensure embedding key exists
try:
    result["embedding"] = result.get("embedding") or None
except:
    result["embedding"] = None

print(json.dumps(result))
