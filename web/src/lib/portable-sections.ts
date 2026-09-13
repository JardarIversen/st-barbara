import type { PortableTextBlock } from "next-sanity";

export function splitPortableSections(blocks: PortableTextBlock[] = []) {
  const introduction: PortableTextBlock[] = [];
  const sections: Array<{
    heading: PortableTextBlock;
    body: PortableTextBlock[];
  }> = [];

  for (const block of blocks) {
    if (block._type === "block" && block.style === "h2") {
      sections.push({ heading: block, body: [] });
    } else if (sections.length) {
      sections[sections.length - 1].body.push(block);
    } else {
      introduction.push(block);
    }
  }

  return { introduction, sections };
}
