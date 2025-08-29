from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import os
import re

app = FastAPI()

FULL_NAME = (os.environ.get("FULL_NAME") or "john_doe").lower()
DOB_DDMMYYYY = os.environ.get("DOB_DDMMYYYY") or "17091999"
EMAIL = os.environ.get("EMAIL") or "john@xyz.com"
ROLL = os.environ.get("ROLL") or "ABCD123"

num_re = re.compile(r"^[0-9]+$")
alpha_re = re.compile(r"^[A-Za-z]+$")

def is_numeric_string(s: str) -> bool:
    return isinstance(s, str) and bool(num_re.match(s))

def is_alpha_string(s: str) -> bool:
    return isinstance(s, str) and bool(alpha_re.match(s))

def split_special_characters(tokens):
    specials = []
    for t in tokens:
        if not isinstance(t, str):
            continue
        for ch in t:
            if not ch.isalnum():
                specials.append(ch)
    return specials

def extract_alpha_chars(tokens):
    chars = []
    for t in tokens:
        if not isinstance(t, str):
            continue
        for ch in t:
            if ch.isalpha():
                chars.append(ch)
    return chars

def alternating_caps_from_reversed(chars):
    rev = list(reversed(chars))
    out = []
    for i, ch in enumerate(rev):
        out.append(ch.upper() if i % 2 == 0 else ch.lower())
    return "".join(out)

@app.post("/bfhl")
async def bfhl(request: Request):
    try:
        body = await request.json()
        data = body.get("data")
        if not isinstance(data, list):
            return JSONResponse(
                status_code=200,
                content={
                    "is_success": False,
                    "user_id": f"{FULL_NAME}_{DOB_DDMMYYYY}",
                    "email": EMAIL,
                    "roll_number": ROLL,
                    "message": "Invalid body. Expect { data: [...] }",
                },
            )

        even_numbers = []
        odd_numbers = []
        total = 0

        for item in data:
            if is_numeric_string(item):
                n = int(item)
                (even_numbers if n % 2 == 0 else odd_numbers).append(item)
                total += n

        alphabets = [s.upper() for s in data if is_alpha_string(s)]
        special_characters = split_special_characters(data)
        all_alpha_chars = extract_alpha_chars(data)
        concat_string = alternating_caps_from_reversed(all_alpha_chars)

        return {
            "is_success": True,
            "user_id": f"{FULL_NAME}_{DOB_DDMMYYYY}",
            "email": EMAIL,
            "roll_number": ROLL,
            "odd_numbers": odd_numbers,
            "even_numbers": even_numbers,
            "alphabets": alphabets,
            "special_characters": special_characters,
            "sum": str(total),
            "concat_string": concat_string,
        }
    except Exception:
        return {
            "is_success": False,
            "user_id": f"{FULL_NAME}_{DOB_DDMMYYYY}",
            "email": EMAIL,
            "roll_number": ROLL,
            "message": "An error occurred processing the request.",
        }

@app.get("/")
def root():
    return {"status": "BFHL API up"}
