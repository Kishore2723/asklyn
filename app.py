import os
from flask import Flask, render_template, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)

# Simple in-memory knowledge base
# Each item is a string (a document or chunk)
knowledge_base = [
    "AskLyn is an advanced AI assistant designed to help you with your tasks.",
    "The creator of AskLyn is an expert developer focusing on RAG applications.",
    "RAG stands for Retrieval-Augmented Generation, combining search with LLMs.",
    "You can upload text files to this knowledge base to expand AskLyn's mind."
]

def retrieve_relevant_context(query, top_k=2):
    """
    Simple TF-IDF based retrieval.
    In a production app, use embeddings (e.g., OpenAI, HuggingFace) and a Vector DB (e.g., Pinecone, Chroma).
    """
    if not knowledge_base:
        return []
    
    # Combine query and knowledge base for vectorization
    documents = [query] + knowledge_base
    tfidf = TfidfVectorizer().fit_transform(documents)
    
    # Calculate cosine similarity between query (index 0) and docs (index 1 to N)
    cosine_similarities = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()
    
    # Get top_k indices
    related_docs_indices = cosine_similarities.argsort()[:-top_k-1:-1]
    
    results = []
    for i in related_docs_indices:
        if cosine_similarities[i] > 0.1: # Filter out low relevance
            results.append(knowledge_base[i])
            
    return results

def generate_response(query, context):
    """
    Mock Generation.
    In a real app, send 'query' + 'context' to OpenAI/Gemini API.
    """
    context_str = "\n".join(context) if context else "No specific context found."
    
    # Mock AI Persona
    response = f"**Analysis based on Knowledge Base:**\n\n{context_str}\n\n"
    response += f"**Lyn's Insight:**\n I've processed your query about '{query}'. Based on the data I have, it seems like we are discussing the core capabilities of this system. Is there anything specific about the implementation you'd like to know?"
    
    return response

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    # 1. Retrieve
    context = retrieve_relevant_context(user_message)
    
    # 2. Generate
    bot_response = generate_response(user_message, context)
    
    return jsonify({
        'response': bot_response,
        'context_used': context
    })

@app.route('/upload', methods=['POST'])
def upload():
    # Simple text upload for demo purposes
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        text = file.read().decode('utf-8')
        # Naive chunking by line or just add the whole thing
        knowledge_base.append(text)
        return jsonify({'message': f'File {file.filename} assimilated into Knowledge Base.', 'total_docs': len(knowledge_base)})

if __name__ == '__main__':
    print("AskLyn Server Starting...")
    print("Access via http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
