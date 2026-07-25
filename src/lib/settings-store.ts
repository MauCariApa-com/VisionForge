import type { CustomModel, CustomProvider, ProviderConfig } from "@/services/image-generation/types";

export type ImageProvider = string;

export interface AppSettings {
  apiKey: string;
  provider: ImageProvider;
  model: string;
  accountId?: string;
  providerConfigs: Record<string, ProviderConfig>;
  customProviders: CustomProvider[];
  customModels: CustomModel[];
  excludedModelIds: Record<string, string[]>;
  activeProviderId?: string;
}

const STORAGE_KEY = "visionforge_settings_v2";
const LEGACY_STORAGE_KEY = "visionforge_settings_v1";

const cloudflareApiKey = import.meta.env.VITE_CLOUDFLARE_API_KEY || "";
const cloudflareAccountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || "";

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: cloudflareApiKey,
  provider: "cloudflare",
  model: "@cf/black-forest-labs/flux-1-schnell",
  accountId: cloudflareAccountId,
  providerConfigs: {
    cloudflare: {
      apiKey: cloudflareApiKey,
      envVarName: "VITE_CLOUDFLARE_API_KEY",
    },
  },
  customProviders: [],
  customModels: [],
  excludedModelIds: {},
  activeProviderId: "cloudflare",
};

function migrateLegacySettings(): Partial<AppSettings> | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      apiKey?: string;
      provider?: string;
      model?: string;
      accountId?: string;
    };
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return {
      apiKey: parsed.apiKey,
      provider: parsed.provider,
      model: parsed.model,
      accountId: parsed.accountId,
      providerConfigs: {
        cloudflare: {
          apiKey: parsed.provider === "cloudflare" ? parsed.apiKey ?? "" : "",
          envVarName: "VITE_CLOUDFLARE_API_KEY",
        },
      },
      excludedModelIds: {},
    };
  } catch {
    return null;
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const migrated = !raw ? migrateLegacySettings() : null;
    const parsed = raw ? (JSON.parse(raw) as Partial<AppSettings>) : migrated ?? {};

    return {
      apiKey: parsed.apiKey ?? DEFAULT_SETTINGS.apiKey,
      provider: parsed.provider ?? DEFAULT_SETTINGS.provider,
      model: parsed.model ?? DEFAULT_SETTINGS.model,
      accountId: parsed.accountId ?? DEFAULT_SETTINGS.accountId,
      providerConfigs: {
        ...DEFAULT_SETTINGS.providerConfigs,
        ...(parsed.providerConfigs ?? {}),
      },
      customProviders: parsed.customProviders ?? DEFAULT_SETTINGS.customProviders,
      customModels: parsed.customModels ?? DEFAULT_SETTINGS.customModels,
      excludedModelIds: parsed.excludedModelIds ?? DEFAULT_SETTINGS.excludedModelIds,
      activeProviderId: parsed.activeProviderId ?? parsed.provider ?? DEFAULT_SETTINGS.activeProviderId,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function clearSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getProviderConfig(settings: AppSettings, providerId: string): ProviderConfig {
  return (
    settings.providerConfigs[providerId] ?? {
      apiKey: "",
      envVarName: undefined,
    }
  );
}

export function updateProviderConfig(
  settings: AppSettings,
  providerId: string,
  config: Partial<ProviderConfig>
): AppSettings {
  return {
    ...settings,
    providerConfigs: {
      ...settings.providerConfigs,
      [providerId]: {
        ...getProviderConfig(settings, providerId),
        ...config,
      },
    },
  };
}

export function isModelExcluded(
  settings: AppSettings,
  providerId: string,
  modelId: string
): boolean {
  return settings.excludedModelIds[providerId]?.includes(modelId) ?? false;
}

export function excludeModel(
  settings: AppSettings,
  providerId: string,
  modelId: string
): AppSettings {
  const existing = settings.excludedModelIds[providerId] ?? [];
  if (existing.includes(modelId)) return settings;
  return {
    ...settings,
    excludedModelIds: {
      ...settings.excludedModelIds,
      [providerId]: [...existing, modelId],
    },
  };
}

export function includeModel(
  settings: AppSettings,
  providerId: string,
  modelId: string
): AppSettings {
  const existing = settings.excludedModelIds[providerId] ?? [];
  if (!existing.includes(modelId)) return settings;
  return {
    ...settings,
    excludedModelIds: {
      ...settings.excludedModelIds,
      [providerId]: existing.filter((id) => id !== modelId),
    },
  };
}