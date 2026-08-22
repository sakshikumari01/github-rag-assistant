import chromadb
from sentence_transformers import SentenceTransformer

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
chroma_client = chromadb.PersistentClient(path="chroma_db")

def get_collection():
    return chroma_client.get_or_create_collection(name="test_collection")

def embed_and_store(chunks):
    collection = get_collection()

    ids = [f"chunk_{i}" for i in range(len(chunks))]
    embeddings = embedding_model.encode(chunks).tolist()

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
    )
    print(f"Stored {len(chunks)} chunks in ChromaDB")

def search(query, top_k=3):
    collection = get_collection()
    query_embedding = embedding_model.encode([query]).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
    )
    return results