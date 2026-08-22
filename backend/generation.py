import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_answer(query, retrieved_chunks):
    context = "\n\n---\n\n".join(retrieved_chunks)

    prompt = f"""Answer the question based only on the context below.
If the answer isn't in the context, say you don't know.

Context:
{context}

Question: {query}

Answer:"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    return response.choices[0].message.content