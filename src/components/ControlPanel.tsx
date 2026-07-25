import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dice5, Eraser } from "lucide-react";
import { LabelWithInfo } from "./LabelWithInfo";
import { useI18n } from "@/lib/i18n/i18n-context";
import type {
  AspectRatioOption,
  ImageProviderClient,
} from "@/services/image-generation/types";

interface ControlPanelProps {
  provider: string;
  model: string;
  providers: ImageProviderClient[];
  onProviderChange: (value: string) => void;
  onModelChange: (value: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  onClearNegativePrompt?: () => void;
  steps: number;
  onStepsChange: (value: number) => void;
  cfgScale: number;
  onCfgScaleChange: (value: number) => void;
  width: number;
  onWidthChange: (value: number) => void;
  height: number;
  onHeightChange: (value: number) => void;
  aspectRatio: AspectRatioOption;
  onAspectRatioChange: (value: AspectRatioOption) => void;
  seed: string;
  onSeedChange: (value: string) => void;
  disabled?: boolean;
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  "1:1",
  "2:3",
  "3:2",
  "3:4",
  "4:3",
  "6:19",
  "9:16",
];

function getDimensionsForAspectRatio(ratio: AspectRatioOption): {
  width: number;
  height: number;
} {
  switch (ratio) {
    case "1:1":
      return { width: 1024, height: 1024 };
    case "2:3":
      return { width: 1024, height: 1536 };
    case "3:2":
      return { width: 1024, height: 683 };
    case "3:4":
      return { width: 1024, height: 1365 };
    case "4:3":
      return { width: 1024, height: 768 };
    case "6:19":
      return { width: 1024, height: 3243 };
    case "9:16":
      return { width: 576, height: 1024 };
    default:
      return { width: 1024, height: 1024 };
  }
}

export function ControlPanel({
  provider,
  model,
  providers,
  onProviderChange,
  onModelChange,
  negativePrompt,
  onNegativePromptChange,
  onClearNegativePrompt,
  steps,
  onStepsChange,
  cfgScale,
  onCfgScaleChange,
  width,
  onWidthChange,
  height,
  onHeightChange,
  aspectRatio,
  onAspectRatioChange,
  seed,
  onSeedChange,
  disabled,
}: ControlPanelProps) {
  const { t } = useI18n();
  const currentProvider =
    providers.find((p) => p.id === provider) ?? providers[0];

  const models = currentProvider?.models ?? [];

  const randomizeSeed = () => {
    onSeedChange(String(Math.floor(Math.random() * 1_000_000_000)));
  };

  const handleAspectRatioChange = (value: AspectRatioOption) => {
    onAspectRatioChange(value);
    const dims = getDimensionsForAspectRatio(value);
    onWidthChange(dims.width);
    onHeightChange(dims.height);
  };

  const handleWidthChange = (nextWidth: number) => {
    onWidthChange(nextWidth);
    onHeightChange(resolveHeightForAspectRatio(nextWidth, aspectRatio));
  };

  const handleHeightChange = (nextHeight: number) => {
    onHeightChange(nextHeight);
    onWidthChange(resolveWidthForAspectRatio(nextHeight, aspectRatio));
  };

  return (
    <div className="space-y-5 rounded-md border bg-card p-5 shadow-sm lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("controlPanel.title")}
        </h2>
      </div>

      <div className="space-y-3">
        <LabelWithInfo
          htmlFor="provider-select"
          label={t("controlPanel.provider")}
          info={t("controlPanel.providerInfo")}
        />
        <Select
          value={provider}
          onValueChange={onProviderChange}
          disabled={disabled}
        >
          <SelectTrigger id="provider-select" className="rounded-md">
            <SelectValue placeholder={t("controlPanel.provider")} />
          </SelectTrigger>
          <SelectContent>
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <LabelWithInfo
          htmlFor="model-select"
          label={t("controlPanel.model")}
          info={t("controlPanel.modelInfo")}
        />
        <Select
          value={model}
          onValueChange={onModelChange}
          disabled={disabled || models.length === 0}
        >
          <SelectTrigger id="model-select" className="rounded-md">
            <SelectValue placeholder={t("controlPanel.model")} />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {models.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {t("controlPanel.noModels")}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <LabelWithInfo
            htmlFor="negative-prompt"
            label={t("controlPanel.negativePrompt")}
            info={t("controlPanel.negativePromptInfo")}
          />
          {onClearNegativePrompt && (
            <button
              type="button"
              onClick={onClearNegativePrompt}
              disabled={disabled || !negativePrompt}
              className="inline-flex text-muted-foreground transition-colors hover:text-foreground disabled:opacity-0"
              aria-label={t("controlPanel.clearNegativePrompt")}
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <Textarea
          id="negative-prompt"
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          placeholder={t("controlPanel.negativePlaceholder")}
          className="min-h-24 resize-none rounded-md border-input bg-background"
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <LabelWithInfo
            htmlFor="width"
            label={t("controlPanel.width")}
            info={t("controlPanel.widthInfo")}
          />
          <Input
            id="width"
            type="number"
            min={1}
            max={2048}
            value={width}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            className="rounded-md"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <LabelWithInfo
            htmlFor="height"
            label={t("controlPanel.height")}
            info={t("controlPanel.heightInfo")}
          />
          <Input
            id="height"
            type="number"
            min={1}
            max={2048}
            value={height}
            onChange={(e) => handleHeightChange(Number(e.target.value))}
            className="rounded-md"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-3">
        <LabelWithInfo
          htmlFor="aspect-ratio"
          label={t("controlPanel.aspectRatio")}
          info={t("controlPanel.aspectRatioInfo")}
        />
        <Select
          value={aspectRatio}
          onValueChange={(v) => handleAspectRatioChange(v as AspectRatioOption)}
          disabled={disabled}
        >
          <SelectTrigger id="aspect-ratio" className="rounded-md">
            <SelectValue placeholder={t("controlPanel.aspectRatio")} />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_RATIOS.map((ratio) => (
              <SelectItem key={ratio} value={ratio}>
                {ratio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <LabelWithInfo
              htmlFor="steps"
              label={t("controlPanel.steps")}
              info={t("controlPanel.stepsInfo")}
            />
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium tabular-nums text-primary">
              {steps}
            </span>
          </div>
          <Slider
            id="steps"
            min={1}
            max={50}
            step={1}
            value={[steps]}
            onValueChange={([v]) => onStepsChange(v)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <LabelWithInfo
              htmlFor="cfg"
              label={t("controlPanel.cfg")}
              info={t("controlPanel.cfgInfo")}
            />
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium tabular-nums text-primary">
              {cfgScale.toFixed(1)}
            </span>
          </div>
          <Slider
            id="cfg"
            min={1}
            max={15}
            step={0.5}
            value={[cfgScale]}
            onValueChange={([v]) => onCfgScaleChange(v)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-3">
        <LabelWithInfo
          htmlFor="seed"
          label={t("controlPanel.seed")}
          info={t("controlPanel.seedInfo")}
        />
        <div className="flex gap-2">
          <Input
            id="seed"
            type="number"
            min={0}
            value={seed}
            onChange={(e) => onSeedChange(e.target.value)}
            placeholder="Random"
            className="rounded-md"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={randomizeSeed}
            disabled={disabled}
            aria-label={t("controlPanel.randomizeSeed")}
          >
            <Dice5 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function resolveHeightForAspectRatio(width: number, ratio: AspectRatioOption): number {
  switch (ratio) {
    case "1:1":
      return width;
    case "2:3":
      return Math.round(width * (3 / 2));
    case "3:2":
      return Math.round(width * (2 / 3));
    case "3:4":
      return Math.round(width * (4 / 3));
    case "4:3":
      return Math.round(width * (3 / 4));
    case "6:19":
      return Math.round(width * (19 / 6));
    case "9:16":
      return Math.round(width * (16 / 9));
    default:
      return width;
  }
}

function resolveWidthForAspectRatio(height: number, ratio: AspectRatioOption): number {
  switch (ratio) {
    case "1:1":
      return height;
    case "2:3":
      return Math.round(height * (2 / 3));
    case "3:2":
      return Math.round(height * (3 / 2));
    case "3:4":
      return Math.round(height * (3 / 4));
    case "4:3":
      return Math.round(height * (4 / 3));
    case "6:19":
      return Math.round(height * (6 / 19));
    case "9:16":
      return Math.round(height * (9 / 16));
    default:
      return height;
  }
}