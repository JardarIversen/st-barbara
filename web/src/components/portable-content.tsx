import { PortableText, type PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "next-sanity";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="leading-relaxed text-foreground/80">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="pt-3 font-display text-3xl font-semibold text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="pt-2 font-display text-2xl font-semibold text-foreground">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-brand pl-5 font-display text-xl italic text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="ml-5 list-disc space-y-2 text-foreground/80">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="ml-5 list-decimal space-y-2 text-foreground/80">
        {children}
      </ol>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
        className="text-primary underline underline-offset-2"
      >
        {children}
      </a>
    ),
  },
};

export default function PortableContent({
  value,
  original,
}: {
  value?: PortableTextBlock[];
  original?: boolean;
}) {
  if (!value?.length) return null;
  return (
    <div
      className={original ? "notranslate space-y-5" : "space-y-5"}
      translate={original ? "no" : undefined}
      lang={original ? "nb" : undefined}
    >
      {original && (
        <p lang="en" className="text-xs text-muted-foreground">
          Norwegian original — English translation not yet available.
        </p>
      )}
      <PortableText value={value} components={components} />
    </div>
  );
}
