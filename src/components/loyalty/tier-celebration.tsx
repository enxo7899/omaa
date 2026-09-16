"use client";

import * as React from "react";
import { AwardIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/shared/tier-badge";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

/** Deliberate moment when the signed-in client crosses a threshold. */
export function TierCelebration() {
  const { t, tr } = useI18n();
  const { lastTierChange, session, acknowledgeTierChange } = useStore();
  const change = lastTierChange && session?.role === "client" && lastTierChange.clientId === session.clientId && lastTierChange.to ? lastTierChange : null;
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (change) {
      const id = window.setTimeout(() => setOpen(true), 1150); // let the ring finish filling first
      return () => window.clearTimeout(id);
    }
  }, [change]);

  if (!change?.to) return null;
  const close = () => {
    setOpen(false);
    acknowledgeTierChange();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent showCloseButton={false} className="max-w-sm text-center">
        <div className="animate-pop flex flex-col items-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-wheat-tint text-wheat-3">
            <AwardIcon className="size-8" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-ink">{tr(t.loyalty.unlockedTitle, { tier: t.tiers[change.to.id] })}</DialogTitle>
          <div className="mt-3">
            <TierBadge tier={change.to} size="lg" />
          </div>
          <DialogDescription className="mt-3 text-sm text-ink-2">{tr(t.loyalty.unlockedBody, { pct: change.to.discountPercent })}</DialogDescription>
          <Button className="mt-6 w-full" onClick={close}>
            {t.loyalty.ok}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
