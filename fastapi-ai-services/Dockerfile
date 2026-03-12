FROM python:3.11-slim
WORKDIR /app

# Install uv for fast dependency resolution
RUN pip install uv

# Copy uv files and project config
COPY pyproject.toml uv.lock ./
RUN uv pip install --system -e .

# Alternatively fallback to requirements.txt if uv install didn't grab everything
COPY requirements.txt .
RUN uv pip install --system -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
