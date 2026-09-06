import {BellIcon} from '@sanity/icons/Bell'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {ClockIcon} from '@sanity/icons/Clock'
import {DocumentPdfIcon} from '@sanity/icons/DocumentPdf'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {PinIcon} from '@sanity/icons/Pin'
import {TimelineIcon} from '@sanity/icons/Timeline'
import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Innhold')
    .items([
      S.listItem()
        .title('Tidslinje')
        .icon(TimelineIcon)
        .child(
          S.list()
            .title('Tidslinje')
            .items([
              S.documentTypeListItem('event').title('Hendelser').icon(CalendarIcon),
              S.documentTypeListItem('announcement').title('Kunngjøringer').icon(BellIcon),
            ]),
        ),
      S.listItem()
        .title('Messer')
        .icon(ClockIcon)
        .child(
          S.list()
            .title('Messer')
            .items([
              S.documentTypeListItem('recurringMassSchedule')
                .title('Faste messeplaner')
                .icon(ClockIcon),
              S.documentTypeListItem('massException')
                .title('Avlysninger og endringer')
                .icon(CalendarIcon),
              S.documentTypeListItem('massText').title('Messetekster').icon(DocumentTextIcon),
            ]),
        ),
      S.documentTypeListItem('bulletin').title('Søndagsblader').icon(DocumentPdfIcon),
      S.documentTypeListItem('article').title('Artikler og brev').icon(DocumentTextIcon),
      S.divider(),
      S.documentTypeListItem('place').title('Steder').icon(PinIcon),
    ])
