import type {
  GenerationRequest,
  GenerationResponse,
  ImageProviderClient,
  ProviderModel,
} from "./types";
import { loadSettings } from "@/lib/settings-store";

export const CLOUDFLARE_MODELS: ProviderModel[] = [
  {
    id: "@cf/black-forest-labs/flux-1-schnell",
    name: "FLUX.1 [schnell]",
    defaultWidth: 1024,
    defaultHeight: 1024,
  },
  {
    id: "@cf/leonardo/lucid-origin",
    name: "Lucid Origin",
    description: "Leonardo.AI's most adaptable and prompt-responsive model.",
    defaultWidth: 1120,
    defaultHeight: 1120,
  },
  {
    id: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    name: "Stable Diffusion XL Base 1.0",
    description:
      "Diffusion-based text-to-image generative model by Stability AI.",
    defaultWidth: 1024,
    defaultHeight: 1024,
  },
  {
    id: "@cf/bytedance/stable-diffusion-xl-lightning",
    name: "Stable Diffusion XL Lightning",
    description: "SDXL-Lightning is a lightning-fast text-to-image generation model.",
    defaultWidth: 1024,
    defaultHeight: 1024,
  },
];

const BASE_ORIGIN = "https://api.cloudflare.com/client/v4";
const MAX_FLUX_STEPS = 8;

function getMimeFromBase64(b64: string): string {
  if (b64.startsWith("/9j")) return "image/jpeg";
  if (b64.startsWith("iVBOR")) return "image/png";
  if (b64.startsWith("R0lGOD")) return "image/gif";
  if (b64.startsWith("UklGR")) return "image/webp";
  return "image/png";
}

function isFluxModel(modelId: string): boolean {
  return modelId.toLowerCase().includes("flux");
}

function normalizeCloudflareModel(modelId?: string): string {
  if (!modelId) return CLOUDFLARE_MODELS[0].id;
  if (modelId.startsWith("@cf/")) return modelId;

  const knownPrefixes: Record<string, string> = {
    "flux-1-schnell": "@cf/black-forest-labs/flux-1-schnell",
    "stable-diffusion-xl-base-1.0": "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    "stable-diffusion-xl-lightning": "@cf/bytedance/stable-diffusion-xl-lightning",
    "lucid-origin": "@cf/leonardo/lucid-origin",
  };

  const lower = modelId.toLowerCase();
  for (const [suffix, fullId] of Object.entries(knownPrefixes)) {
    if (lower === suffix || lower.endsWith(`/${suffix}`)) {
      return fullId;
    }
  }

  return modelId;
}

function buildCloudflareBody(request: GenerationRequest): Record<string, unknown> {
  const modelId = normalizeCloudflareModel(request.model);

  if (isFluxModel(modelId)) {
    const body: Record<string, unknown> = { prompt: request.prompt };
    body.steps = Math.min(Math.max(request.steps, 1), MAX_FLUX_STEPS);
    if (request.seed !== undefined && request.seed >= 0) {
      body.seed = request.seed;
    }
    return body;
  }

  const body: Record<string, unknown> = {
    prompt: request.prompt,
    num_steps: request.steps,
    width: request.width,
    height: request.height,
  };

  if (request.negativePrompt) body.negative_prompt = request.negativePrompt;
  if (request.cfgScale && request.cfgScale > 0) body.guidance = request.cfgScale;
  if (request.seed !== undefined && request.seed >= 0) body.seed = request.seed;

  return body;
}

export const cloudflareClient: ImageProviderClient = {
  id: "cloudflare",
  name: "Cloudflare Workers AI",
  models: CLOUDFLARE_MODELS,
  async generate(
    request: GenerationRequest,
    apiKey: string
  ): Promise<GenerationResponse> {
    const { accountId } = loadSettings();
    if (!accountId) {
      throw new Error(
        "Cloudflare account ID is missing. Add it in the Settings dialog."
      );
    }

    const modelPath = normalizeCloudflareModel(request.model);
    const endpoint = import.meta.env.DEV
      ? `/api/cloudflare/accounts/${accountId}/ai/run/${modelPath}`
      : `${BASE_ORIGIN}/accounts/${accountId}/ai/run/${modelPath}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "image/*, application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildCloudflareBody(request)),
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const errorBody = await response.json();
        detail =
          errorBody.errors?.[0]?.message ||
          errorBody.message ||
          JSON.stringify(errorBody);
      } catch {
        // Non-JSON error body.
      }
      throw new Error(`Cloudflare AI error (${response.status}): ${detail}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("image")) {
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      return { imageUrl, seed: request.seed };
    }

    const json = (await response.json()) as {
      success?: boolean;
      errors?: Array<{ message: string }>;
      result?: { image?: string } | string;
    };

    if (json.success === false) {
      const detail =
        json.errors?.map((e) => e.message).join(", ") || "Unknown Cloudflare error";
      throw new Error(`Cloudflare AI error: ${detail}`);
    }

    let base64Image: string | undefined;
    if (json.result && typeof json.result === "object") {
      base64Image = json.result.image;
    } else if (typeof json.result === "string") {
      base64Image = json.result;
    }

    if (!base64Image) {
      throw new Error(
        "Cloudflare AI returned an unexpected response shape. Expected an image or a base64 result."
      );
    }

    const mime = getMimeFromBase64(base64Image);
    const imageUrl = `data:${mime};base64,${base64Image}`;
    return { imageUrl, seed: request.seed };
  },
};