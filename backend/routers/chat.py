import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from groq import AsyncGroq
from models.schemas import ChatRequest
from agents.prompts import get_system_prompt
from auth.verify import verify_token
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

# Initialize AsyncGroq client
api_key = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=api_key)

@router.post("/api/chat")
async def chat_endpoint(request: ChatRequest, user_id: str = Depends(verify_token)):
    try:
        # Generate the custom system prompt for the specified colleague
        system_prompt = get_system_prompt(request.agent_id, request.mission_context)

        # Build the complete messages array for the LLM
        api_messages = [{"role": "system", "content": system_prompt}]
        for msg in request.messages:
            api_messages.append({"role": msg.role, "content": msg.content})

        print(f"[chat] agent={request.agent_id} | turns={len(request.messages)} | last={request.messages[-1].content[:60]!r}")

        async def event_generator():
            try:
                chat_completion = await client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=api_messages,
                    max_tokens=1000,
                    stream=True,
                )
                async for chunk in chat_completion:
                    content = chunk.choices[0].delta.content
                    if content is not None:
                        yield content
            except Exception as stream_err:
                print(f"[chat] Stream error: {stream_err}")
                yield f"\n[Error: {str(stream_err)}]"

        return StreamingResponse(event_generator(), media_type="text/plain")

    except Exception as e:
        print(f"[chat] Endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
