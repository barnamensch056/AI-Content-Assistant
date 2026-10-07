# AI Content Assistant

A full-stack application that analyzes notes, drafts, or meeting transcripts using an LLM to generate a concise summary and exactly three tags, persists results to SQLite, and displays them in a modern Next.js interface.

---

## Architecture & Questions

### 1. Architecture

1. The user enters text in the Next.js frontend, which performs validation and sends a `POST /api/entries` request.
2. FastAPI validates the request using Pydantic (`TextSubmission`) and formats a structured JSON extraction prompt.
3. The LLM client sends requests to the provider( OpenRouter with inclusionai/ling-3.0-flash-sante:free model) through an OpenAI-compatible API endpoint, with configurable timeouts and retry logic to handle temporary failures and ensure reliable responses.
4. The backend cleans and parses the LLM response, removes Markdown code fences, and validates that it contains a concise summary and exactly three relevant tags in the expected JSON format.
5. The raw text, summary, tags, and timestamp are persisted to the SQLite database via SQLAlchemy (`content_assistant.db`).
6. The created record is returned to the frontend, which updates the state, updates the saved entries list, and displays the detail view along with search results.

### 2. AI Choice

1. Integrated InclusionAI's Ling 3.0 Flash Sante through OpenRouter's OpenAI-compatible SDK, leveraging its efficient inference and free-tier access for AI-powered summarization and tag generation, with backend validation to ensure structured JSON responses containing exactly three tags.
2. The modular client design allows seamless model switching to standard OpenAI, Groq, or local Ollama simply by changing `.env` variables.

### 3. Reliability

1. Configurable client timeouts (`LLM_TIMEOUT_SECONDS=30.0`) intercept slow calls and return a clean HTTP 504 Gateway Timeout.
2. If a provider rejects the `response_format={"type": "json_object"}` parameter, an automatic fallback immediately retries without it.
3. If output is unparseable or fails tag count validation, the backend catches the error and returns an HTTP 502 with an informative error message.

### 4. Privacy

1. Only the user-submitted text block and the system extraction prompt are transmitted over TLS/HTTPS to the external LLM provider.
2. In a financial-services environment, customer PII (names, Social Security numbers, addresses, phone numbers) must be encrypted before transmission.
3. Sensitive financial data—such as account balances, credit card numbers, confidential earnings drafts, and proprietary trade algorithms—must be kept within private on-premise or VPC-hosted models (e.g., local Ollama or dedicated enterprise endpoints).

### 5. Production Next Steps

- **Database & Migrations**: Migrate from SQLite to PostgreSQL with Alembic migrations and connection pooling to efficiently handle concurrent requests across multiple tenants.
- **Asynchronous Processing**: Move LLM processing to Celery background workers using Redis as the message broker, and use WebSockets to notify users when processing is complete, avoiding long-running HTTP requests.
- **Authentication & Rate Limiting**: Introduce JWT user authentication with tenant-scoped entries and Redis-based rate limiting to prevent API exhaustion.

### 6. AI Coding Tools

1. Used AI coding assistants (Antigravity with Claude & Gemini) schema design, and responsive Tailwind UI styling.
2. Outputs were validated using an automated `pytest` test suite that verifies non-AI logic, validation edge cases, and mocked LLM failure scenarios.

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** & **npm**

---

## 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Configure your model and provider:

   ```ini
   DATABASE_URL=sqlite:///./content_assistant.db
   LLM_PROVIDER=openai
   OPENAI_API_KEY=your_api_key_here
   OPENAI_BASE_URL=https://openrouter.ai/api/v1
   OPENAI_MODEL=google/gemini-2.0-flash-exp:free
   ```

5. Start the backend server:

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   - API Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/api/health

6. Run automated tests:
   ```bash
   pytest -v
   ```

---

## 2. Frontend Setup (Next.js)

1. Open a second terminal and navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Next.js development server:

   ```bash
   npm run dev
   ```

   - Web UI: http://localhost:3000

---

## Project Structure

```text
ai-content-assistant/
├── backend/
│   ├── app/               # FastAPI routes, LLM service, SQLite models & schemas
│   ├── tests/             # Automated test suite (pytest)
│   ├── requirements.txt   # Backend dependencies
│   └── .env.example       # Environment template
├── frontend/
│   ├── app/               # Next.js pages & layout
│   ├── components/        # InputForm, EntryList, EntryDetailModal, Header, ErrorAlert
│   ├── lib/               # API client & TypeScript interfaces
│   └── package.json       # Frontend dependencies
└── README.md
```

---

## Architectural Possibilities & Future Extensions

Given extended project scope beyond the initial rapid prototype, several high-value capabilities could be integrated:

- **Cloud Deployment & DevOps**: Containerize both services with Docker/Docker Compose, define Helm charts for Kubernetes deployments, and automate CI/CD delivery pipelines with GitHub Actions and Terraform (IaC).
- **Authentication & Multi-Tenancy**: Add OAuth2/JWT authentication, social sign-ins, and role-based access control (RBAC) to support isolated user workspaces and team collaboration.
- **Vector Search & Advanced RAG**: Integrate a vector database (e.g., pgvector, Qdrant) to enable semantic search across historical entries, hybrid keyword/embedding retrieval, and contextual RAG pipelines.
- **Agentic Multi-Step Orchestration**: Implement multi-step agent verification (e.g., using LangGraph or LlamaIndex) where a secondary reviewer agent critiques and refines summaries and tags for consistency.
- **Observability & Analytics**: Integrate OpenTelemetry instrumentation, Prometheus metrics, and Grafana dashboards to track LLM latency, token expenditure, and error rates in real time.
- **Comprehensive Testing Suite**: Extend test coverage with end-to-end Playwright tests, automated load testing via Locust, and automated LLM output quality benchmarks (e.g., DeepEval).

- - **Automated LLM Evals & Quality Guardrails**: Implement an evaluation pipeline using frameworks like DeepEval, Ragas, or Promptfoo to systematically benchmark prompt versions and model migrations. This would track:
  - _Faithfulness & Hallucination Prevention_ (ensuring summary claims are strictly grounded in the source text),
  - _Summary Quality & Conciseness_ (measuring information density and relevance),
  - _Tag Relevance & Granularity_ (evaluating semantic alignment and preventing generic or repetitive tags),
  - _Deterministic Schema Adherence_ (continuous regression testing to guarantee exactly 3 valid tags across providers).

---
