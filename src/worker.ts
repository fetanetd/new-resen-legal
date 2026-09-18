interface Env {
  ASSETS: {
    fetch: typeof fetch;
  };
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_API_KEY?: string;
  FIREBASE_DATABASE_ID?: string;
  ALLOWED_ADMIN_EMAILS?: string;
  CLOUDFLARE_DEPLOY_HOOK_URL?: string;
  VITE_DEPLOY_HOOK_URL?: string;
  CRON_SECRET?: string;
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

async function verifyAdminToken(request: Request, env: Env): Promise<{ valid: boolean; email?: string; response?: Response }> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: "Unauthorized: Missing token" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      };
    }

    const token = authHeader.substring(7).trim();
    const parts = token.split(".");
    if (parts.length !== 3) {
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: "Unauthorized: Invalid token format" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      };
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    let header: any;
    let payload: any;
    try {
      header = JSON.parse(decodeBase64UrlText(headerB64));
      payload = JSON.parse(decodeBase64UrlText(payloadB64));
    } catch (e) {
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: "Unauthorized: Failed to parse token" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      };
    }

    if (header.alg !== "RS256" || !header.kid) {
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: "Unauthorized: Invalid token algorithm" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      };
    }

    const projectId = env.FIREBASE_PROJECT_ID || "gen-lang-client-0096143143";

    const now = Math.floor(Date.now() / 1000);
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: `Unauthorized: Invalid issuer` }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      };
    }
    if (payload.aud !== projectId) {
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: `Unauthorized: Invalid audience` }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      };
    }
    if (payload.exp <= now) {
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: "Unauthorized: Token expired" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      };
    }
    if (!payload.email || payload.email_verified !== true) {
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: "Unauthorized: Email not verified" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      };
    }

    const allowedEmailsStr = env.ALLOWED_ADMIN_EMAILS || "fetanetdarioglu@gmail.com,resenlegal@gmail.com";
    const allowedEmails = allowedEmailsStr.split(",").map(e => e.trim().toLowerCase());
    if (!allowedEmails.includes(payload.email.toLowerCase())) {
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: "Forbidden: You are not authorized as an administrator" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        )
      };
    }

    let keys: any[];
    try {
      keys = await fetchGoogleJwks();
    } catch (e) {
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: "Internal Server Error: Failed to retrieve Google public keys" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      };
    }

    const jwk = keys.find((key: any) => key.kid === header.kid);
    if (!jwk) {
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: "Unauthorized: No matching public key found" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      };
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
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: "Internal Server Error: Failed to import public key" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      };
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
      return {
        valid: false,
        response: new Response(
          JSON.stringify({ error: "Unauthorized: Invalid cryptographic signature" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      };
    }

    return { valid: true, email: payload.email };
  } catch (error: any) {
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: "Internal Server Error", details: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    };
  }
}

async function handleDeployRequest(request: Request, env: Env): Promise<Response> {
  const authResult = await verifyAdminToken(request, env);
  if (!authResult.valid) {
    return authResult.response!;
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
}

async function checkAndPublishScheduledPosts(env: Env): Promise<{
  publishedCount: number;
  publishedIds: string[];
  triggeredDeploy: boolean;
}> {
  const projectId = env.FIREBASE_PROJECT_ID || "gen-lang-client-0096143143";
  const databaseId = env.FIREBASE_DATABASE_ID || "ai-studio-resenlegal-0aea6453-48d2-4a9f-8df8-a2e073e2342c";
  const apiKey = env.FIREBASE_API_KEY || "AIzaSyAD6dbtawUIIgGG3JC2pyNDxu3KG8PNGw0";

  const firestoreBase = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;

  const listUrl = `${firestoreBase}/blog?key=${apiKey}&pageSize=300`;
  const res = await fetch(listUrl);
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error(`Failed to list blog documents: ${res.status} ${errText}`);
    return { publishedCount: 0, publishedIds: [], triggeredDeploy: false };
  }

  const data = (await res.json()) as any;
  const docs = data.documents || [];
  const nowTime = Date.now();
  const publishedIds: string[] = [];

  for (const doc of docs) {
    const fields = doc.fields || {};
    const status = fields.status?.stringValue;
    const publishAt = fields.publishAt?.stringValue;

    if (status === "scheduled" && publishAt) {
      const pubTime = new Date(publishAt).getTime();
      if (!isNaN(pubTime) && pubTime <= nowTime) {
        const docName = doc.name; // projects/.../databases/.../documents/blog/postId
        const patchUrl = `https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt&key=${apiKey}`;

        const patchBody = {
          fields: {
            ...fields,
            status: { stringValue: "published" },
            updatedAt: { stringValue: new Date().toISOString() }
          }
        };

        try {
          const patchRes = await fetch(patchUrl, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patchBody)
          });

          if (patchRes.ok) {
            const docId = docName.split("/").pop();
            if (docId) publishedIds.push(docId);
            console.log(`Scheduled article ${docId} successfully marked as published.`);
          } else {
            const pErr = await patchRes.text().catch(() => "");
            console.error(`Failed to publish document ${docName}:`, pErr);
          }
        } catch (patchErr) {
          console.error(`Error updating scheduled article ${docName}:`, patchErr);
        }
      }
    }
  }

  let triggeredDeploy = false;
  if (publishedIds.length > 0) {
    const deployHookUrl = env.CLOUDFLARE_DEPLOY_HOOK_URL || env.VITE_DEPLOY_HOOK_URL;
    if (deployHookUrl) {
      try {
        const deployRes = await fetch(deployHookUrl, { method: "POST" });
        triggeredDeploy = deployRes.ok;
        console.log(`Triggered deploy hook after publishing ${publishedIds.length} articles. Success: ${triggeredDeploy}`);
      } catch (dErr) {
        console.error("Error triggering deploy hook after publishing:", dErr);
      }
    }
  }

  return {
    publishedCount: publishedIds.length,
    publishedIds,
    triggeredDeploy
  };
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

    // 2. Handle scheduled publish trigger endpoint
    if (url.pathname === "/api/publish-scheduled") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Cron-Secret",
          }
        });
      }

      if (request.method !== "POST" && request.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" }
        });
      }

      const authHeader = request.headers.get("Authorization");
      const cronSecretHeader = request.headers.get("X-Cron-Secret");
      const isAuthorizedSecret = env.CRON_SECRET && cronSecretHeader === env.CRON_SECRET;

      if (!isAuthorizedSecret) {
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "Unauthorized: Admin token or valid cron secret required" }),
            { status: 401, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        }
        const authResult = await verifyAdminToken(request, env);
        if (!authResult.valid) {
          const res = authResult.response!;
          const newHeaders = new Headers(res.headers);
          newHeaders.set("Access-Control-Allow-Origin", "*");
          return new Response(res.body, { status: res.status, headers: newHeaders });
        }
      }

      try {
        const result = await checkAndPublishScheduledPosts(env);
        return new Response(JSON.stringify({ success: true, ...result }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // 3. Fallback to serving static assets
    try {
      return await env.ASSETS.fetch(request);
    } catch (err: any) {
      return new Response("Asset Fetch Error: " + err.message, { status: 500 });
    }
  },

  async scheduled(event: any, env: Env, ctx: any): Promise<void> {
    console.log("Cloudflare Cron scheduled event triggered:", event.cron);
    ctx.waitUntil(checkAndPublishScheduledPosts(env));
  }
};
