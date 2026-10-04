"use client";

import Link from "@/i18n/link";
import ContentLanguage from "./content-language";
import { buttonVariants } from "./ui/button";
import type { CalendarAnnouncement } from "@/sanity/types";

export default function AnnouncementTags({ items }: { items?: CalendarAnnouncement[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/kunngjoringer/${item.slug}`}
          className={buttonVariants({ variant: "outline", size: "xs" })}
        >
          <ContentLanguage original={item.originalFields?.includes("title")}>
            {item.title}
          </ContentLanguage>
        </Link>
      ))}
    </div>
  );
}
