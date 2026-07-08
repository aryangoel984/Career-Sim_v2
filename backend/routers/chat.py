import os
import re
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from groq import AsyncGroq
from models.schemas import ChatRequest
from agents.prompts import get_system_prompt
from auth.verify import verify_token
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

api_key = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=api_key)

CONCISE_SUFFIX = (
    "\n\nIMPORTANT: Keep your reply SHORT and conversational — 2 to 4 sentences max. "
    "No bullet lists, no headers, no lengthy breakdowns unless the user explicitly asks for detail. "
    "Respond like a busy colleague in a Slack message, not a document."
)


def _strip_think(text: str) -> str:
    """Remove all <think>...</think> blocks. If unclosed, take only text before the <think> tag."""
    # Remove complete blocks first
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # If an unclosed <think> remains, drop everything from it onwards
    text = re.sub(r"<think>.*", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Remove any stray </think> tags
    text = re.sub(r"</think>", "", text, flags=re.IGNORECASE)
    return text.strip()


@router.post("/api/chat")
async def chat_endpoint(request: ChatRequest, user_id: str = Depends(verify_token)):
    try:
        system_prompt = get_system_prompt(request.agent_id, request.mission_context)

        api_messages = [{"role": "system", "content": system_prompt + CONCISE_SUFFIX}]
        for msg in request.messages:
            api_messages.append({"role": msg.role, "content": msg.content})

        # Inject /no-think into the last user message — Qwen3 requires it in the user turn
        for i in range(len(api_messages) - 1, -1, -1):
            if api_messages[i]["role"] == "user":
                api_messages[i]["content"] = "/no-think\n" + api_messages[i]["content"]
                break

        print(f"[chat] agent={request.agent_id} | turns={len(request.messages)} | last={request.messages[-1].content[:60]!r}")

        async def event_generator():
            try:
                chat_completion = await client.chat.completions.create(
                    model="qwen/qwen3.6-27b",
                    messages=api_messages,
                    max_tokens=1000,
                    stream=True,
                )
                in_think = False
                buf = ""

                async for chunk in chat_completion:
                    content = chunk.choices[0].delta.content
                    if not content:
                        continue
                    buf += content

                    # Process buffer: skip everything inside <think>...</think> in real time
                    while True:
                        if in_think:
                            end = buf.find("</think>")
                            if end != -1:
                                buf = buf[end + len("</think>"):]
                                in_think = False
                            else:
                                buf = ""  # still inside think block, discard
                                break
                        else:
                            start = buf.find("<think>")
                            if start != -1:
                                if start > 0:
                                    yield buf[:start]  # yield clean text before <think>
                                buf = buf[start + len("<think>"):]
                                in_think = True
                            else:
                                # No <think> found — hold last 7 chars in case tag is split across chunks
                                if len(buf) > 7:
                                    yield buf[:-7]
                                    buf = buf[-7:]
                                break

                # Flush whatever's left
                if buf and not in_think:
                    yield buf

            except Exception as stream_err:
                print(f"[chat] Stream error: {stream_err}")
                yield f"\n[Error: {str(stream_err)}]"

        return StreamingResponse(event_generator(), media_type="text/plain")

    except Exception as e:
        print(f"[chat] Endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
