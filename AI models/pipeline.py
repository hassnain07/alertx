from face_detector import FaceDetector
from face_recognizer import FaceRecognizer
from database import EmbeddingDB
from utils import read_image_bytes
import numpy as np

class FacePipeline:
    def __init__(self):

        # Initialize Detector 
        self.detector = FaceDetector()

        # Initialize Recognizer
        self.recognizer = FaceRecognizer()

        # Load Embedding Database
        db = EmbeddingDB().load_all()
        self.recognizer.load_database(db)

    def process(self, image_bytes):
        """
        Main pipeline function.
        Called by backend.
        """

        # Convert bytes → numpy array
        image = read_image_bytes(image_bytes)

        # Step 1: Face Detection
        faces = self.detector.face_detect(image)

        if len(faces) == 0:
            return {
                "face_found": False,
                "recognized": False,
                "name": None,
                "confidence": None
            }

        # Version 1: Only one face is processed
        face = faces[0]

        # Step 2: Get embedding
        embedding = face.normed_embedding
        embedding_list = embedding.tolist()

        # Step 3: Match with database
        name, score = self.recognizer.match(embedding)

        # IMPORTANT: If score is None → empty DB → avoid crash
        if score is None:
            return {
                "face_found": True,
                "recognized": False,
                "name": None,
                "confidence": None
            }

        # If recognized
        if name is not None:
           return {
                "face_found": True,
                "recognized": True,
                "name": name,
                "confidence": round(1 - score, 3),
                "embedding": embedding_list
            }

        # Unknown face
        return {
            "face_found": True,
            "recognized": False,
            "name": None,
            "confidence": round(1 - score, 3)
        }
