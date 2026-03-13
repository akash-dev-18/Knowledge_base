from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    FilterSelector,
    PayloadSchemaType,
)
from langchain_openai import OpenAIEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.core.config import settings
import uuid

client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)

#  embeddings = OpenAIEmbeddings(
#      openai_api_key=settings.OPENROUTER_API_KEY,
#    openai_api_base=settings.OPENROUTER_BASE_URL,
#      model="openai/text-embedding-3-small",
#  )

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=settings.GOOGLE_API_KEY
)


def ensure_collection():
    if not client.collection_exists(settings.QDRANT_COLLECTION):
        client.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=VectorParams(size=3072, distance=Distance.COSINE),
        )
        client.create_payload_index(
            collection_name=settings.QDRANT_COLLECTION,
            field_name="document_id",
            field_schema=PayloadSchemaType.KEYWORD,
        )


def store_chunks(chunks: list[str], document_id: str):
    ensure_collection()

    vectors = embeddings.embed_documents(chunks)

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={"document_id": document_id, "text": chunk},
        )
        for chunk, vector in zip(chunks, vectors)
    ]

    client.upsert(collection_name=settings.QDRANT_COLLECTION, points=points, wait=True)


def search_chunks(query: str, document_id: str, top_k: int = 5) -> list[str]:
    query_vector = embeddings.embed_query(query)

    results = client.query_points(
        collection_name=settings.QDRANT_COLLECTION,
        query=query_vector,
        limit=top_k,
        query_filter=Filter(
            must=[
                FieldCondition(key="document_id", match=MatchValue(value=document_id))
            ]
        ),
    )

    return [r.payload["text"] for r in results.points]


def delete_document_chunks(document_id: str):
    client.delete(
        collection_name=settings.QDRANT_COLLECTION,
        points_selector=FilterSelector(
            filter=Filter(
                must=[
                    FieldCondition(
                        key="document_id", match=MatchValue(value=document_id)
                    )
                ]
            )
        ),
        wait=True,
    )
