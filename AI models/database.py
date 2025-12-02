import os
import numpy as np


class EmbeddingDB:
    def __init__(self, db_path = "embeddings"):
        self.db_path = db_path
        os.makedirs(self.db_path, exist_ok=True)

    def save_embedding(self, name, embedding):
        np.save(os.path.join(self.db_path, f"{name}.npy"), embedding)

    def load_all(self):
        db = {}
        for file in os.listdir(self.db_path):
            if file.endswith(".npy"):
                name = file.replace(".npy", "")
                emb = np.load(os.path.join(self.db_path, file))
                db[name] = emb
        return db
    



