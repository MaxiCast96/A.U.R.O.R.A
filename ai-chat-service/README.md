# AI Chat Service (FastAPI)

Servicio Python FastAPI para chat de IA de la óptica (AURORA), conectado a un modelo LLM vía API key.

## Requisitos
- Python 3.10+
- Una API Key de OpenAI (`OPENAI_API_KEY`)

## Instalación
```bash
# 1) Crear y activar entorno virtual (opcional pero recomendado)
python -m venv .venv
# Windows PowerShell
. .venv/Scripts/Activate.ps1

# 2) Instalar dependencias
pip install -r requirements.txt

# 3) Configurar variables de entorno
copy .env.example .env
# Edita .env y coloca tu OPENAI_API_KEY

# 4) Ejecutar en local
python main.py
# Servirá en http://localhost:8000
```

## Variables de entorno (.env)
- OPENAI_API_KEY=tu_key
- OPENAI_MODEL=gpt-4o-mini (opcional)
- ALLOWED_ORIGINS=http://localhost:5173,https://maxicast96.github.io (dominios permitidos)
- PORT=8000

## Endpoints
- GET `/health` -> { status: "ok" }
- POST `/chat`
  - body JSON:
    ```json
    {
      "messages": [
        {"role": "user", "content": "Hola"}
      ],
      "temperature": 0.3,
      "max_tokens": 512
    }
    ```
  - respuesta:
    ```json
    { "reply": "..." }
    ```

## Notas
- El servicio añade un mensaje `system` con instrucciones de dominio para óptica.
- Asegúrate de incluir el dominio del frontend en `ALLOWED_ORIGINS` para evitar errores CORS.
