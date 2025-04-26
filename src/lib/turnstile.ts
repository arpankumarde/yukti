import axios from "axios";

export async function verifyTurnstileToken(token: string) {
  // Skip validation in development if no secret key is provided
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.TURNSTILE_SECRET_KEY
  ) {
    console.warn(
      "Turnstile validation skipped in development. Set TURNSTILE_SECRET_KEY to enable validation."
    );
    return true;
  }

  try {
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || "",
        response: token,
      })
    );
    const data = response.data;
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}
