"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, ShieldIcon, StoreIcon, UserRoundIcon } from "lucide-react";
import { PublicFrame } from "@/components/shell/public-frame";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function RoleSwitcherPage() {
  const { t } = useI18n();
  const { login } = useStore();
  const router = useRouter();

  const enterOwner = () => {
    login({ role: "owner" });
    router.push("/owner");
  };

  const cardClass =
    "group flex w-full items-center gap-4 rounded-card border border-line bg-white p-5 text-left shadow-rest transition-[border-color,box-shadow] hover:border-forest hover:shadow-float focus-visible:border-forest lg:flex-col lg:items-start lg:gap-6 lg:p-6";

  return (
    <PublicFrame>
      <div className="max-w-[60ch]">
        <h1 className="text-2xl font-extrabold tracking-[-0.01em] text-ink lg:text-3xl">{t.login.title}</h1>
        <p className="mt-2 text-base text-ink-2">{t.login.subtitle}</p>
      </div>

      <div className="mt-8 grid gap-3 lg:mt-12 lg:grid-cols-2 lg:gap-4">
        <Link href="/login/agent" className={cardClass}>
          <RoleIcon icon={UserRoundIcon} />
          <RoleText title={t.login.agentTitle} body={t.login.agentBody} meta={t.login.pickAgentSub} />
          <Chevron />
        </Link>
        <Link href="/login/client" className={cardClass}>
          <RoleIcon icon={StoreIcon} />
          <RoleText title={t.login.clientTitle} body={t.login.clientBody} meta={t.login.pickClientSub} />
          <Chevron />
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={enterOwner}
          className="inline-flex h-10 items-center gap-2 rounded-control border border-line-strong bg-white px-3 text-xs font-semibold text-ink-2 transition-colors hover:border-forest hover:text-forest"
        >
          <ShieldIcon className="size-4" aria-hidden="true" />
          {t.login.adminLink}
        </button>
        <span className="text-xs text-ink-3">{t.login.adminHint}</span>
      </div>

      <section className="mt-10 max-w-[64ch] border-t border-line pt-6 lg:mt-16">
        <h2 className="text-sm font-semibold text-ink">{t.common.aboutDemoTitle}</h2>
        <p className="mt-1 text-xs leading-5 text-ink-3">{t.common.aboutDemoBody}</p>
      </section>
    </PublicFrame>
  );
}

function RoleIcon({ icon: Icon }: { icon: typeof StoreIcon }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-control bg-forest-tint text-forest transition-colors group-hover:bg-forest group-hover:text-white">
      <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}

function RoleText({ title, body, meta }: { title: string; body: string; meta: string }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block text-lg font-bold text-ink">{title}</span>
      <span className="mt-1 block text-sm text-ink-2">{body}</span>
      <span className="mt-3 block text-xs font-medium text-ink-3">{meta}</span>
    </span>
  );
}

function Chevron() {
  return <ChevronRightIcon className="size-5 shrink-0 text-ink-4 transition-colors group-hover:text-forest lg:hidden" aria-hidden="true" />;
}
