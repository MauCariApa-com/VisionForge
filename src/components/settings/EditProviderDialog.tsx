import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomProvider } from "@/services/image-generation/types";
import { useI18n } from "@/lib/i18n/i18n-context";

interface EditProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: CustomProvider | null;
  onSave: (provider: CustomProvider) => void;
}

export function EditProviderDialog({
  open,
  onOpenChange,
  provider,
  onSave,
}: EditProviderDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [envVarName, setEnvVarName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (provider) {
      setName(provider.name);
      setApiBaseUrl(provider.apiBaseUrl);
      setEnvVarName(provider.envVarName ?? "");
      setError(null);
    }
  }, [provider]);

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedUrl = apiBaseUrl.trim();

    if (!trimmedName || !trimmedUrl || !provider) {
      setError(t("settings.dialogs.addProvider.errors.required"));
      return;
    }

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setError(t("settings.dialogs.addProvider.errors.url"));
      return;
    }

    onSave({
      ...provider,
      name: trimmedName,
      apiBaseUrl: trimmedUrl,
      envVarName: envVarName.trim() || undefined,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t("settings.dialogs.editProvider.title")}
          </DialogTitle>
          <DialogDescription>
            {t("settings.dialogs.editProvider.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("settings.dialogs.editProvider.id")}
            </Label>
            <Input
              value={provider?.id ?? ""}
              disabled
              className="rounded-md bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              {t("settings.dialogs.editProvider.idHint")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-provider-name" className="text-sm font-medium">
              {t("settings.dialogs.editProvider.name")}
            </Label>
            <Input
              id="edit-provider-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Provider"
              className="rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-provider-url" className="text-sm font-medium">
              {t("settings.dialogs.editProvider.url")}
            </Label>
            <Input
              id="edit-provider-url"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-provider-env" className="text-sm font-medium">
              {t("settings.dialogs.editProvider.env")}
            </Label>
            <Input
              id="edit-provider-env"
              value={envVarName}
              onChange={(e) => setEnvVarName(e.target.value)}
              placeholder="e.g. VITE_MY_PROVIDER_KEY"
              className="rounded-md"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} className="rounded-md">
            {t("settings.dialogs.addProvider.cancel")}
          </Button>
          <Button onClick={handleSave} className="rounded-md">
            {t("settings.dialogs.editProvider.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}