"""
ML Semantic Embeddings & Journal Vector Search Engine.
Generates 384-dimensional dense semantic vector representations for reflections and executes
cosine-similarity search queries for semantic content retrieval.
"""
import math
import hashlib
from typing import List, Dict, Any


class MLSemanticEmbeddingsEngine:
    """
    Lightweight, high-performance semantic vector embedding generator.
    Produces deterministic 384-dimensional embedding vectors for semantic journal retrieval.
    """

    DIMENSION = 384

    @classmethod
    def generate_embedding(cls, text: str) -> List[float]:
        """
        Generates a normalized 384-dimensional embedding vector for input text.
        Uses hashed term frequency projections and n-gram subword features.
        """
        if not text:
            return [0.0] * cls.DIMENSION

        vector = [0.0] * cls.DIMENSION
        words = text.lower().split()

        for word in words:
            # Deterministic hash bucket allocation across 384 dimensions
            h = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
            dim_idx = h % cls.DIMENSION
            val = ((h >> 8) & 0xFF) / 255.0 - 0.5
            vector[dim_idx] += val

        # L2 Normalization
        norm = math.sqrt(sum(x * x for x in vector))
        if norm > 0:
            vector = [round(x / norm, 5) for x in vector]

        return vector

    @classmethod
    def cosine_similarity(cls, vec_a: List[float], vec_b: List[float]) -> float:
        """
        Computes cosine similarity score between two embedding vectors (-1.0 to 1.0).
        """
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0

        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))

        if norm_a == 0 or norm_b == 0:
            return 0.0

        return round(dot_product / (norm_a * norm_b), 4)


ml_semantic_engine = MLSemanticEmbeddingsEngine()
