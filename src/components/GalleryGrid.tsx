import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { HistoryItem } from "@/lib/history-store";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Download, Trash2, Maximize2, Images } from "lucide-react";

interface GalleryGridProps {
  items: HistoryItem[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function GalleryGrid({ items, onDelete, onClear }: GalleryGridProps) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  const handleDownload = (item: HistoryItem) => {
    const link = document.createElement("a");
    link.href = item.imageDataUrl;
    link.download = `visionforge-${item.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed bg-card/50 p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-secondary">
          <Images className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium text-foreground">{t("gallery.noHistory")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("gallery.noHistoryDescription")}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("gallery.title")}</h2>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-destructive">
          {t("gallery.clearHistory")}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            onClick={() => setSelected(item)}
          >
            <img
              src={item.imageDataUrl}
              alt={item.prompt}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 transition-transform group-hover:translate-y-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md bg-white/90 text-foreground hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(item);
                }}
                aria-label={t("gallery.downloadAria")}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md bg-white/90 text-destructive hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                aria-label={t("gallery.deleteAria")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-4 w-4 text-white drop-shadow" />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-md p-0">
          {selected && (
            <>
              <div className="relative bg-secondary/50">
                <img
                  src={selected.imageDataUrl}
                  alt={selected.prompt}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
              <div className="p-5">
                <DialogHeader>
                  <DialogTitle className="text-base font-medium leading-relaxed">
                    {selected.prompt}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    {selected.width}×{selected.height} • {selected.provider} {selected.model} •{" "}
                    {new Date(selected.createdAt).toLocaleString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-md"
                    onClick={() => handleDownload(selected)}
                  >
                    <Download className="h-4 w-4" />
                    {t("gallery.download")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5 rounded-md"
                    onClick={() => {
                      onDelete(selected.id);
                      setSelected(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("gallery.delete")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}