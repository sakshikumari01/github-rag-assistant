from git import Repo
import os
from vector_store import embed_and_store, search
from generation import generate_answer

def clone_repo(github_url, target_path):
    if os.path.exists(target_path):
        print("Already cloned, skipping...")
        return
    Repo.clone_from(github_url, target_path)
    print("Cloned successfully!")

def read_repo_files(repo_path):
    allowed_extensions = {".py", ".js", ".md", ".txt"}
    files_data = []
    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if any(file.endswith(ext) for ext in allowed_extensions):
                full_path = os.path.join(root, file)
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                files_data.append({"file_path": full_path, "content": content})
    return files_data

def chunk_text(text, chunk_size=500, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

if __name__ == "__main__":
    test_url = "https://github.com/prakhar1989/awesome-courses"
    clone_repo(test_url, "test_repo")

    files = read_repo_files("test_repo")
    all_chunks = []
    for f in files:
        all_chunks.extend(chunk_text(f["content"]))

    print(f"Total chunks: {len(all_chunks)}")

    embed_and_store(all_chunks)

    query = "what topics or courses are covered in this list"
    results = search(query)
    retrieved_chunks = results["documents"][0]

    print(f"\nQuery: {query}")
    answer = generate_answer(query, retrieved_chunks)
    print("\n=== LLM Answer ===")
    print(answer)