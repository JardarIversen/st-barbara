"use client";

import Link from "@/i18n/link";
import ContentLanguage from "./content-language";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import type { CalendarAnnouncement } from "@/sanity/types";

export default function AnnouncementTags({ items }: { items?: CalendarAnnouncement[] }) {
  if (!items?.length) return null;
  return (
    <div className="relative z-10 flex max-w-full flex-wrap items-center gap-1.5">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/kunngjoringer/${item.slug}`}
          className={cn(buttonVariants({ variant: "tag", size: "xs" }), "max-w-full")}
          title={item.title}
        >
          <span className="truncate">
            <ContentLanguage original={item.originalFields?.includes("title")}>
              {item.title}
            </ContentLanguage>
          </span>
        </Link>
      ))}
    </div>
  );
}
