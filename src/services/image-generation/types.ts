export type AspectRatioOption = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "6:19" | "9:16";

export type ImageProvider = string;

export interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed?: number;
  model?: string;
}

export interface GenerationResponse {
  imageUrl: string;
  seed?: number;
}

export interface ProviderModel {
  id: string;
  name: string;
  description?: string;
  defaultWidth: number;
  defaultHeight: number;
}

export interface ProviderConfig {
  apiKey: string;
  envVarName?: string;
}

export interface CustomProvider {
  id: string;
  name: string;
  apiBaseUrl: string;
  envVarName?: string;
}

export interface CustomModel {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  defaultWidth: number;
  defaultHeight: number;
}

export interface ImageProviderClient {
  id: ImageProvider;
  name: string;
  models: ProviderModel[];
  generate: (request: GenerationRequest, apiKey: string) => Promise<GenerationResponse>;
}

export function getDimensionsForAspectRatio(
  ratio: AspectRatioOption,
  baseSize: number = 1024
): { width: number; height: number } {
  switch (ratio) {
    case "1:1":
      return { width: baseSize, height: baseSize };
    case "2:3":
      return { width: baseSize, height: Math.round(baseSize * (3 / 2)) };
    case "3:2":
      return { width: baseSize, height: Math.round(baseSize * (2 / 3)) };
    case "3:4":
      return { width: baseSize, height: Math.round(baseSize * (4 / 3)) };
    case "4:3":
      return { width: baseSize, height: Math.round(baseSize * 0.75) };
    case "6:19":
      return { width: baseSize, height: Math.round(baseSize * (19 / 6)) };
    case "9:16":
      return { width: Math.round(baseSize * 0.5625), height: baseSize };
    default:
      return { width: baseSize, height: baseSize };
  }
}