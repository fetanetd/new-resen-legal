interface Env {
  ASSETS: {
    fetch: typeof fetch;
  };
  FIREBASE_PROJECT_ID?: string;
  ALLOWED_ADMIN_EMAILS?: string;
  CLOUDFLARE_DEPLOY_HOOK_URL?: string;
  VITE_DEPLOY_HOOK_URL?: string;
}

interface JwkCache {
  keys: any[];
  expiresAt: number;
}

let jwkCache: JwkCache | null = null;

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function decodeBase64UrlText(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

async function fetchGoogleJwks(): Promise<any[]> {
  const now = Date.now();
  if (jwkCache && jwkCache.expiresAt > now) {
    return jwkCache.keys;
  }

  const response = await fetch("https://www.googleapis.com/robot/v1/metadata/jwk/securetoken@system.gserviceaccount.com");
  if (!response.ok) {
    throw new Error("Failed to fetch Google JWKs");
  }

  const data = await response.json() as any;
  const keys = data.keys || [];

  let maxAge = 3600;
  const cacheControl = response.headers.get("Cache-Control");
  if (cacheControl) {
    const match = cacheControl.match(/max-age=(\d+)/);
    if (match) {
      maxAge = parseInt(match[1], 10);
    }
  }

  jwkCache = {
    keys,
    expiresAt: now + maxAge * 1000,
  };

  return keys;
}

async function handleDeployRequest(request: Request, env: Env): Promise<Response> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.substring(7).trim();
    const parts = token.split(".");
    if (parts.length !== 3) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token format" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    let header: any;
    let payload: any;
    try {
      header = JSON.parse(decodeBase64UrlText(headerB64));
      payload = JSON.parse(decodeBase64UrlText(payloadB64));
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Failed to parse token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (header.alg !== "RS256" || !header.kid) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token algorithm" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const projectId = env.FIREBASE_PROJECT_ID || "gen-lang-client-0096143143";

    const now = Math.floor(Date.now() / 1000);
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
      return new Response(
        JSON.stringify({ error: `Unauthorized: Invalid issuer` }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    if (payload.aud !== projectId) {
      return new Response(
        JSON.stringify({ error: `Unauthorized: Invalid audience` }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    if (payload.exp <= now) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Token expired" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!payload.email || payload.email_verified !== true) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Email not verified" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const allowedEmailsStr = env.ALLOWED_ADMIN_EMAILS || "fetanetdarioglu@gmail.com,resenlegal@gmail.com";
    const allowedEmails = allowedEmailsStr.split(",").map(e => e.trim().toLowerCase());
    if (!allowedEmails.includes(payload.email.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: "Forbidden: You are not authorized as an administrator" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    let keys: any[];
    try {
      keys = await fetchGoogleJwks();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Internal Server Error: Failed to retrieve Google public keys" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const jwk = keys.find((key: any) => key.kid === header.kid);
    if (!jwk) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: No matching public key found" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let cryptoKey: CryptoKey;
    try {
      cryptoKey = await crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      );
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Internal Server Error: Failed to import public key" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const dataToVerify = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signatureBytes = base64UrlDecode(signatureB64);
    const isSignatureValid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signatureBytes,
      dataToVerify
    );

    if (!isSignatureValid) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid cryptographic signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const deployHookUrl = env.CLOUDFLARE_DEPLOY_HOOK_URL || env.VITE_DEPLOY_HOOK_URL;
    if (!deployHookUrl) {
      return new Response(
        JSON.stringify({ error: "Configuration Error: Deploy hook URL is not configured on Cloudflare" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const deployResponse = await fetch(deployHookUrl, {
      method: "POST",
    });

    if (!deployResponse.ok) {
      const respText = await deployResponse.text().catch(() => "");
      return new Response(
        JSON.stringify({
          error: "Build Trigger Failed: Cloudflare rejected the deploy hook",
          details: respText,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Build hook triggered successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // 1. Handle API Deploy request
    if (url.pathname === "/api/deploy") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          }
        });
      }
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        const response = await handleDeployRequest(request, env);
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Access-Control-Allow-Origin", "*");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // 2. Fallback to serving static assets
    try {
      return await env.ASSETS.fetch(request);
    } catch (err: any) {
      return new Response("Asset Fetch Error: " + err.message, { status: 500 });
    }
  }
};
