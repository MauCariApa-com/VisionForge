import { useState, useLayoutEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { Sparkles, Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-context";

export function Layout() {
  const [darkMode, setDarkMode] = useState(false);
  const { lang, setLang, t } = useI18n();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="Go to home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                VisionForge
              </h1>
              <p className="hidden text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:block">
                {t("layout.subtitle")}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border bg-card p-0.5">
              <Button
                variant={lang === "en" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setLang("en")}
                className="h-7 rounded-sm px-2 text-xs font-medium"
                aria-label="Switch to English"
              >
                EN
              </Button>
              <Button
                variant={lang === "id" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setLang("id")}
                className="h-7 rounded-sm px-2 text-xs font-medium"
                aria-label="Ganti ke Bahasa Indonesia"
              >
                ID
              </Button>
            </div>

            <div className="flex items-center gap-2 rounded-md border bg-card px-2 py-1">
              <Sun className="h-3.5 w-3.5 text-muted-foreground" />
              <Switch
                id="theme-toggle"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                aria-label={t("layout.toggleTheme")}
              />
              <Moon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}