import { loadSettings } from "@/lib/settings-store";
import type { ImageProvider, ImageProviderClient, ProviderModel } from "./types";
import { cloudflareClient, CLOUDFLARE_MODELS } from "./cloudflare-client";
import { createCustomProviderClient } from "./custom-provider-client";

const registry = new Map<ImageProvider, ImageProviderClient>([
  ["cloudflare", cloudflareClient],
]);

export function registerProvider(client: ImageProviderClient): void {
  registry.set(client.id, client);
}

export function unregisterProvider(id: ImageProvider): void {
  registry.delete(id);
}

export function getProvider(id: ImageProvider): ImageProviderClient {
  const client = registry.get(id);
  if (!client) {
    throw new Error(`No image provider registered for "${id}"`);
  }
  return client;
}

export function listProviders(): ImageProviderClient[] {
  return Array.from(registry.values());
}

export function hasProvider(id: ImageProvider): boolean {
  return registry.has(id);
}

export const DEFAULT_PROVIDER: ImageProvider = "cloudflare";

function getBuiltInModels(providerId: string): ProviderModel[] {
  if (providerId === "cloudflare") return [...CLOUDFLARE_MODELS];
  return [];
}

function buildModelsForProvider(
  providerId: string,
  builtInModels: ProviderModel[],
  customModels: {
    id: string;
    providerId: string;
    name: string;
    description?: string;
    defaultWidth: number;
    defaultHeight: number;
  }[],
  excludedIds: string[] = []
): ProviderModel[] {
  const extras = customModels
    .filter((m) => m.providerId === providerId)
    .map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      defaultWidth: m.defaultWidth,
      defaultHeight: m.defaultHeight,
    }));

  const existingIds = new Set(builtInModels.map((m) => m.id));
  const uniqueExtras = extras.filter((m) => !existingIds.has(m.id));

  // Built-in models are always pre-listed; exclusions only hide custom models.
  const excluded = new Set(excludedIds);
  return [...builtInModels, ...uniqueExtras.filter((m) => !excluded.has(m.id))];
}

export function hydrateCustomProviders(): void {
  const settings = loadSettings();

  const cloudflareModels = buildModelsForProvider(
    "cloudflare",
    getBuiltInModels("cloudflare"),
    settings.customModels,
    settings.excludedModelIds["cloudflare"]
  );
  cloudflareClient.models.splice(0, cloudflareClient.models.length, ...cloudflareModels);

  for (const provider of settings.customProviders) {
    const providerModels = buildModelsForProvider(
      provider.id,
      [],
      settings.customModels,
      settings.excludedModelIds[provider.id]
    );
    registerProvider(
      createCustomProviderClient({
        id: provider.id,
        name: provider.name,
        apiBaseUrl: provider.apiBaseUrl,
        models: providerModels,
      })
    );
  }
}

hydrateCustomProviders();