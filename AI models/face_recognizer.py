import numpy as np
from scipy.spatial.distance import cosine 


class FaceRecognizer:
    def __init__(self, threshold=0.40):
        self.threshold = threshold
        self.db = {}

    def load_database(self, db_dict):
        self.db = db_dict
    
    def match(self, embedding):
        """
        compare embedding with data base using cosine similarity.
        lower score = more similar

        """
        if len(self.db) == 0:
            return None, None
        
        best_name = None
        best_score = 1.0

        for name, emb, in self.db.items():
            score = cosine(embedding, emb)

            if score < best_score:
                best_score = score
                best_name = name

        if best_score <= self.threshold:
            return best_name, best_score
        

        return None, best_score
        
            