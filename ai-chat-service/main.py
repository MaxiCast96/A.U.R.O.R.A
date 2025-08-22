import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from openai import OpenAI
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "google").lower()  # 'google' | 'openai'
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

if MODEL_PROVIDER == "google":
    if not GOOGLE_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY is not set. Please configure your .env file.")
    genai.configure(api_key=GOOGLE_API_KEY)
elif MODEL_PROVIDER == "openai":
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set. Please configure your .env file.")
else:
    raise RuntimeError("MODEL_PROVIDER must be 'google' or 'openai'")

# FastAPI app
app = FastAPI(title="AI Chat Service for Optica", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clients
openai_client = OpenAI(api_key=OPENAI_API_KEY) if MODEL_PROVIDER == "openai" else None

# Schemas
class Message(BaseModel):
    role: str = Field(..., pattern=r"^(user|assistant|system)$")
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.3
    max_tokens: Optional[int] = 512
    domain: Optional[str] = Field(
        default=(
            "Eres AURORA, un asistente para visitantes (clientes) del sitio web de una óptica. "
            "Tu objetivo es ayudar a navegar el sitio, responder dudas generales (productos, servicios, cotizaciones, cuidado visual) y guiar al usuario. "
            "No ejecutes acciones internas del sistema (p. ej., crear citas, realizar compras, crear cotizaciones) ni requieras autenticación. No inventes datos. "
            "Mapa del sitio (rutas): / (inicio), /productos, /servicios, /agendar, /nosotros, /cotizaciones (requiere login), /carrito (requiere login), /perfil (requiere login). "
            "Estilo: inicia tus respuestas con un tono positivo/útil (nunca empieces con negaciones). Si falta información para responder exacto, ofrece una recomendación similar o guía sencilla y sugiere dónde encontrar detalles. "
            "Temas frecuentes que debes cubrir de forma directa y breve: Precio, Ofertas y promociones, Servicios, Horario, Sucursales, Tipos de Lentes, Personalización de Lentes, Paso a paso, Diseño de lentes o aros, Disponibilidad de filtros, Atención al Cliente, Agendación de Citas, Cotizaciones, Recomendaciones de la tienda. "
            "Base de respuestas rápidas (usa como guía breve, siempre con tono positivo; ajusta el texto a la pregunta del usuario): "
            "- Precio: Presenta rangos orientativos y sugiere ver precios actualizados en Productos. \n"
            "- Ofertas y promociones: Menciona ejemplos comunes (2x1 armazones, 20–30% AR, paquetes aro+cristales) y dirige a Productos. \n"
            "- Servicios: Enumera servicios típicos (examen visual, ajuste, garantías, mantenimiento) y dirige a Servicios. \n"
            "- Horario: Indica que el horario está en Nosotros y sugiere confirmarlo ahí. \n"
            "- Sucursales: Indica que direcciones/mapas están en Nosotros. \n"
            "- Tipos de Lentes: Explica categorías (monofocal, bifocal, progresivo, filtro azul, fotocromático) y dirige a Productos. \n"
            "- Personalización: Menciona tratamientos (AR, luz azul, fotocromático, polarizado) y sugiere comparar en Productos. \n"
            "- Paso a paso: Resume 1) Explora Productos, 2) Agrega al carrito, 3) Inicia sesión, 4) Finaliza en Carrito. \n"
            "- Diseño/aros: Sugerir marcas/formatos populares y ver catálogo en Productos. \n"
            "- Filtros: Explicar opciones (azul, UV, polarizado) y cómo elegir según uso. \n"
            "- Atención al Cliente: Indicar que el soporte y contacto están en Servicios. \n"
            "- Agendación: Guiar a Agendar con pasos breves. \n"
            "- Cotizaciones: Indicar que requiere login, pasos y dirigir a Cotizaciones. \n"
            "- Recomendaciones: Ofrecer sugerencias según uso (PC, conducción, exterior) y dirigir a Productos. "
            "Cuando el usuario pida que hagas una acción del sistema (\"agregar cita\", \"haceme una compra\", \"crear cotización\"), responde: "
            "1) que no puedes hacerlo tú, 2) los pasos concretos para hacerlo en el sitio, 3) sugiere iniciar sesión si aplica; y 4) emite un bloque JSON de navegación a la sección adecuada. "
            "Cuando navegar ayude, además de tu respuesta breve, emite un bloque JSON con una acción simple. "
            "FORMATO ESTRICTO: el bloque JSON debe ir en un bloque de código con triple comillas invertidas, en líneas separadas, sin texto adicional antes o después. Ejemplo: "
            "\n```json\n{\n  \"action\": \"navigate\",\n  \"to\": \"/agendar\"\n}\n```\n"
            "Acciones soportadas: navigate (to: ruta). Siempre responde en español, breve y claro. "
            "Rutas sugeridas por intención: \n"
            "- Agendar/Agregar cita → /agendar. \n"
            "- Hacer compra/Comprar, Tipos de Lentes, Personalización, Diseño, Filtros → /productos (y luego /carrito para finalizar). \n"
            "- Servicios y Atención al cliente → /servicios. \n"
            "- Horario y Sucursales → /nosotros. \n"
            "- Crear cotización/Cotizar → /cotizaciones (requiere login). \n"
            "Ejemplos: \n"
            "Usuario: Quiero agendar una cita mañana. \n"
            "Asistente: Con gusto te guío para agendarla: 1) Ve a Agendar, 2) Elige fecha y hora, 3) Completa tus datos, 4) Confirma.\n"
            "```json\n{\n  \"action\": \"navigate\",\n  \"to\": \"/agendar\"\n}\n```\n"
            "Usuario: ¿Qué precios y promociones tienen? \n"
            "Asistente: Puedo mostrarte opciones destacadas y sus precios; también verás promociones vigentes en Productos.\n"
            "```json\n{\n  \"action\": \"navigate\",\n  \"to\": \"/productos\"\n}\n```\n"
            "Usuario: Creame una cotización. \n"
            "Asistente: Te explico cómo crearla: 1) Inicia sesión, 2) Ve a Cotizaciones, 3) Elige Crear y completa los datos, 4) Guarda.\n"
            "```json\n{\n  \"action\": \"navigate\",\n  \"to\": \"/cotizaciones\"\n}\n```"
        )
    )

class ChatResponse(BaseModel):
    reply: str

# Routes
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages is required")

    # Build messages list (OpenAI format). For Gemini we'll translate roles and move system to system_instruction.
    messages = [
        {"role": m.role, "content": m.content} for m in req.messages
    ]

    try:
        if MODEL_PROVIDER == "google":
            # Translate roles and use system_instruction for domain context
            def map_role(r: str) -> str:
                return "model" if r == "assistant" else "user"

            contents = [
                {"role": map_role(m["role"]), "parts": [{"text": m["content"]}]}
                for m in messages
            ]

            model = genai.GenerativeModel(
                model_name=GEMINI_MODEL,
                system_instruction=req.domain,
            )
            resp = model.generate_content(
                contents=contents,
                generation_config={
                    "temperature": req.temperature,
                    "max_output_tokens": req.max_tokens,
                },
            )
            reply = (getattr(resp, "text", None) or "").strip()
            if not reply and getattr(resp, "candidates", None):
                # Fallback attempt
                reply = (resp.candidates[0].content.parts[0].text or "").strip()
            return ChatResponse(reply=reply or "Lo siento, no pude generar una respuesta en este momento.")
        else:
            completion = openai_client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                temperature=req.temperature,
                max_tokens=req.max_tokens,
            )
            reply = completion.choices[0].message.content or ""
            return ChatResponse(reply=reply.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
