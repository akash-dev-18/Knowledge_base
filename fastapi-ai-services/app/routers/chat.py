from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.chat_service import (
    chat_with_document,
    summarize_document,
    extract_key_points,
    generate_questions,
    clear_chat_history,
    chat_with_document_stream
)

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    question: str
    document_id: str
    session_id: str


class SummaryRequest(BaseModel):
    document_id: str


class KeyPointsRequest(BaseModel):
    document_id: str


class QuestionsRequest(BaseModel):
    document_id: str


from fastapi.responses import StreamingResponse

class StreamChatRequest(BaseModel):
    question: str
    document_id: str
    session_id: str

@router.post("/stream")
async def stream_chat(request: StreamChatRequest):
    try:
        async def generate():
            async for token in chat_with_document_stream(
                request.question,
                request.document_id,
                request.session_id
            ):
                yield f"data: {token}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def chat(request: ChatRequest):
    try:
        answer = chat_with_document(
            request.question, request.document_id, request.session_id
        )
        return {
            "question": request.question,
            "answer": answer,
            "session_id": request.session_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summary")
async def summary(request: SummaryRequest):
    try:
        result = summarize_document(request.document_id)
        return {"document_id": request.document_id, "summary": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/key-points")
async def key_points(request: KeyPointsRequest):
    try:
        points = extract_key_points(request.document_id)
        return {"document_id": request.document_id, "key_points": points}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-questions")
async def questions(request: QuestionsRequest):
    try:
        qa_list = generate_questions(request.document_id)
        return {"document_id": request.document_id, "questions": qa_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history/{session_id}")
async def clear_history(session_id: str):
    try:
        clear_chat_history(session_id)
        return {"message": "Chat history cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
