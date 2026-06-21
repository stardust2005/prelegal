# Proyecto Prelegal

## Descripción general

Este es un producto SaaS que permite a los usuarios redactar contratos legales a partir de plantillas disponibles en el la carpeta Templates.

El usuario puede utilizar un chat con IA para definir el tipo de documento que necesita y cómo completar los campos.

Los documentos disponibles se encuentran en el archivo catalog.json, ubicado en la raíz del proyecto, incluido aquí:

@catalog.json   

La implementación actual soporta únicamente el documento Mutual NDA. El frontend tiene una pantalla de login falsa (sin autenticación real) que da paso al generador de NDA.

## Proceso de desarrollo

Cuando se te indique que cree una funcionalidad:
1. Utilice tus herramientas de Atlassian para leer las instrucciones de la funcionalidad en Jira.
2. Desarrolla la funcionalidad; no omita ningún paso del proceso de desarrollo de funcionalidades de 7 pasos.
3. Prueba exhaustivamente la funcionalidad con pruebas unitarias y de integración, y corrige cualquier problema.
4. Envía una pull request (PR) utilizando tus herramientas de GitHub.

## Diseño de IA

Al escribir código para realizar llamadas a LLM, utiliza tu habilidad de Cerebras para usar LiteLLM a través de OpenRouter con el modelo `openrouter/openai/gpt-oss-120b:free`, con Cerebras como proveedor de inferencia. Debes usar salidas estructuradas para poder interpretar los resultados y completar los campos del documento legal.

Existe una clave API de OpenRouter (OPENROUTER_API_KEY) en el archivo `.env` en la raíz del proyecto.

## Diseño técnico

Todo el proyecto debe empaquetarse en un contenedor Docker. El backend debe estar en `backend/` y ser un proyecto uv, utilizando FastAPI.
El frontend debe estar en `frontend/`.
La base de datos debe usar SQLite y crearse desde cero cada vez que se inicie el contenedor Docker, permitiendo una tabla de usuarios con registro e inicio de sesión.
Considera compilar estáticamente el frontend y servirlo a través de FastAPI, si es viable. Debe haber scripts en la carpeta scripts/ para:
```bash
# Mac
scripts/start-mac.sh # Iniciar
scripts/stop-mac.sh # Detener
# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend disponible en http://localhost:8000

## Esquema de colores
- Amarillo de acento: `#ecad0a`
- Azul principal: `#209dd7`
- Morado secundario: `#753991` (botones de envío)
- Azul marino oscuro: `#032147` (encabezados)
- Gris para texto: `#888888`

## Estado actual (PL-5)

Ya implementado:
- Backend FastAPI/uv en `backend/`, con tabla `users` en SQLite recreada en cada arranque (solo esquema; sin endpoints de registro/login todavía).
- Contenedor Docker único (`Dockerfile`, `docker-compose.yml`) que compila el export estático del frontend (`output: "export"` en `next.config.ts`) y lo sirve junto con la API desde FastAPI en el puerto 8000.
- Scripts multiplataforma en `scripts/` (start/stop para mac, linux y windows).
- Pantalla de login falsa en `/` (sin verificación real) que navega a `/app`, donde vive el generador de NDA (movido desde `/`).
- Chat de IA (`POST /api/chat` en `backend/app/chat.py`, componente `NdaChat` en frontend) que sustituye al formulario plano: la IA conversa en español, pregunta por los 12 campos del Mutual NDA y los va rellenando con salida estructurada (LiteLLM/OpenRouter/Cerebras). El backend es sin estado; el frontend reenvía el historial completo en cada turno. El botón de descarga del PDF solo se habilita cuando los 12 campos están completos.

Pendiente: endpoints reales de registro/inicio de sesión, chat con IA para seleccionar el tipo de documento (de entre el catálogo), y soporte para el resto de documentos del catálogo.
