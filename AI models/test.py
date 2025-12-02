from pipeline import FacePipeline

pipeline = FacePipeline()

# Load a test image
with open("D:\AlertX\Code\images\image3.jpg", "rb") as f:
    image_bytes = f.read()

result = pipeline.process(image_bytes)

print("\n=== RESULT ===")
print(result)
