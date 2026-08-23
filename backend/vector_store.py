import chromadb
from fastembed import TextEmbedding

embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
chroma_client = chromadb.PersistentClient(path="chroma_db")

def get_collection():
    return chroma_client.get_or_create_collection(name="test_collection")

def embed_and_store(chunks):
    collection = get_collection()

    ids = [f"chunk_{i}" for i in range(len(chunks))]
    embeddings = list(embedding_model.embed(chunks))
    embeddings = [e.tolist() for e in embeddings]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
    )
    print(f"Stored {len(chunks)} chunks in ChromaDB")

def search(query, top_k=3):
    collection = get_collection()
    query_embedding = list(embedding_model.embed([query]))[0].tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )
    return results