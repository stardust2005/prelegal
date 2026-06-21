FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim
WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --locked --no-dev
COPY backend/app ./app
COPY --from=frontend-build /frontend/out ./static
COPY Templates ./Templates
COPY catalog.json ./catalog.json
ENV TEMPLATES_DIR=/app/Templates
ENV CATALOG_PATH=/app/catalog.json

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
