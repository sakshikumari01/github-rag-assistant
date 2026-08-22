import { useState } from "react";

function App() {
  const [githubUrl, setGithubUrl] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState("");
  const [ingestDone, setIngestDone] = useState(false);

  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleIngest = async () => {
    if (!githubUrl.trim()) return;
    setIngesting(true);
    setIngestStatus("");
    setIngestDone(false);
    try {
      const res = await fetch("http://127.0.0.1:8000/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_url: githubUrl }),
      });
      const data = await res.json();
      setIngestStatus(`✅ Indexed ${data.files_found} files → ${data.chunks_created} chunks`);
      setIngestDone(true);
    } catch (err) {
      setIngestStatus("❌ Error: " + err.message);
    }
    setIngesting(false);
  };

  const handleChat = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query }),
      });
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      setAnswer("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🔍 GitHub RAG Assistant</h1>
          <p style={styles.subtitle}>Ask questions about any GitHub repository, instantly.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.stepLabel}>STEP 1</div>
          <h3 style={styles.stepTitle}>Add a repository</h3>
          <div style={styles.row}>
            <input
              type="text"
              placeholder="https://github.com/user/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={handleIngest}
              disabled={ingesting}
              style={{ ...styles.button, ...(ingesting ? styles.buttonDisabled : {}) }}
            >
              {ingesting ? "Indexing..." : "Ingest Repo"}
            </button>
          </div>
          {ingestStatus && (
            <p style={{ ...styles.status, color: ingestDone ? "#4ade80" : "#f87171" }}>
              {ingestStatus}
            </p>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.stepLabel}>STEP 2</div>
          <h3 style={styles.stepTitle}>Ask a question</h3>
          <div style={styles.row}>
            <input
              type="text"
              placeholder="e.g. How does authentication work?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={handleChat}
              disabled={loading}
              style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
            >
              {loading ? "Thinking..." : "Ask"}
            </button>
          </div>

          {loading && <p style={styles.loadingText}>⏳ Retrieving relevant code and generating answer...</p>}

          {answer && !loading && (
            <div style={styles.answerBox}>
              <div style={styles.answerLabel}>ANSWER</div>
              <div style={styles.answerText}>{answer}</div>
            </div>
          )}
        </div>

        <p style={styles.footer}>Built with FastAPI · ChromaDB · Groq · React</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  container: {
    maxWidth: "720px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "36px",
  },
  title: {
    fontSize: "36px",
    color: "#f8fafc",
    margin: "0 0 8px 0",
    fontWeight: "700",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "15px",
    margin: 0,
  },
  card: {
    background: "#1e293b",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    border: "1px solid #334155",
  },
  stepLabel: {
    color: "#818cf8",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "4px",
  },
  stepTitle: {
    color: "#f1f5f9",
    fontSize: "18px",
    margin: "0 0 16px 0",
  },
  row: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #475569",
    background: "#0f172a",
    color: "#f1f5f9",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  buttonDisabled: {
    background: "#475569",
    cursor: "not-allowed",
  },
  status: {
    marginTop: "12px",
    fontSize: "13px",
  },
  loadingText: {
    marginTop: "14px",
    color: "#94a3b8",
    fontSize: "13px",
  },
  answerBox: {
    marginTop: "18px",
    background: "#0f172a",
    borderRadius: "10px",
    padding: "18px",
    border: "1px solid #334155",
  },
  answerLabel: {
    color: "#818cf8",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "8px",
  },
  answerText: {
    color: "#e2e8f0",
    fontSize: "14px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  footer: {
    textAlign: "center",
    color: "#475569",
    fontSize: "12px",
    marginTop: "30px",
  },
};

export default App;