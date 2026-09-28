import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend folder
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./content_assistant.db")

# LLM Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai").lower()

# OpenAI / Groq / OpenRouter
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", None)

# Ollama (Local LLM fallback)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# General LLM Settings
LLM_TIMEOUT_SECONDS = float(os.getenv("LLM_TIMEOUT_SECONDS", "30.0"))

# CORS
raw_cors = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,*")
CORS_ORIGINS = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]
