"use client";

import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { PublicFrame } from "@/components/shell/public-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <PublicFrame>
      <EmptyState
        icon={CompassIcon}
        title={t.common.notFoundTitle}
        body={t.common.notFoundBody}
        action={
          <Button asChild>
            <Link href="/">{t.common.goHome}</Link>
          </Button>
        }
      />
    </PublicFrame>
  );
}
