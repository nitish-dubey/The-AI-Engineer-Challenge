"use client";
import { useState } from "react";

export default function Home() {
  // State for form fields
  const [developerMessage, setDeveloperMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [model, setModel] = useState("gpt-4.1-mini");
  const [apiKey, setApiKey] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use environment variable for API base URL, fallback to localhost for local dev
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");
    try {
      const res = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developer_message: developerMessage,
          user_message: userMessage,
          model,
          api_key: apiKey,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Unknown error");
      }
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      // Read the streaming response as text
      const reader = res.body!.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        console.log("Received chunk:", chunk);
        setResponse((prev) => prev + chunk);
      }
      console.log("Stream complete");
      setLoading(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 24 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>🤖 AI Engineer Challenge App</h1>
      <p style={{ marginBottom: 24 }}>Send a message to your backend API!</p>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Developer Message:<br />
            <input
              type="text"
              value={developerMessage}
              onChange={e => setDeveloperMessage(e.target.value)}
              required
              style={{ width: "100%", padding: 8, fontSize: 16 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>User Message:<br />
            <input
              type="text"
              value={userMessage}
              onChange={e => setUserMessage(e.target.value)}
              required
              style={{ width: "100%", padding: 8, fontSize: 16 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Model (optional):<br />
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              style={{ width: "100%", padding: 8, fontSize: 16 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>OpenAI API Key:<br />
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              required
              style={{ width: "100%", padding: 8, fontSize: 16 }}
              autoComplete="off"
            />
          </label>
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: "0.5rem", padding: "8px 16px", fontSize: 16 }}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>Error: {error}</div>}
      {response && (
        <div style={{ background: "#f4f4f4", padding: "1rem", borderRadius: 4 }}>
          <strong>Response:</strong>
          <pre style={{ whiteSpace: "pre-wrap" }}>{response}</pre>
        </div>
      )}
    </div>
  );
}
