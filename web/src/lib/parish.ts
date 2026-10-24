export const contact = {
  name: "St. Barbara menighet",
  tagline: "Den katolske kirke i Kongsberg",
  phone: "944 25 982",
  email: "kongsberg@katolsk.no",
  vipps: "703819",
  konto: "3000 52 26089",
};

export const priests = [
  {
    name: "P. Trym Hellevig",
    role: "Sogneadministrator",
    phone: "944 25 982",
    image: "/images/p-trym.webp",
  },
  {
    name: "P. Waldemar Piotr Bożek",
    role: "Polsk sjelesorg · kapellan i St. Laurentius, Drammen",
    phone: "93 93 20 93",
    image: "/images/p-waldemar.webp",
  },
  {
    name: "P. Joel Salas Tobón",
    role: "Spansk sjelesorg",
    phone: "459 78 056",
    image: "/images/p-joel.webp",
  },
];

export const parishCouncil = [
  { role: "Sogneadministrator", names: ["P. Trym Hellevig"] },
  { role: "Leder", names: ["Khai Quang Tran"] },
  { role: "Nestleder", names: ["Karine Gallot-Lavallée"] },
  { role: "Sekretær", names: ["Vegard Kristoffersen"] },
  {
    role: "Medlemmer",
    names: ["Katarzyna Jachimowicz", "Izabela Mazur", "Lancy Lopes"],
  },
];

// Numbers are stored as Norwegian national numbers and always shown with +47, never split across lines.
export const phoneLabel = (phone: string) =>
  `+47 ${phone}`.replace(/ /g, "\u00a0");
export const phoneHref = (phone: string) =>
  `tel:+47${phone.replace(/\s/g, "")}`;

// Everything about Notodden goes through this contact, not the parish priest.
export const notoddenContact = {
  name: "Khai Quang Tran",
  role: "Leder av menighetsrådet",
  phone: "932 28 489",
  email: "Khaianhnor@yahoo.no",
};

export const municipalities =
  "Kongsberg, deler av Øvre Eiker, Modum, Sigdal, Flesberg, Rollag, Nore og Uvdal, Notodden, Hjartdal, Tinn, Vinje, Tokke, Seljord og Kviteseid";
