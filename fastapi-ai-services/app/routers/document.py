from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.services.document_service import process_document, delete_document

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/{document_id}")
async def upload_and_process(document_id: str, file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()

        result = await run_in_threadpool(
            process_document, file_bytes, file.filename, document_id
        )
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{document_id}")
async def delete(document_id: str):
    try:

        await run_in_threadpool(delete_document, document_id)

        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
