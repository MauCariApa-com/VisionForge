import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, Sparkles, Shuffle, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  disabled?: boolean;
}

const EXAMPLE_PROMPTS = [
  "A serene mountain lake at sunrise with mist rising off the water",
  "A futuristic city skyline at night with neon lights and flying cars",
  "A cute robot gardening in a greenhouse full of exotic plants",
  "An impressionist oil painting of a bustling Parisian café",
  "A mystical forest filled with glowing fungi and floating lanterns",
  "A steampunk airship soaring above golden clouds at sunset",
  "A cozy reading nook inside a giant old library with floating books",
  "A cyberpunk street market in the rain, neon signs reflecting on wet pavement",
  "A dragon sleeping on a pile of glowing crystals in a volcanic cave",
  "A serene Japanese zen garden with cherry blossoms and a koi pond",
  "A retro 80s diner on the edge of a neon desert at dusk",
  "An astronaut planting flowers on the surface of Mars",
  "A whale swimming through a sky full of stars and constellations",
  "A magical baker decorating a tower of cupcakes in a fantasy kitchen",
  "A hidden waterfall inside a lush overgrown ancient temple",
  "A friendly ghost reading a book in a candlelit Victorian study",
];

const SUGGESTION_COUNT = 5;

function getRandomSuggestions(count: number): string[] {
  const shuffled = [...EXAMPLE_PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  onClear,
  disabled,
}: PromptInputProps) {
  const { t } = useI18n();
  const [suggestions, setSuggestions] = useState<string[]>(() =>
    getRandomSuggestions(SUGGESTION_COUNT)
  );

  const shuffleSuggestions = () => {
    setSuggestions(getRandomSuggestions(SUGGESTION_COUNT));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              onSubmit();
            }
          }}
          placeholder={t("promptInput.placeholder")}
          className="min-h-40 resize-none rounded-md border-input bg-card px-5 py-5 pr-12 text-base shadow-sm transition-shadow focus-visible:shadow-md focus-visible:ring-primary/30"
          disabled={disabled}
          aria-label="Image prompt"
        />
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
          {value.length} {t("promptInput.chars")}
        </div>
        {onClear && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-0"
            onClick={onClear}
            disabled={disabled || !value}
            aria-label={t("promptInput.clearPrompt")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("promptInput.inspiration")}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={shuffleSuggestions}
            disabled={disabled}
            className="h-7 gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground hover:text-primary"
            aria-label={t("promptInput.shuffle")}
          >
            <Shuffle className="h-3.5 w-3.5" />
            {t("promptInput.shuffle")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((prompt) => (
            <Badge
              key={prompt}
              variant="secondary"
              className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-normal text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              onClick={() => onChange(prompt)}
              aria-label={t("promptInput.usePrompt", { prompt })}
            >
              <Sparkles className="mr-1.5 h-3 w-3"/>
              {prompt.length > 40 ? `${prompt.slice(0, 40)}…` : prompt}
            </Badge>
          ))}
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        size="lg"
        className="h-14 w-full rounded-md text-lg font-semibold shadow-md transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
      >
        {disabled ? (
          <span className="flex items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-md border-2 border-primary-foreground/30 border-t-primary-foreground" />
            {t("promptInput.generating")}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            {t("promptInput.generate")}
          </span>
        )}
      </Button>
    </div>
  );
}