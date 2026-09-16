"use client";

import * as React from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { cn } from "cn";

/** Square, space-reserved product image with hotlink fallback. */
export function ProductImage({ product, className, sizes = "96px", priority }: { product: Product; className?: string; sizes?: string; priority?: boolean }) {
  const [src, setSrc] = React.useState(product.image);
  return (
    <div className={cn("relative aspect-square shrink-0 overflow-hidden rounded-control bg-paper-2", className)}>
      <Image
        src={src}
        alt={product.name}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain p-1"
        onError={() => setSrc(product.imageFallback)}
        unoptimized={src.startsWith("http")}
      />
    </div>
  );
}
