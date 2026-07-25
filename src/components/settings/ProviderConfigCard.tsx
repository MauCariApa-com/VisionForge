import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiKeyInput } from "./ApiKeyInput";
import type { AppSettings } from "@/lib/settings-store";
import { updateProviderConfig } from "@/lib/settings-store";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Trash2, Pencil } from "lucide-react";

interface ProviderConfigCardProps {
  providerId: string;
  name: string;
  envVarName?: string;
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProviderConfigCard({
  providerId,
  name,
  envVarName,
  settings,
  onUpdate,
  onEdit,
  onDelete,
}: ProviderConfigCardProps) {
  const { t } = useI18n();
  const config = settings.providerConfigs[providerId] ?? { apiKey: "" };
  const [inputValue, setInputValue] = useState(config.apiKey);
  const [accountIdValue, setAccountIdValue] = useState(settings.accountId ?? "");

  useEffect(() => {
    setInputValue(config.apiKey);
    setAccountIdValue(settings.accountId ?? "");
  }, [config.apiKey, settings.accountId]);

  const handleSaveKey = () => {
    const next = updateProviderConfig(settings, providerId, {
      apiKey: inputValue,
      envVarName,
    });
    if (providerId === "cloudflare") {
      next.apiKey = inputValue;
      next.provider = providerId;
      next.accountId = accountIdValue;
    }
    onUpdate(next);
  };

  const isSetUp = Boolean(config.apiKey);

  return (
    <Card className="rounded-md border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {name}
          </CardTitle>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary"
                onClick={onEdit}
                aria-label={t("settings.providerCard.editAria", { name })}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive"
                onClick={onDelete}
                aria-label={t("settings.providerCard.deleteAria", { name })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Badge
              variant="secondary"
              className={`rounded-md text-xs font-medium ${
                isSetUp
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <span
                className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-md ${
                  isSetUp ? "bg-primary" : "bg-muted-foreground"
                }`}
              />
              {isSetUp ? t("settings.providerCard.setup") : t("settings.providerCard.notSetup")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="api-key" className="border-b-0">
            <AccordionTrigger className="-mx-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-muted/50 hover:no-underline">
              {t("settings.providerCard.apiKey")}
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-2">
              <ApiKeyInput
                value={inputValue}
                onChange={setInputValue}
                onSave={handleSaveKey}
                placeholder={`Paste your ${name} API key`}
                label=""
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {t("settings.providerCard.keyStorage")}
              </p>
            </AccordionContent>
          </AccordionItem>

          {providerId === "cloudflare" && (
            <AccordionItem value="account-id" className="border-b-0">
              <AccordionTrigger className="-mx-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-muted/50 hover:no-underline">
                {t("settings.providerCard.accountId")}
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-2">
                <div className="space-y-3">
                  <Label htmlFor={`account-id-${providerId}`} className="text-sm font-medium">
                    {t("settings.providerCard.accountIdLabel")}
                  </Label>
                  <Input
                    id={`account-id-${providerId}`}
                    value={accountIdValue}
                    onChange={(e) => setAccountIdValue(e.target.value)}
                    placeholder={t("settings.providerCard.accountIdPlaceholder")}
                    className="h-10 w-full rounded-md"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("settings.providerCard.accountIdHint")}
                  </p>
                  <Button onClick={handleSaveKey} className="h-10 w-full rounded-md">
                    {t("settings.providerCard.saveAccountId")}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}