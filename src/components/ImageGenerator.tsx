import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PromptInput } from "./PromptInput";
import { ControlPanel } from "./ControlPanel";
import { ImagePreview } from "./ImagePreview";
import { GalleryGrid } from "./GalleryGrid";
import { AboutDialog } from "./AboutDialog";
import { HexagonIcon } from "./HexagonIcon";
import {
  getProvider,
  listProviders,
  hydrateCustomProviders,
} from "@/services/image-generation/provider-registry";
import {
  type AspectRatioOption,
  type GenerationRequest,
} from "@/services/image-generation/types";
import {
  loadSettings,
  saveSettings,
  type AppSettings,
} from "@/lib/settings-store";
import {
  loadHistory,
  addHistoryItem,
  deleteHistoryItem,
  clearHistory,
  type HistoryItem,
} from "@/lib/history-store";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Settings, Info } from "lucide-react";

export function ImageGenerator() {
  const { t } = useI18n();

  const [settings, setSettings] = useState<AppSettings>(() => {
    hydrateCustomProviders();
    const initial = loadSettings();
    const initialProviders = listProviders();
    const currentProvider =
      initialProviders.find((p) => p.id === initial.provider) ??
      initialProviders[0];
    const availableModels = currentProvider?.models ?? [];
    const validModel = availableModels.some((m) => m.id === initial.model);
    return {
      ...initial,
      provider: currentProvider?.id ?? initial.provider,
      model: validModel ? initial.model : availableModels[0]?.id ?? "",
    };
  });
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [aboutOpen, setAboutOpen] = useState(false);

  const providers = listProviders();

  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("1:1");
  const [seed, setSeed] = useState("");
  const [latestImageUrl, setLatestImageUrl] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const blobToDataUrl = useCallback(
    (blob: Blob): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }),
    []
  );

  const generateMutation = useMutation({
    mutationFn: async (request: GenerationRequest) => {
      const apiKey =
        settings.providerConfigs[settings.provider]?.apiKey ?? settings.apiKey;
      if (!apiKey) {
        throw new Error(t("imageGenerator.apiKeyMissing"));
      }
      const client = getProvider(settings.provider);
      return client.generate(request, apiKey);
    },
    onSuccess: async (data) => {
      setLatestImageUrl(data.imageUrl);
      setLastError(null);

      const response = await fetch(data.imageUrl);
      const blob = await response.blob();
      const imageDataUrl = await blobToDataUrl(blob);

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        prompt,
        negativePrompt,
        width,
        height,
        steps,
        cfgScale,
        seed: seed ? Number(seed) : undefined,
        provider: settings.provider,
        model: settings.model,
        imageDataUrl,
        createdAt: Date.now(),
      };

      const nextHistory = addHistoryItem(newItem);
      setHistory(nextHistory);
      toast.success(t("settings.toasts.generated"), {
        description: t("settings.toasts.generatedDesc"),
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setLastError(message);
      toast.error(t("settings.toasts.generationFailed"), { description: message });
    },
  });

  const getValidatedModel = useCallback((): string => {
    const client =
      providers.find((p) => p.id === settings.provider) ?? providers[0];
    const availableModels = client?.models ?? [];
    if (availableModels.some((m) => m.id === settings.model)) {
      return settings.model;
    }
    const fallback = availableModels[0]?.id ?? settings.model;
    if (fallback !== settings.model) {
      setSettings((prev) => ({ ...prev, model: fallback }));
    }
    return fallback;
  }, [providers, settings.provider, settings.model]);

  const buildRequest = useCallback((): GenerationRequest => {
    return {
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim(),
      width,
      height,
      steps,
      cfgScale,
      seed: seed ? Number(seed) : undefined,
      model: getValidatedModel(),
    };
  }, [
    prompt,
    negativePrompt,
    width,
    height,
    steps,
    cfgScale,
    seed,
    getValidatedModel,
  ]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setLastError(null);
    generateMutation.mutate(buildRequest());
  };

  const handleRetry = () => {
    setLastError(null);
    generateMutation.mutate(buildRequest());
  };

  const handleDelete = (id: string) => {
    setHistory(deleteHistoryItem(id));
    toast.info(t("settings.toasts.imageDeleted"));
  };

  const handleClear = () => {
    setHistory(clearHistory());
    toast.info(t("settings.toasts.galleryCleared"));
  };

  const handleProviderChange = (nextProvider: string) => {
    const client =
      providers.find((p) => p.id === nextProvider) ?? providers[0];
    const availableModels = client?.models ?? [];
    const nextModel =
      availableModels.find((m) => m.id === settings.model)?.id ??
      availableModels[0]?.id ??
      "";
    const config = settings.providerConfigs[nextProvider];
    setSettings((prev) => ({
      ...prev,
      provider: nextProvider,
      model: nextModel,
      apiKey: config?.apiKey ?? prev.apiKey,
      activeProviderId: nextProvider,
    }));
  };

  const handleModelChange = (nextModel: string) => {
    setSettings((prev) => ({ ...prev, model: nextModel }));
  };

  const handleAspectRatioChange = (value: AspectRatioOption) => {
    setAspectRatio(value);
  };

  const handleImageCompare = () => {
    window.open("https://maucariapa.com/hexagon", "_blank", "noopener,noreferrer");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="fade-in-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("imageGenerator.title")}
          </h2>
          <p className="mt-2 max-w-xl text-base text-muted-foreground">
            {t("imageGenerator.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-md text-muted-foreground"
                onClick={handleImageCompare}
                aria-label={t("imageGenerator.compareTooltip")}
              >
                <HexagonIcon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{t("imageGenerator.compareTooltip")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-md"
                asChild
              >
                <Link to="/settings" aria-label={t("imageGenerator.settingsTooltip")}>
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{t("imageGenerator.settingsTooltip")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-md"
                onClick={() => setAboutOpen(true)}
                aria-label={t("imageGenerator.aboutTooltip")}
              >
                <Info className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{t("imageGenerator.aboutTooltip")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <aside className="order-2 space-y-6 lg:order-1">
          <ControlPanel
            provider={settings.provider}
            model={settings.model}
            providers={providers}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
            negativePrompt={negativePrompt}
            onNegativePromptChange={setNegativePrompt}
            onClearNegativePrompt={() => setNegativePrompt("")}
            steps={steps}
            onStepsChange={setSteps}
            cfgScale={cfgScale}
            onCfgScaleChange={setCfgScale}
            width={width}
            onWidthChange={setWidth}
            height={height}
            onHeightChange={setHeight}
            aspectRatio={aspectRatio}
            onAspectRatioChange={handleAspectRatioChange}
            seed={seed}
            onSeedChange={setSeed}
            disabled={generateMutation.isPending}
          />
        </aside>

        <div className="order-1 space-y-8 lg:order-2">
          <section className="fade-in-up" style={{ animationDelay: "0.1s" }}>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerate}
              onClear={() => setPrompt("")}
              disabled={generateMutation.isPending}
            />
          </section>

          <section className="fade-in-up" style={{ animationDelay: "0.2s" }}>
            <ImagePreview
              imageUrl={latestImageUrl}
              isLoading={generateMutation.isPending}
              error={lastError}
              onRetry={handleRetry}
              aspectRatio={aspectRatio}
            />
          </section>
        </div>
      </div>

      <div className="mt-12 fade-in-up" style={{ animationDelay: "0.3s" }}>
        <GalleryGrid
          items={history}
          onDelete={handleDelete}
          onClear={handleClear}
        />
      </div>

      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </main>
  );
}