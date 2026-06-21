# Proyecto Prelegal

## Descripción general

Este es un producto SaaS que permite a los usuarios redactar contratos legales a partir de plantillas disponibles en el la carpeta Templates.

El usuario puede utilizar un chat con IA para definir el tipo de documento que necesita y cómo completar los campos.

Los documentos disponibles se encuentran en el archivo catalog.json, ubicado en la raíz del proyecto, incluido aquí:

@catalog.json   

La implementación actual es un prototipo solo de front-end que soporta únicamente el documento Mutual NDA.

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
