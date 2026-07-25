import type {
  GenerationRequest,
  GenerationResponse,
  ImageProviderClient,
  ProviderModel,
} from "./types";

export interface CustomProviderClientOptions {
  id: string;
  name: string;
  apiBaseUrl: string;
  models: ProviderModel[];
}

function isCorsError(error: unknown): boolean {
  return error instanceof TypeError && /fetch|network|cors|failed/i.test(error.message);
}

export function createCustomProviderClient(options: CustomProviderClientOptions): ImageProviderClient {
  const { id, name, apiBaseUrl, models } = options;

  return {
    id,
    name,
    models,
    async generate(request: GenerationRequest, apiKey: string): Promise<GenerationResponse> {
      const baseUrl = apiBaseUrl.replace(/\/$/, "");
      const endpoint = `${baseUrl}/generate`;

      const body = new FormData();
      body.append("prompt", request.prompt);
      body.append("model", request.model || models[0]?.id || "");
      body.append("width", String(request.width));
      body.append("height", String(request.height));
      body.append("steps", String(request.steps));
      body.append("cfg_scale", String(request.cfgScale));
      body.append("output_format", "png");

      if (request.negativePrompt) {
        body.append("negative_prompt", request.negativePrompt);
      }
      if (request.seed !== undefined && request.seed >= 0) {
        body.append("seed", String(request.seed));
      }

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "image/*, application/json",
          },
          body,
        });

        if (!response.ok) {
          let detail = response.statusText;
          try {
            const errorBody = await response.json();
            detail =
              errorBody.errors?.[0] ||
              errorBody.message ||
              JSON.stringify(errorBody);
          } catch {
            // Non-JSON error body; use status text.
          }
          throw new Error(`${name} error (${response.status}): ${detail}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("image")) {
          const blob = await response.blob();
          return { imageUrl: URL.createObjectURL(blob), seed: request.seed };
        }

        const json = (await response.json()) as {
          image?: string;
          imageUrl?: string;
          seed?: number;
          output?: string;
        };

        const imageSource =
          json.imageUrl || json.output || json.image;

        if (typeof imageSource === "string" && imageSource.length > 0) {
          return { imageUrl: imageSource, seed: json.seed ?? request.seed };
        }

        throw new Error(
          `${name} returned a successful response but no image could be found. Expected an image response or JSON with "image", "output", or "imageUrl".`
        );
      } catch (error) {
        if (isCorsError(error)) {
          throw new Error(
            `${name} request was blocked by CORS. In the dev environment, configure a Vite proxy or use a backend relay. In production (e.g. on Vercel), direct browser calls to this provider may not be allowed.`
          );
        }
        throw error;
      }
    },
  };
}

export function createCustomProviderClientJson(options: CustomProviderClientOptions): ImageProviderClient {
  const { id, name, apiBaseUrl, models } = options;

  return {
    id,
    name,
    models,
    async generate(request: GenerationRequest, apiKey: string): Promise<GenerationResponse> {
      const baseUrl = apiBaseUrl.replace(/\/$/, "");
      const endpoint = `${baseUrl}/generate`;

      const body = JSON.stringify({
        prompt: request.prompt,
        model: request.model || models[0]?.id || "",
        width: request.width,
        height: request.height,
        steps: request.steps,
        cfg_scale: request.cfgScale,
        negative_prompt: request.negativePrompt,
        seed:
          request.seed !== undefined && request.seed >= 0 ? request.seed : undefined,
      });

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json, image/*",
            "Content-Type": "application/json",
          },
          body,
        });

        if (!response.ok) {
          let detail = response.statusText;
          try {
            const errorBody = await response.json();
            detail =
              errorBody.errors?.[0] ||
              errorBody.message ||
              JSON.stringify(errorBody);
          } catch {
            // ignore
          }
          throw new Error(`${name} error (${response.status}): ${detail}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("image")) {
          const blob = await response.blob();
          return { imageUrl: URL.createObjectURL(blob), seed: request.seed };
        }

        const json = (await response.json()) as {
          image?: string;
          imageUrl?: string;
          seed?: number;
          output?: string;
        };

        const imageSource = json.imageUrl || json.output || json.image;

        if (typeof imageSource === "string" && imageSource.length > 0) {
          return { imageUrl: imageSource, seed: json.seed ?? request.seed };
        }

        throw new Error(
          `${name} returned a successful response but no image could be found. Expected JSON with "image", "output", or "imageUrl".`
        );
      } catch (error) {
        if (isCorsError(error)) {
          throw new Error(
            `${name} request was blocked by CORS. In the dev environment, configure a Vite proxy or use a backend relay. In production (e.g. on Vercel), direct browser calls to this provider may not be allowed.`
          );
        }
        throw error;
      }
    },
  };
}
