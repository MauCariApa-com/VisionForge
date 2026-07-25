import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Info className="h-5 w-5" />
            {t("about.title")}
          </DialogTitle>
          <DialogDescription>{t("about.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <p className="leading-relaxed text-foreground">{t("about.description")}</p>

          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>{t("about.item1")}</li>
            <li>{t("about.item2")}</li>
            <li>{t("about.item3")}</li>
            <li>{t("about.item4")}</li>
          </ul>

          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            {t("about.footer", { year: new Date().getFullYear() })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}