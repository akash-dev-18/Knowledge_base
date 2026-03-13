import json
import logging
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.services.vector_service import search_chunks
from app.core.config import settings
from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import AsyncGenerator

logger = logging.getLogger(__name__)


_memory_store: dict[str, list] = {}
redis_client = None

try:
    import redis

    _rc = redis.from_url(settings.REDIS_URL,decode_responses=True)
    _rc.ping()  
    redis_client = _rc
    logger.info("Connected to Redis for chat history")
except Exception:
    logger.warning("Redis unavailable – using in-memory chat history (not persistent)")


# llm = ChatOpenAI(
#    openai_api_key=settings.OPENROUTER_API_KEY,
#    openai_api_base=settings.OPENROUTER_BASE_URL,
#    model_name=settings.LLM_MODEL,
#     temperature=0.7,
# )

# llm = ChatOllama(
#      model=settings.LLM_MODEL,          
#      base_url=settings.OLLAMA_BASE_URL,  
#      temperature=0.7,
# )

llm=ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0.7,
)
    


class KeyPointsResponse(BaseModel):
    points: list[str] = Field(
        description="List of the most important key points extracted from the document"
    )


class QAPair(BaseModel):
    question: str = Field(
        description="An important question based on the document facts"
    )
    answer: str = Field(
        description="The accurate answer to the question based only on the context"
    )


class QAResponse(BaseModel):
    qa_pairs: list[QAPair] = Field(
        description="List of exactly 5 generated questions and answers"
    )


def get_chat_history(session_id: str) -> list:
    key = f"chat:{session_id}"
    if redis_client:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
        return []
    return _memory_store.get(key, [])


def save_chat_history(session_id: str, history: list):
    key = f"chat:{session_id}"
    if redis_client:
        redis_client.setex(key, 3600, json.dumps(history))
    else:
        _memory_store[key] = history


def clear_chat_history(session_id: str):
    key = f"chat:{session_id}"
    if redis_client:
        redis_client.delete(key)
    else:
        _memory_store.pop(key, None)


def chat_with_document(question: str, document_id: str, session_id: str) -> str:
    chunks = search_chunks(question, document_id)

    if not chunks:
        return "I could not find any relevant information regarding this question in the document."

    context = "\n\n".join(chunks)
    history = get_chat_history(session_id)

    messages = [
        SystemMessage(
            content=f"""You are a helpful assistant that answers questions based on the provided document context.
        
Context from document:
{context}

Instructions:
- Answer only based on the context provided
- If answer is not in context, say so clearly
- Be concise and accurate"""
        )
    ]

    for msg in history:
        if msg["role"] == "human":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(content=question))

    response = llm.invoke(messages)
    answer = response.content

    history.append({"role": "human", "content": question})
    history.append({"role": "ai", "content": answer})
    save_chat_history(session_id, history)

    return answer




async def chat_with_document_stream(
    question: str,
    document_id: str,
    session_id: str
) -> AsyncGenerator[str, None]:
    
    chunks = search_chunks(question, document_id)

    if not chunks:
        yield "I could not find any relevant information regarding this question in the document."
        return

    context = "\n\n".join(chunks)
    history = get_chat_history(session_id)

    messages = [
        SystemMessage(content=f"""You are a helpful assistant that answers questions based on the provided document context.

Context from document:
{context}

Instructions:
- Answer only based on the context provided
- If answer is not in context, say so clearly
- Be concise and accurate""")
    ]

    for msg in history:
        if msg["role"] == "human":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(content=question))

    full_answer = ""

    async for chunk in llm.astream(messages):
        token = chunk.content
        if token:
            full_answer += token
            yield token

    # history save karo
    history.append({"role": "human", "content": question})
    history.append({"role": "ai", "content": full_answer})
    save_chat_history(session_id, history)


def summarize_document(document_id: str) -> str:

    chunks = search_chunks("summarize main topics", document_id, top_k=10)

    if not chunks:
        return "Document content not found."

    context = "\n\n".join(chunks)

    messages = [
        SystemMessage(content="You are a helpful assistant that summarizes documents."),
        HumanMessage(
            content=f"""Please provide a comprehensive summary of the following document content:

{context}

Include:
- Main topics
- Key points
- Important findings or conclusions"""
        ),
    ]

    response = llm.invoke(messages)
    return response.content


def extract_key_points(document_id: str) -> list[str]:
    chunks = search_chunks("key points important information", document_id, top_k=10)

    if not chunks:
        return []

    context = "\n\n".join(chunks)

    messages = [
        SystemMessage(
            content="You are a helpful assistant that extracts key points from documents."
        ),
        HumanMessage(
            content=f"Extract the most important key points from this document:\n\n{context}"
        ),
    ]

    structured_llm = llm.with_structured_output(KeyPointsResponse)
    response = structured_llm.invoke(messages)

    return response.points


def generate_questions(document_id: str) -> list[dict]:
    chunks = search_chunks("important concepts facts", document_id, top_k=10)

    if not chunks:
        return []

    context = "\n\n".join(chunks)

    messages = [
        SystemMessage(
            content="You are a helpful assistant that generates educational questions from documents."
        ),
        HumanMessage(
            content=f"Generate 5 important questions and answers from this document:\n\n{context}"
        ),
    ]

    structured_llm = llm.with_structured_output(QAResponse)
    response = structured_llm.invoke(messages)

    return [{"question": qa.question, "answer": qa.answer} for qa in response.qa_pairs]
