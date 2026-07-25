import { useState } from "react";
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

interface AddProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (provider: CustomProvider) => void;
}

export function AddProviderDialog({
  open,
  onOpenChange,
  onAdd,
}: AddProviderDialogProps) {
  const { t } = useI18n();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [envVarName, setEnvVarName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setId("");
    setName("");
    setApiBaseUrl("");
    setEnvVarName("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleAdd = () => {
    const trimmedId = id.trim();
    const trimmedName = name.trim();
    const trimmedUrl = apiBaseUrl.trim();

    if (!trimmedId || !trimmedName || !trimmedUrl) {
      setError(t("settings.dialogs.addProvider.errors.required"));
      return;
    }

    if (/\s/.test(trimmedId)) {
      setError(t("settings.dialogs.addProvider.errors.spaces"));
      return;
    }

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setError(t("settings.dialogs.addProvider.errors.url"));
      return;
    }

    onAdd({
      id: trimmedId,
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
            {t("settings.dialogs.addProvider.title")}
          </DialogTitle>
          <DialogDescription>
            {t("settings.dialogs.addProvider.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="provider-id" className="text-sm font-medium">
              {t("settings.dialogs.addProvider.id")}
            </Label>
            <Input
              id="provider-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. my-provider"
              className="rounded-md"
            />
            <p className="text-xs text-muted-foreground">
              {t("settings.dialogs.addProvider.idHint")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider-name" className="text-sm font-medium">
              {t("settings.dialogs.addProvider.name")}
            </Label>
            <Input
              id="provider-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Provider"
              className="rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider-url" className="text-sm font-medium">
              {t("settings.dialogs.addProvider.url")}
            </Label>
            <Input
              id="provider-url"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider-env" className="text-sm font-medium">
              {t("settings.dialogs.addProvider.env")}
            </Label>
            <Input
              id="provider-env"
              value={envVarName}
              onChange={(e) => setEnvVarName(e.target.value)}
              placeholder="e.g. VITE_MY_PROVIDER_KEY"
              className="rounded-md"
            />
            <p className="text-xs text-muted-foreground">
              {t("settings.dialogs.addProvider.envHint")}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} className="rounded-md">
            {t("settings.dialogs.addProvider.cancel")}
          </Button>
          <Button onClick={handleAdd} className="rounded-md">
            {t("settings.dialogs.addProvider.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}