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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomModel, CustomProvider } from "@/services/image-generation/types";
import { ImageProviderClient } from "@/services/image-generation/types";
import { useI18n } from "@/lib/i18n/i18n-context";

interface EditModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: CustomModel | null;
  providers: ImageProviderClient[];
  customProviders: CustomProvider[];
  onSave: (model: CustomModel, originalModel: CustomModel) => void;
}

export function EditModelDialog({
  open,
  onOpenChange,
  model,
  providers,
  customProviders,
  onSave,
}: EditModelDialogProps) {
  const { t } = useI18n();
  const [providerId, setProviderId] = useState("");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [width, setWidth] = useState("1024");
  const [height, setHeight] = useState("1024");
  const [error, setError] = useState<string | null>(null);

  const allProviderOptions = Array.from(
    new Map(
      [...providers, ...customProviders].map((p) => [p.id, { id: p.id, name: p.name }])
    ).values()
  );

  useEffect(() => {
    if (model) {
      setProviderId(model.providerId);
      setId(model.id);
      setName(model.name);
      setDescription(model.description ?? "");
      setWidth(String(model.defaultWidth));
      setHeight(String(model.defaultHeight));
      setError(null);
    }
  }, [model]);

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  const handleSave = () => {
    const trimmedId = id.trim();
    const trimmedName = name.trim();
    const parsedWidth = Number(width);
    const parsedHeight = Number(height);

    if (!providerId) {
      setError(t("settings.dialogs.addModel.errors.provider"));
      return;
    }
    if (!trimmedId || !trimmedName) {
      setError(t("settings.dialogs.addModel.errors.required"));
      return;
    }
    if (
      !Number.isFinite(parsedWidth) ||
      parsedWidth <= 0 ||
      !Number.isFinite(parsedHeight) ||
      parsedHeight <= 0
    ) {
      setError(t("settings.dialogs.addModel.errors.dimensions"));
      return;
    }

    if (!model) return;

    onSave(
      {
        id: trimmedId,
        providerId,
        name: trimmedName,
        description: description.trim() || undefined,
        defaultWidth: parsedWidth,
        defaultHeight: parsedHeight,
      },
      model
    );
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t("settings.dialogs.editModel.title")}
          </DialogTitle>
          <DialogDescription>
            {t("settings.dialogs.editModel.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-model-provider" className="text-sm font-medium">
              {t("settings.dialogs.editModel.provider")}
            </Label>
            <Select value={providerId} onValueChange={setProviderId}>
              <SelectTrigger id="edit-model-provider" className="rounded-md">
                <SelectValue placeholder={t("settings.dialogs.editModel.providerPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {allProviderOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-model-id" className="text-sm font-medium">
              {t("settings.dialogs.editModel.id")}
            </Label>
            <Input
              id="edit-model-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. my-model-v1"
              className="rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-model-name" className="text-sm font-medium">
              {t("settings.dialogs.editModel.name")}
            </Label>
            <Input
              id="edit-model-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Model v1"
              className="rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-model-description" className="text-sm font-medium">
              {t("settings.dialogs.editModel.description")}
            </Label>
            <Textarea
              id="edit-model-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("settings.dialogs.editModel.descriptionPlaceholder")}
              className="min-h-20 resize-none rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-model-width" className="text-sm font-medium">
                {t("settings.dialogs.editModel.width")}
              </Label>
              <Input
                id="edit-model-width"
                type="number"
                min={1}
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model-height" className="text-sm font-medium">
                {t("settings.dialogs.editModel.height")}
              </Label>
              <Input
                id="edit-model-height"
                type="number"
                min={1}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="rounded-md"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} className="rounded-md">
            {t("settings.dialogs.addModel.cancel")}
          </Button>
          <Button onClick={handleSave} className="rounded-md">
            {t("settings.dialogs.editModel.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}