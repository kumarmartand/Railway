import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const FULL_NAME = (process.env.FULL_NAME || "john_doe").toLowerCase();
const DOB_DDMMYYYY = process.env.DOB_DDMMYYYY || "17091999";
const EMAIL = process.env.EMAIL || "john@xyz.com";
const ROLL = process.env.ROLL || "ABCD123";

const isNumericString = (s) => typeof s === "string" && /^[0-9]+$/.test(s);
const isAlphabeticString = (s) => typeof s === "string" && /^[A-Za-z]+$/.test(s);

function splitSpecialCharacters(tokens) {
  const specials = [];
  for (const t of tokens) {
    if (typeof t !== "string") continue;
    for (const ch of t) {
      if (!/[A-Za-z0-9]/.test(ch)) specials.push(ch);
    }
  }
  return specials;
}

function extractAlphabetChars(tokens) {
  const chars = [];
  for (const t of tokens) {
    if (typeof t !== "string") continue;
    for (const ch of t) {
      if (/[A-Za-z]/.test(ch)) chars.push(ch);
    }
  }
  return chars;
}

function alternatingCapsFromReversed(chars) {
  const rev = [...chars].reverse();
  return rev.map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase())).join("");
}

app.post("/bfhl", (req, res) => {
  try {
    const data = req.body?.data;
    if (!Array.isArray(data)) {
      return res.status(200).json({
        is_success: false,
        user_id: `${FULL_NAME}_${DOB_DDMMYYYY}`,
        email: EMAIL,
        roll_number: ROLL,
        message: "Invalid body. Expect { data: [...] }"
      });
    }

    const even_numbers = [];
    const odd_numbers = [];
    let sum = 0n;

    for (const item of data) {
      if (isNumericString(item)) {
        const n = BigInt(item);
        if (n % 2n === 0n) even_numbers.push(item);
        else odd_numbers.push(item);
        sum += n;
      }
    }

    const alphabets = data.filter(isAlphabeticString).map((s) => s.toUpperCase());
    const special_characters = splitSpecialCharacters(data);
    const allAlphaChars = extractAlphabetChars(data);
    const concat_string = alternatingCapsFromReversed(allAlphaChars);

    return res.status(200).json({
      is_success: true,
      user_id: `${FULL_NAME}_${DOB_DDMMYYYY}`,
      email: EMAIL,
      roll_number: ROLL,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: sum.toString(),
      concat_string
    });
  } catch {
    return res.status(200).json({
      is_success: false,
      user_id: `${FULL_NAME}_${DOB_DDMMYYYY}`,
      email: EMAIL,
      roll_number: ROLL,
      message: "An error occurred processing the request."
    });
  }
});

app.get("/", (_, res) => res.send("BFHL API up"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on :${PORT}`));
