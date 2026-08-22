from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from vector_store import embed_and_store, search
from generation import generate_answer
from ingest import clone_repo, read_repo_files, chunk_text

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class IngestRequest(BaseModel):
    github_url: str


class ChatRequest(BaseModel):
    query: str


@app.post("/ingest")
def ingest(req: IngestRequest):
    clone_repo(req.github_url, "test_repo")
    files = read_repo_files("test_repo")

    all_chunks = []
    for f in files:
        all_chunks.extend(chunk_text(f["content"]))

    embed_and_store(all_chunks)

    return {
        "status": "success",
        "files_found": len(files),
        "chunks_created": len(all_chunks),
    }


@app.post("/chat")
def chat(req: ChatRequest):
    results = search(req.query)
    retrieved_chunks = results["documents"][0]

    answer = generate_answer(req.query, retrieved_chunks)

    return {"answer": answer}


@app.get("/health")
def health():
    return {"status": "ok"}