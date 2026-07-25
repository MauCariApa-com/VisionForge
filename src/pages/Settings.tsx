import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProviderConfigCard } from "@/components/settings/ProviderConfigCard";
import { AddProviderDialog } from "@/components/settings/AddProviderDialog";
import { AddModelDialog } from "@/components/settings/AddModelDialog";
import { EditProviderDialog } from "@/components/settings/EditProviderDialog";
import { EditModelDialog } from "@/components/settings/EditModelDialog";
import {
  loadSettings,
  saveSettings,
  type AppSettings,
} from "@/lib/settings-store";
import {
  listProviders,
  hydrateCustomProviders,
} from "@/services/image-generation/provider-registry";
import type { CustomProvider, CustomModel } from "@/services/image-generation/types";
import { useI18n } from "@/lib/i18n/i18n-context";
import { ArrowLeft, Plus, AlertTriangle, Trash2, Pencil, Lock } from "lucide-react";
import { toast } from "sonner";

const BUILT_IN_PROVIDER_IDS = new Set(["cloudflare"]);

export default function Settings() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [lastSaved, setLastSaved] = useState(true);
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<CustomProvider | null>(null);
  const [editingModel, setEditingModel] = useState<CustomModel | null>(null);

  const providers = useMemo(() => listProviders(), [settings.customProviders, settings.customModels]);

  const builtIns = providers.filter((p) => BUILT_IN_PROVIDER_IDS.has(p.id));
  const customProvidersList = settings.customProviders;

  useEffect(() => {
    saveSettings(settings);
    hydrateCustomProviders();
    setLastSaved(true);
    const timer = setTimeout(() => setLastSaved(false), 1200);
    return () => clearTimeout(timer);
  }, [settings]);

  const handleProviderUpdate = (next: AppSettings) => {
    setSettings(next);
    toast.success(t("settings.toasts.providerSaved"));
  };

  const handleAddProvider = (provider: CustomProvider) => {
    if (settings.customProviders.some((p) => p.id === provider.id)) {
      toast.error(t("settings.toasts.providerExists"));
      return;
    }
    setSettings((prev) => ({
      ...prev,
      customProviders: [...prev.customProviders, provider],
    }));
    toast.success(t("settings.toasts.providerAdded"));
  };

  const handleEditProvider = (provider: CustomProvider) => {
    setSettings((prev) => ({
      ...prev,
      customProviders: prev.customProviders.map((p) =>
        p.id === provider.id ? provider : p
      ),
    }));
    hydrateCustomProviders();
    toast.success(t("settings.toasts.providerUpdated"));
  };

  const handleDeleteProvider = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      customProviders: prev.customProviders.filter((p) => p.id !== id),
      customModels: prev.customModels.filter((m) => m.providerId !== id),
    }));
    toast.info(t("settings.toasts.providerRemoved"));
  };

  const handleAddModel = (model: CustomModel) => {
    if (
      settings.customModels.some(
        (m) => m.id === model.id && m.providerId === model.providerId
      )
    ) {
      toast.error(t("settings.toasts.modelExists"));
      return;
    }
    setSettings((prev) => ({
      ...prev,
      customModels: [...prev.customModels, model],
    }));
    toast.success(t("settings.toasts.modelAdded"));
  };

  const handleEditModel = (model: CustomModel, original: CustomModel) => {
    setSettings((prev) => {
      const duplicate = prev.customModels.some(
        (m) =>
          m.id === model.id &&
          m.providerId === model.providerId &&
          !(m.id === original.id && m.providerId === original.providerId)
      );
      if (duplicate) {
        toast.error(t("settings.toasts.modelExists"));
        return prev;
      }
      return {
        ...prev,
        customModels: prev.customModels.map((m) =>
          m.id === original.id && m.providerId === original.providerId
            ? model
            : m
        ),
      };
    });
    toast.success(t("settings.toasts.modelUpdated"));
  };

  const handleDeleteModel = (id: string, providerId: string) => {
    const isCustom = settings.customModels.some(
      (m) => m.id === id && m.providerId === providerId
    );
    if (!isCustom) {
      toast.info(t("settings.toasts.builtInRemove"));
      return;
    }
    setSettings((prev) => ({
      ...prev,
      customModels: prev.customModels.filter(
        (m) => !(m.id === id && m.providerId === providerId)
      ),
    }));
    toast.info(t("settings.toasts.modelRemoved"));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div
        className="fade-in-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("settings.title")}
          </h1>
          <p className="mt-2 max-w-xl text-base text-muted-foreground">
            {t("settings.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={`rounded-md text-xs transition-opacity ${
              lastSaved ? "opacity-100" : "opacity-0"
            }`}
          >
            {t("settings.autoSaved")}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-md"
            asChild
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              {t("settings.back")}
            </Link>
          </Button>
        </div>
      </div>

      <section className="fade-in-up space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("settings.providers.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("settings.providers.description")}
            </p>
          </div>
          <Button
            onClick={() => setProviderDialogOpen(true)}
            className="gap-1.5 rounded-md"
          >
            <Plus className="h-4 w-4" />
            {t("settings.providers.add")}
          </Button>
        </div>

        <div className="space-y-4">
          {builtIns.map((provider) => (
            <ProviderConfigCard
              key={provider.id}
              providerId={provider.id}
              name={provider.name}
              envVarName={
                settings.providerConfigs[provider.id]?.envVarName ??
                "VITE_CLOUDFLARE_API_KEY"
              }
              settings={settings}
              onUpdate={handleProviderUpdate}
            />
          ))}

          {customProvidersList.map((provider) => (
            <ProviderConfigCard
              key={provider.id}
              providerId={provider.id}
              name={provider.name}
              envVarName={provider.envVarName}
              settings={settings}
              onUpdate={handleProviderUpdate}
              onEdit={() => setEditingProvider(provider)}
              onDelete={() => handleDeleteProvider(provider.id)}
            />
          ))}
        </div>
      </section>

      <Separator className="my-8 sm:my-10" />

      <section className="fade-in-up space-y-5" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("settings.models.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("settings.models.description")}
            </p>
          </div>
          <Button
            onClick={() => setModelDialogOpen(true)}
            className="gap-1.5 rounded-md"
          >
            <Plus className="h-4 w-4" />
            {t("settings.models.add")}
          </Button>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <div className="grid gap-4 p-4 sm:p-6">
            {providers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("settings.models.noProviders")}
              </p>
            )}

            {providers.map((provider) => (
              <Card
                key={provider.id}
                className="rounded-md border-0 bg-muted/40 shadow-none"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    {provider.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {provider.models.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("settings.models.noModels")}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {provider.models.map((model) => {
                        const isCustom = settings.customModels.some(
                          (m) => m.id === model.id && m.providerId === provider.id
                        );
                        return (
                          <li
                            key={model.id}
                            className="flex items-start justify-between gap-3 rounded-md bg-background p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-sm font-medium text-foreground">
                                  {model.name}
                                </span>
                                {!isCustom && (
                                  <Badge
                                    variant="secondary"
                                    className="rounded-md text-[10px]"
                                  >
                                    {t("settings.models.builtIn")}
                                  </Badge>
                                )}
                                {isCustom && (
                                  <Badge
                                    variant="secondary"
                                    className="rounded-md text-[10px]"
                                  >
                                    {t("settings.models.custom")}
                                  </Badge>
                                )}
                              </div>
                              <p className="truncate text-xs text-muted-foreground">
                                {model.id}
                                {model.description && ` · ${model.description}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {model.defaultWidth}×{model.defaultHeight}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              {isCustom ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary"
                                  onClick={() =>
                                    setEditingModel(
                                      settings.customModels.find(
                                        (m) =>
                                          m.id === model.id &&
                                          m.providerId === provider.id
                                      ) ?? null
                                    )
                                  }
                                  aria-label={`Edit model ${model.name}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-md text-muted-foreground/50 hover:text-muted-foreground"
                                      disabled
                                      aria-label={`Cannot edit built-in model ${model.name}`}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">
                                      {t("settings.models.editDisabled")}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {isCustom ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:text-destructive"
                                  onClick={() =>
                                    handleDeleteModel(model.id, provider.id)
                                  }
                                  aria-label={`Delete model ${model.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-md text-muted-foreground/50 hover:text-muted-foreground"
                                      disabled
                                      aria-label={`Cannot delete built-in model ${model.name}`}
                                    >
                                      <Lock className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">
                                      {t("settings.models.deleteDisabled")}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="rounded-md border bg-muted px-4 py-3">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("settings.corsWarning")}
            </p>
          </div>
        </div>
      </section>

      <AddProviderDialog
        open={providerDialogOpen}
        onOpenChange={setProviderDialogOpen}
        onAdd={handleAddProvider}
      />

      <AddModelDialog
        open={modelDialogOpen}
        onOpenChange={setModelDialogOpen}
        onAdd={handleAddModel}
        providers={providers}
        customProviders={customProvidersList}
      />

      <EditProviderDialog
        open={!!editingProvider}
        onOpenChange={(open) => !open && setEditingProvider(null)}
        provider={editingProvider}
        onSave={handleEditProvider}
      />

      <EditModelDialog
        open={!!editingModel}
        onOpenChange={(open) => !open && setEditingModel(null)}
        model={editingModel}
        providers={providers}
        customProviders={customProvidersList}
        onSave={handleEditModel}
      />
    </main>
  );
}