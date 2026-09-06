import { PortableText, type PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "next-sanity";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="leading-relaxed text-ink/80">{children}</p>,
    h2: ({ children }) => (
      <h2 className="pt-3 font-display text-3xl font-semibold text-ink">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="pt-2 font-display text-2xl font-semibold text-ink">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-gold pl-5 font-display text-xl italic text-stone">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="ml-5 list-disc space-y-2 text-ink/80">{children}</ul>,
    number: ({ children }) => <ol className="ml-5 list-decimal space-y-2 text-ink/80">{children}</ol>,
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
        className="text-burgundy underline underline-offset-2"
      >
        {children}
      </a>
    ),
  },
};

export default function PortableContent({ value }: { value?: PortableTextBlock[] }) {
  if (!value?.length) return null;
  return (
    <div className="space-y-5">
      <PortableText value={value} components={components} />
    </div>
  );
}
