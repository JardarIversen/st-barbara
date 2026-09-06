import { Fragment } from "react";

// In particular, Google otherwise interprets the Norwegian place name Mo as Missouri.
// Keep the surrounding whitespace inside the protected span as well: Google's
// inline rewriting otherwise joins the name to the words on either side.
const placeNames = /(\s*(?<!\p{L})Mo(?!\p{L})[.,;:]?\s*)/gu;

export default function PlaceText({ children }: { children: string }) {
  return children.split(placeNames).map((part, index) =>
    index % 2 ? (
      <span key={index} translate="no" className="notranslate">
        {part}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
