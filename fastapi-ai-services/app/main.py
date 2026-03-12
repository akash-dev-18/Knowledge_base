from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Adjust these imports based on where you actually saved your router files
from app.routers.chat import router as chat_router
from app.routers.document import router as document_router
from app.core.config import settings

app = FastAPI(
    title="Document RAG API",
    description="An asynchronous API for document processing and intelligent chat.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(document_router)
app.include_router(chat_router)


@app.get("/", tags=["health"])
async def root():
    return {
        "status": "online",
        "message": "Welcome to the Document RAG API",
        "model": settings.LLM_MODEL,
    }


@app.get("/health", tags=["health"])
async def health_check():

    return {"status": "healthy"}
