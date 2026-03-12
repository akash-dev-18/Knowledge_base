from pydantic_settings import SettingsConfigDict, BaseSettings


class Settings(BaseSettings):
    OPENROUTER_API_KEY: str
    OPENROUTER_BASE_URL: str
    LLM_MODEL: str

    OLLAMA_BASE_URL: str


    QDRANT_URL: str
    QDRANT_API_KEY: str
    QDRANT_COLLECTION: str = "documents"

    REDIS_URL: str = "redis://localhost:6379"

    SPRING_BOOT_URL: str = "http://localhost:8080"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
