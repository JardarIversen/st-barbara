// Short explanations for people new to the Mass, shown under each part when «Forklaringer» is on.
// Keys are the parts that liturgihefte/til-nettsiden.py marks in the booklet.
// UTKAST: skrevet av Claude, skal godkjennes av p. Trym før de regnes som ferdige.
// The communion text repeats the back cover of the booklet, which p. Trym has seen.

export const MASS_EXPLANATIONS: Record<string, { nb: string; en: string }> = {
  "introductory-rites": {
    nb: "Messen begynner. Vi står, gjør korsets tegn sammen med presten og svarer på hilsenen hans. Før vi hører Guds ord, ber vi om tilgivelse for våre synder.",
    en: "Mass begins. We stand, make the Sign of the Cross with the priest and answer his greeting. Before we hear God's word, we ask forgiveness for our sins.",
  },
  kyrie: {
    nb: "«Kyrie eleison» er gresk og betyr «Herre, miskunn deg». Det er et av de eldste ropene i messen.",
    en: "“Kyrie eleison” is Greek for “Lord, have mercy”. It is one of the oldest cries of the Mass.",
  },
  gloria: {
    nb: "Lovsangen begynner med englenes ord julenatt (Luk 2,14). Den synges på søndager, høytider og fester, men ikke på søndagene i advent og fastetiden.",
    en: "The hymn begins with the words of the angels on Christmas night (Luke 2:14). It is sung on Sundays, solemnities and feasts, but not on the Sundays of Advent and Lent.",
  },
  collect: {
    nb: "Presten sier «La oss be», og det blir stille et øyeblikk så alle kan be i sitt hjerte. Så samler han bønnene i dagens kirkebønn, og vi gjør den til vår med «Amen».",
    en: "The priest says “Let us pray”, and there is a moment of silence so that everyone can pray in their heart. He then gathers our prayers in the Collect of the day, and we make it ours with “Amen”.",
  },
  word: {
    nb: "Nå taler Gud til oss gjennom Den hellige skrift. Vi sitter og lytter. På søndager er det to lesninger før evangeliet, på hverdager én.",
    en: "Now God speaks to us through Holy Scripture. We sit and listen. On Sundays there are two readings before the Gospel, on weekdays one.",
  },
  psalm: {
    nb: "En salme fra Salmenes bok. Forsangeren synger versene, og alle svarer med omkvedet.",
    en: "A psalm from the Book of Psalms. The cantor sings the verses, and everyone answers with the response.",
  },
  acclamation: {
    nb: "Vi reiser oss for å hilse Kristus, som taler til oss i evangeliet. I fastetiden synges ikke halleluja.",
    en: "We stand to greet Christ, who speaks to us in the Gospel. In Lent the Alleluia is not sung.",
  },
  gospel: {
    nb: "Evangeliet forteller om Jesu ord og gjerninger. Når presten hilser evangeliet, tegner vi et lite kors på panne, munn og bryst: Guds ord i tanken, på leppene og i hjertet.",
    en: "The Gospel tells of the words and deeds of Jesus. As the priest announces it, we trace a small cross on forehead, lips and heart: God's word in our mind, on our lips and in our heart.",
  },
  homily: {
    nb: "Presten forklarer lesningene og hva de betyr for livet vårt.",
    en: "The priest explains the readings and what they mean for our lives.",
  },
  creed: {
    nb: "Vi bekjenner Kirkens tro med ordene fra kirkemøtene i Nikea og Konstantinopel (325 og 381). Ved ordene om at Guds Sønn ble menneske, bøyer alle seg.",
    en: "We profess the faith of the Church in the words of the Councils of Nicaea and Constantinople (325 and 381). At the words about the Son of God becoming man, everyone bows.",
  },
  intercessions: {
    nb: "Vi ber for Kirken, for verden, for dem som lider, og for menigheten vår.",
    en: "We pray for the Church, for the world, for those who suffer and for our parish.",
  },
  eucharist: {
    nb: "Brødet og vinen bæres frem til alteret. Kollekten, menighetens gave, tas vanligvis opp nå.",
    en: "The bread and wine are brought to the altar. The collection, the parish's gift, is usually taken now.",
  },
  "eucharistic-prayer": {
    nb: "Den eukaristiske bønn er hele messens sentrum og høydepunkt. Presten ber den på vegne av hele Kirken. Ved konsekrasjonen blir brødet og vinen Kristi legeme og blod, og når presten løfter hostien og kalken, ser vi på dem i tilbedelse.",
    en: "The Eucharistic Prayer is the center and high point of the whole Mass. The priest prays it on behalf of the whole Church. At the consecration the bread and wine become the Body and Blood of Christ, and when the priest raises the host and the chalice, we look at them in adoration.",
  },
  preface: {
    nb: "Prefasjonen er en takkebønn som skifter med kirkeåret og høytidene. Den ender i englenes lovsang: «Hellig, hellig, hellig».",
    en: "The Preface is a prayer of thanksgiving that changes with the liturgical year and its feasts. It ends in the song of the angels: “Holy, Holy, Holy”.",
  },
  "communion-rite": {
    nb: "Vi forbereder oss til kommunionen med Fader vår, fredshilsenen og Guds lam. Ved fredshilsenen hilser vi på dem rundt oss, gjerne med et håndtrykk.",
    en: "We prepare for Holy Communion with the Lord's Prayer, the sign of peace and the Lamb of God. At the sign of peace we greet those around us, often with a handshake.",
  },
  communion: {
    nb: "Katolikker som er forberedt, kan motta kommunion. Presten sier «Kristi legeme», og du svarer «Amen» før du mottar hostien på tungen eller i hånden. Mottar du ikke kommunion, er du velkommen frem til en velsignelse: kom frem med høyre hånd på venstre skulder.",
    en: "Catholics who are prepared may receive Holy Communion. The priest says “The Body of Christ”, and you answer “Amen” before receiving the host on the tongue or in the hand. If you do not receive, you are welcome to come forward for a blessing with your right hand on your left shoulder.",
  },
  "prayer-after-communion": {
    nb: "Etter kommunionen er det tid til stille takk og bønn. Så ber presten slutningsbønnen.",
    en: "After Communion there is time for silent thanksgiving and prayer. Then the priest says the Prayer after Communion.",
  },
  "concluding-rites": {
    nb: "Presten velsigner oss og sender oss ut. Det vi har mottatt i messen, tar vi med oss inn i hverdagen.",
    en: "The priest blesses us and sends us out. What we have received at Mass we carry with us into daily life.",
  },
  angelus: {
    nb: "Angelus er en gammel bønn til minne om at Guds Sønn ble menneske. Hos oss bes den ofte etter høymessen.",
    en: "The Angelus is an old prayer in memory of the Son of God becoming man. Here it is often prayed after Sunday Mass.",
  },
};
