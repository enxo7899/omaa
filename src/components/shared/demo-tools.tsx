"use client";

import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/page-header";
import { SwitchRow } from "@/components/shared/switch-row";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export function DemoTools() {
  const { t } = useI18n();
  const { demo, setDemo, resetDemo } = useStore();
  return (
    <section className="mt-8 border-t border-line pt-6">
      <SectionHeader title={t.account.demoTools} body={t.common.aboutDemoTitle} />
      <div className="mt-2 divide-y divide-line">
        <SwitchRow checked={demo.failNext} onChange={(v) => setDemo({ failNext: v })} title={t.account.simulateFail} body={t.account.simulateFailBody} onLabel={t.account.on} offLabel={t.account.off} />
        <SwitchRow checked={demo.slow} onChange={(v) => setDemo({ slow: v })} title={t.account.simulateSlow} body={t.account.simulateSlowBody} onLabel={t.account.on} offLabel={t.account.off} />
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink">{t.account.resetData}</div>
            <div className="mt-0.5 text-xs text-ink-3">{t.account.resetDataBody}</div>
          </div>
          <Button
            variant="outline"
            className="shrink-0 self-start sm:self-auto"
            onClick={async () => {
              await resetDemo();
              toast.success(t.account.resetDone);
            }}
          >
            <RotateCcwIcon aria-hidden="true" />
            {t.account.resetData}
          </Button>
        </div>
      </div>
      <p className="mt-4 max-w-[64ch] text-xs leading-5 text-ink-3">{t.common.aboutDemoBody}</p>
    </section>
  );
}

