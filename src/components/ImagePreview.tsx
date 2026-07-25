import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, AlertCircle, ImageIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

interface ImagePreviewProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  aspectRatio: string;
}

export function ImagePreview({
  imageUrl,
  isLoading,
  error,
  onRetry,
  aspectRatio,
}: ImagePreviewProps) {
  const { t } = useI18n();

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `visionforge-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `visionforge-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="relative flex min-h-[340px] flex-col overflow-hidden rounded-md border bg-card shadow-sm">
      {error ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md rounded-md">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>{t("imagePreview.generationFailed")}</AlertTitle>
            <AlertDescription className="space-y-3">
              <p className="text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={onRetry} className="rounded-md">
                {t("imagePreview.tryAgain")}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      ) : isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-6 h-40 w-full max-w-xs overflow-hidden rounded-md shimmer" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-md border-2 border-primary/30 border-t-primary" />
            <span className="text-sm font-medium">{t("imagePreview.dreaming")}</span>
          </div>
        </div>
      ) : imageUrl ? (
        <>
          <div className="relative flex flex-1 items-center justify-center bg-secondary/50 p-4">
            <img
              src={imageUrl}
              alt="Generated result"
              className="max-h-[640px] w-auto max-w-full rounded-md object-contain shadow-md"
            />
          </div>
          <div className="flex items-center justify-between border-t bg-card px-5 py-3">
            <span className="text-xs text-muted-foreground">{aspectRatio}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-1.5 rounded-md"
            >
              <Download className="h-4 w-4" />
              {t("imagePreview.download")}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-md bg-secondary">
            <ImageIcon className="h-10 w-10 text-primary/60" />
          </div>
          <p className="text-base font-medium text-foreground">{t("imagePreview.emptyTitle")}</p>
          <p className="mt-1 max-w-xs text-sm">{t("imagePreview.emptyDescription")}</p>
        </div>
      )}
    </Card>
  );
}