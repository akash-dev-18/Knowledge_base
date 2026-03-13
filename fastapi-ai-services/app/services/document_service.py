import PyPDF2
import io
from app.services.vector_service import store_chunks, delete_document_chunks
import logging
import traceback


logger=logging.getLogger(__name__)
def extract_text_from_pdf(file_bytes: bytes) -> str:
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
    return text


def extract_text_from_txt(file_bytes: bytes) -> str:
    return file_bytes.decode("utf-8")


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start = end - overlap

    return chunks


def process_document(file_bytes: bytes, filename: str, document_id: str):
    
    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
    elif filename.endswith(".txt"):
        text = extract_text_from_txt(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {filename}")

    if not text.strip():
        raise ValueError("Document is empty or could not be extracted")

    chunks = chunk_text(text)

    if not chunks:
        raise ValueError("No chunks generated from document")

    store_chunks(chunks, document_id)

    return {
        "document_id": document_id,
        "chunks_count": len(chunks),
        "total_chars": len(text),
    }



def delete_document(document_id: str):
    delete_document_chunks(document_id)
