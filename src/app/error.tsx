"use client";

import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";
import { PublicFrame } from "@/components/shell/public-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return (
    <PublicFrame>
      <EmptyState
        icon={TriangleAlertIcon}
        title={t.common.errorTitle}
        body={t.common.errorBody}
        action={
          <>
            <Button onClick={reset}>{t.common.reload}</Button>
            <Button asChild variant="outline">
              <Link href="/">{t.common.goHome}</Link>
            </Button>
          </>
        }
      />
    </PublicFrame>
  );
}
