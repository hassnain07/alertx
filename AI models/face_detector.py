from insightface.app import FaceAnalysis
import numpy as np
import cv2

class FaceDetector:
    def __init__(self, model_name="buffalo_l", ctx_id=0, det_thresh=0.7):
        self.app = FaceAnalysis(name=model_name)
        self.app.prepare(ctx_id=ctx_id)
        self.threshold = det_thresh   # <-- FIXED

    def face_detect(self, image):
        """
        Detect faces in an image.
        Returns: list of face objects
        """

        # FIX 1: type check
        if not isinstance(image, np.ndarray):
            raise ValueError("Image must be a numpy array.")

        faces = self.app.get(image)

        # FIX 2: correct threshold reference
        faces = [f for f in faces if f.det_score >= self.threshold]

        return faces

    def extract_face(self, image, face):
        """
        Extract aligned face from face object.
        """
        # insightface automatically gives you aligned face embedding
        return face.normed_embedding
