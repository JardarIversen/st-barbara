import type { ReactNode } from "react";

export default function ContentLanguage({
  original,
  children,
}: {
  original?: boolean;
  children: ReactNode;
}) {
  if (!original) return <>{children}</>;
  return (
    <span translate="no" lang="nb" className="notranslate">
      {children}{" "}
      <small
        lang="en"
        className="ml-1 font-sans text-[0.65rem] font-normal text-muted-foreground"
      >
        (Norwegian original)
      </small>
    </span>
  );
}
