// --- LONG READING STORIES (~2500-3000 words each, ~20 min reading at 120-150 wpm) ---
// Term 3, Week 4: Performing Arts — Movement & Dance / Music & Heritage

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LongStory {
  id: string;
  weekNumber: number;
  storyNumber: 1 | 2;
  title: string;
  emoji: string;
  readingTimeMinutes: number;
  content: string[]; // array of paragraphs
  quizQuestionsDay1: QuizQuestion[]; // for days 1-2
  quizQuestionsDay2: QuizQuestion[]; // for days 3-4 (different questions, same story)
  unlockDay: 1 | 3; // story 1 unlocks day 1, story 2 unlocks day 3
}

export const LONG_STORIES_BANK: LongStory[] = [
  // ============ TERM 3, WEEK 4 — STORY 1 ============
  {
    id: 't3_w4_s1',
    weekNumber: 4,
    storyNumber: 1,
    title: 'The Dancing Shadows of Durban',
    emoji: '💃',
    readingTimeMinutes: 20,
    unlockDay: 1,
    content: [
      `Thandi Mkhize was eight years old and lived in a small flat on the sixth floor of a building near the Durban beachfront. From her bedroom window she could see the wide blue Indian Ocean stretching all the way to the horizon, and if she pressed her face against the glass and looked to the left, she could just make out the tops of the palm trees that lined the Golden Mile promenade. Every afternoon after school, Thandi would sit on the narrow balcony with her grandmother, whom she called Gogo, eating slices of mango and watching the world below. People jogged along the beachfront pathway, surfers carried their boards to the waves, and families spread blankets on the warm sand. But the thing that held Thandi's attention more than anything else was the dancers.`,

      `Every single afternoon at half past four, a group of street dancers gathered at the wide paved area near the miniature train station on the promenade. They set up a portable speaker on an upturned crate, and the moment the music started — usually a mix of gqom beats, amapiano rhythms, and old-school kwaito — the dancers would begin to move. There were about six or seven of them, all different ages, and they danced with such energy and joy that a crowd always formed around them. Tourists filmed with their phones, children stopped to watch with their mouths open, and even the old men sitting on the benches would tap their feet and nod along. The leader of the group was a young man called Sipho who wore bright yellow sneakers and moved as if gravity had forgotten about him.`,

      `Thandi loved watching Sipho dance more than anything. He could spin on one hand, freeze in mid-air, and make his body ripple like a wave rolling onto the shore. Sometimes he mixed traditional Zulu dance moves — the high kicks and stomps of indlamu — with modern hip-hop and breakdancing, creating something entirely new and electrifying. Thandi would stand on the balcony, gripping the railing, her whole body tingling with the desire to move like that. In the privacy of her bedroom, with the door closed, she would try to copy what she had seen — spinning, stepping, swaying her arms like seaweed in the current. She was actually quite good. Her body seemed to understand rhythm the way some people understand maths or painting. But the thought of dancing in front of other people made her stomach feel like it was full of cold stones.`,

      `Gogo noticed everything, the way grandmothers do. She saw how Thandi's feet tapped under the table during supper. She heard the soft thud-thud-thud of dancing feet coming from Thandi's bedroom when the child thought nobody was listening. And she saw how Thandi's eyes lit up like harbour lights whenever the street dancers performed below. One Wednesday afternoon, as they sat on the balcony sharing a packet of dried mango strips, Gogo said, "You know, Thandi, when I was your age in Eshowe, I was the best dancer in my whole village. My feet moved so fast people said I had lightning in my shoes." Thandi looked at her grandmother with wide eyes. "Really, Gogo? You danced?" Gogo laughed, her whole body shaking with the sound. "Oh, my girl. I danced at every celebration, every umemulo, every wedding. Dancing is in our blood. It is how the Mkhize family speaks when words are not enough."`,

      `Thandi chewed her mango slowly, thinking. "But Gogo," she said quietly, "weren't you scared? Dancing in front of everyone?" Gogo was quiet for a moment, watching a cargo ship move slowly across the distant horizon. "Of course I was scared, the first time," she said. "My knees shook like reeds in the wind. But my grandmother — your great-great-grandmother — told me something I have never forgotten. She said: 'The music is a river. When you hear it, you can stand on the bank and watch it flow past, or you can jump in and let it carry you. The river does not judge. It only flows.' So I jumped in, Thandi. And I have never regretted it." She turned to look at her granddaughter with knowing eyes. "Maybe it is time for you to jump in too."`,

      `That night, Thandi could not sleep. She lay in bed listening to the distant sound of the ocean waves and the occasional car passing below. Gogo's words echoed in her mind — the music is a river. She imagined herself standing by a river of sound, watching the notes flow past like sparkling water. She imagined dipping one toe in, then wading deeper, and then letting the current lift her off her feet and carry her downstream. It was a beautiful thought, but it was also terrifying. What if she danced and people laughed? What if she tried to move like Sipho and fell on her face? What if the other dancers did not want her there? She pulled the blanket over her head and tried to think about something else, but her feet kept twitching under the covers, tapping out a rhythm that only they could hear. Eventually, exhaustion won, and she drifted off to sleep with the ocean's lullaby whispering through the window.`,

      `The next afternoon was Thursday, and as always, the dancers gathered at half past four. Today the music was especially good — a deep amapiano beat with a piano melody that floated over the top like birdsong. Gogo took Thandi's hand and said, "Come, let's go down today. I want to feel the sea breeze on my face." Thandi's heart began to race. Going down to the promenade meant being close to the dancers — not watching from six floors up, but right there, close enough to feel the vibration of the speaker in her chest. She wanted to say no, but Gogo was already putting on her sandals and picking up her handbag, so Thandi slipped on her takkies and followed her grandmother into the lift. The lift doors opened at the ground floor, and the warm salt air wrapped around them immediately.`,

      `The beachfront was golden and warm in the late afternoon sun. The air smelled of salt, fried chips from the takeaway shops, and the sweet coconut oil that the ice cream seller rubbed on his cart to keep it shiny. Seagulls called overhead, diving for scraps near the pier, and a group of children were building an enormous sandcastle decorated with shells and seaweed. Gogo walked slowly, holding Thandi's hand, pointing out pelicans on the pier and commenting on the size of the waves. But Thandi could already hear the music drifting toward them — that deep bass beat that made her ribcage vibrate. As they rounded the corner past the miniature train tracks, she saw the dancers. Sipho was in the centre, spinning on his back with his legs forming a perfect circle in the air. The crowd clapped and cheered. Gogo found an empty bench nearby and sat down, patting the space next to her.`,

      `Thandi sat beside Gogo but could not keep still. Her shoulders moved left and right without her permission. Her head nodded to the beat. Her feet shuffled on the paving stones, finding the rhythm like old friends greeting each other. She watched every move the dancers made — the way they used the whole space, the way they took turns in the centre, the way they cheered each other on with whoops and hand claps. One dancer, a girl who looked about twelve with long braids decorated with golden beads, did a move where she made her arms flow like water while her feet tapped out a rapid, intricate pattern. It was so beautiful that Thandi gasped. She noticed how the girl smiled while she danced — not a shy smile or a nervous smile, but a huge, free, joyful smile that said she was exactly where she belonged. Then something unexpected happened. Sipho noticed Thandi.`,

      `He was walking back to the edge of the circle after his turn in the middle when his eyes landed on Thandi — sitting on the bench, her whole body moving, her eyes shining with longing. He grinned widely, showing a gap between his front teeth, and walked straight toward her. Thandi's heart nearly stopped. "Hey, little sister!" Sipho called over the music. "I see you feeling the beat! Your body is already dancing — your legs just need to catch up. Want to come try?" Thandi shook her head frantically, shrinking back against the bench. "No, no, I can't," she whispered, her voice barely audible over the thumping bass. Sipho did not push. He just smiled kindly and said, "The circle is always open for you. Whenever you are ready. No rush, no pressure — the music will wait for you." Then he danced his way back to the group, spinning twice as he went.`,

      `Gogo squeezed Thandi's hand. "You see?" she said gently. "The river invited you in. You don't have to jump today. But maybe tomorrow you will put one toe in the water." They sat and watched for another hour, until the sun turned orange and began to sink toward the ocean. Thandi clapped along with the crowd, and once — just once — she stood up from the bench and swayed her hips to a particularly catchy song before sitting back down quickly, her cheeks burning. Gogo pretended not to notice, but a small smile played on her lips. That night, Thandi danced in her bedroom for a whole hour — practising the arm-flowing move the girl with braids had done, trying Sipho's spin, and adding her own moves that came from somewhere deep inside her. She danced until sweat dripped from her forehead and her legs ached, and then she fell asleep with a smile on her face and the sound of gqom drums echoing in her dreams.`,

      `Friday afternoon came, and Thandi made a decision. She did not tell Gogo — she just put on her favourite outfit: a bright yellow t-shirt with a beaded necklace Gogo had made for her last birthday, her most comfortable denim shorts, and her white takkies. She looked at herself in the bathroom mirror and said, very quietly, "You can do this. The river does not judge." When Gogo suggested their usual walk to the beachfront, Thandi nodded, but inside her stomach was doing backflips like the gymnasts she watched on television. Today, she promised herself, she would at least stand near the circle. Just stand near it. That was all. Her hands were sweating as they walked past the miniature train station and the music grew louder. The dancers were already in full flow — the girl with braids was doing her water-arms move, and two boys were doing synchronised footwork that looked impossibly fast.`,

      `Gogo sat on her bench and opened her handbag, pulling out a small bag of peanuts to snack on. Thandi stood beside the bench, then took one step forward. Then another. She was at the edge of the crowd now, standing between a tourist couple and a mother holding a toddler. The music pulsed through the ground and up through her takkies into her legs. She could feel it in her blood, in her bones, in the place behind her ribcage where her heart drummed its own beat. Sipho saw her and gave a small nod and a wink — nothing dramatic, just an acknowledgement. You are here. That is enough. And then the girl with braids finished her solo and the circle opened up, the dancers stepping back, and there was a gap — an empty space in the middle of the circle, waiting for someone to fill it.`,

      `Nobody moved for a moment. The beat kept playing — a rolling, flowing amapiano rhythm with a piano riff that sounded like sunlight sparkling on water. And then Thandi felt it — Gogo's words, the river, the music flowing past. She could stand on the bank forever, or she could jump. Her right foot moved forward before her brain caught up. Then her left foot followed. And suddenly she was in the circle — the centre of it — with the music wrapping around her like warm ocean water. For one terrible second, everything was silent inside her head. The crowd disappeared. The fear was a frozen block in her chest. And then the piano riff hit a high note, and something in Thandi broke free — like a bird escaping from a cage, like the first ray of sun breaking through storm clouds, like the ocean wave that finally reaches the shore after travelling a thousand kilometres.`,

      `She danced. Not Sipho's moves, not the braided girl's moves, but her own moves — moves that had been building inside her for months of watching, practising, dreaming. Her feet found patterns on the paving stones that surprised even her. Her arms swept and curved like the wings of the seabirds that wheeled above the beach. Her body rippled and popped with the beat, and she added a spin — just a small one — that ended with her feet planted wide and her arms flung out like a star. The crowd erupted. People clapped, whistled, and the other dancers cheered, stamping their feet in encouragement. Sipho threw his head back and laughed with pure joy. "Yes, little sister! YES! That's it!" The girl with braids ran forward and matched Thandi's rhythm, and for a few glorious seconds they danced together — two bodies speaking the same language without a single word. The tourist couple filmed it all on their phones, the toddler clapped her chubby hands, and somewhere in the crowd, someone whistled so loudly it cut through the music like a bright beam of light.`,

      `When the song ended, Thandi was breathing hard, her face glowing with sweat and the biggest smile she had ever worn. The other dancers crowded around her, high-fiving and patting her back. Sipho knelt down to her level and said, "That was special, little sister. You have something — a gift. We dance here every afternoon. You come any time, yeah? You are one of us now." The girl with braids — whose name was Zinhle — hugged her and said, "I love your style! You move like the ocean." Thandi felt like she might burst with happiness. She turned to find Gogo, and there she was on the bench, standing now, with tears streaming down her wrinkled cheeks and the proudest smile Thandi had ever seen. Gogo held out her arms, and Thandi ran to her, burying her face in Gogo's soft chest.`,

      `That evening, as Thandi and Gogo rode the lift back up to their flat, Gogo held Thandi's face between her soft hands and said, "The lightning is in your shoes too, my Thandi. Your great-great-grandmother would have been so proud." Thandi hugged Gogo tight, breathing in her familiar smell of rooibos tea and cocoa butter. "Thank you, Gogo," she whispered. "For telling me about the river." Gogo stroked her hair. "The river was always there, my darling. You just needed to trust yourself enough to jump." From that day forward, Thandi danced at the beachfront every afternoon with Sipho, Zinhle, and the crew. She was still quiet in class and still shy at parties, but when the music played, she became someone else entirely — someone brave, someone free, someone who spoke with her body in a language that needed no translation. The dancing shadows of Durban had gained a new member, and the promenade would never be the same.`
    ],
    quizQuestionsDay1: [
      {
        question: 'Why was Thandi afraid to dance in front of other people?',
        options: [
          'She did not know how to dance at all',
          'She was shy and worried people would laugh at her',
          'Her grandmother told her not to dance outside',
          'The dancers said she was too young to join'
        ],
        correctIndex: 1,
        explanation: 'Thandi was actually a good dancer in private, but she was shy and the thought of dancing in front of others made her stomach feel full of cold stones. She was afraid people might laugh or that she might fall.'
      },
      {
        question: 'What wise advice did Gogo share about dancing?',
        options: [
          'You must practise for ten years before performing',
          'The music is a river — you can watch from the bank or jump in',
          'Only adults should dance on the promenade',
          'Dancing is only for special celebrations'
        ],
        correctIndex: 1,
        explanation: 'Gogo shared her great-grandmother\'s wisdom: "The music is a river. You can stand on the bank and watch it flow past, or you can jump in and let it carry you. The river does not judge." This encouraged Thandi to be brave.'
      }
    ],
    quizQuestionsDay2: [
      {
        question: 'What happened when Thandi finally stepped into the dance circle?',
        options: [
          'She forgot all the moves and stood still',
          'She copied exactly what Sipho did',
          'She danced her own unique moves and the crowd cheered',
          'She tripped and everyone laughed at her'
        ],
        correctIndex: 2,
        explanation: 'When Thandi finally jumped in, she didn\'t copy anyone — she danced her OWN moves that had been building inside her for months. Her arms swept like seabird wings, her body popped with the beat, and the crowd erupted with cheers!'
      },
      {
        question: 'What is the main message of this story?',
        options: [
          'You should always listen to street music',
          'Dancing is the only way to make friends',
          'Having courage to express yourself leads to wonderful things',
          'Grandmothers are better dancers than children'
        ],
        correctIndex: 2,
        explanation: 'The story teaches us that having the courage to express yourself — even when you feel shy or scared — can lead to wonderful things like new friendships, self-discovery, and joy. Thandi was always a dancer inside; she just needed the courage to show the world.'
      }
    ]
  },

  // ============ TERM 3, WEEK 4 — STORY 2 ============
  {
    id: 't3_w4_s2',
    weekNumber: 4,
    storyNumber: 2,
    title: 'Naledi and the Music Box',
    emoji: '🎵',
    readingTimeMinutes: 20,
    unlockDay: 3,
    content: [
      `Naledi Molefe was eight years old and lived in a red-brick house on a quiet street in Orlando East, Soweto. The house had a stoep with two plastic chairs, a small front garden where her mother grew tomatoes and spinach, and a mango tree in the back that dropped sticky golden fruit every December. Naledi shared a bedroom with her younger sister Lerato, and the walls were covered in drawings Naledi had made — colourful pictures of birds, flowers, and musical notes that swirled like wind. Music was the thing Naledi loved most in the world. She sang in the school choir, she tapped rhythms on every surface she could find, and she had memorised all the words to every song on the radio that her mother played while cooking. But the music Naledi loved best was the music she remembered in fragments — the sound of her late grandfather's voice, humming old jazz melodies on the stoep on summer evenings.`,

      `Naledi's grandfather — Ntatemoholo, she called him — had passed away when she was six years old. She remembered him as a tall, gentle man with silver hair and hands that were always moving, always tapping, always keeping time with some invisible rhythm. He had been a jazz musician in his younger days, playing trumpet at the famous jazz clubs in Sophiatown before the neighbourhood was destroyed. Naledi's mother kept a framed photograph of him on the mantelpiece — young and handsome in a sharp suit, holding his golden trumpet with a smile that could light up a whole room. "Your grandfather could make that trumpet sing," her mother would say. "People came from all over Johannesburg to hear him play. He said music was the language that everyone understands, no matter where they come from."`,

      `One Saturday morning in early autumn, Naledi's mother asked her to help clean out the spare room that was being turned into a study space for homework. The room was piled with boxes of old things — books with yellowed pages, cracked vases wrapped in newspaper, faded curtains, and stacks of vinyl records in paper sleeves. Naledi opened one box labelled "Ntatemoholo's Things" in her mother's neat handwriting, and her heart began to beat faster. Inside were treasures: a beret he used to wear, a pair of cufflinks shaped like treble clefs, a stack of handwritten sheet music with notes dancing across the lines, and at the very bottom, wrapped carefully in a piece of blue velvet cloth, something that made Naledi gasp out loud.`,

      `It was a music box. Not the cheap plastic kind you get from a toy shop, but a proper, old-fashioned wooden music box the size of a large book. The wood was dark mahogany, polished smooth by years of handling, and on the lid was an inlaid design made of lighter wood — a pattern of musical notes, a crescent moon, and a single star. A small brass key protruded from the side. Naledi lifted it carefully, feeling its weight in her hands — solid and warm, as if the wood still remembered the warmth of her grandfather's fingers. She turned the key gently, once, twice, three times, but nothing happened. No music played. Something inside was broken — she could hear a faint grinding sound, like gears that would not catch. She felt a wave of sadness wash over her. This beautiful box had belonged to Ntatemoholo, and now it was silent. She carried it carefully to her bedroom and placed it on her bedside table, right next to the photograph of her grandfather she kept there.`,

      `At school on Monday, Naledi told her best friend Kagiso about the music box. Kagiso was a practical, clever boy who wore round glasses and always had a pencil behind his ear. He loved taking things apart to see how they worked — he had once disassembled his mother's broken kitchen clock and put it back together so it worked perfectly again. His school bag was always full of tiny screwdrivers and magnets he had collected. "Bring it to me," Kagiso said, his eyes lighting up behind his glasses. "If it's a mechanical music box, it has a cylinder with tiny pins and a metal comb inside. If a pin is bent or the comb is stuck, we can probably fix it." Naledi felt a spark of hope. "But what if we break it more?" she asked nervously. Kagiso shook his head. "We'll be careful. My uncle has a workshop with tiny screwdrivers. We won't force anything — we'll just look first."`,

      `That Wednesday afternoon, Naledi brought the music box to Kagiso's house, wrapped in her school jersey for protection. She had barely slept the night before, excited and nervous in equal parts. Kagiso's uncle, Malome David, was a watch repairman who worked from a small room at the back of their house. His workshop was magical — shelves lined with clocks of every shape and size, their pendulums swinging and ticking in a symphony of time. Tiny drawers filled with screws and springs smaller than sesame seeds lined one wall, and magnifying lamps that made everything look enormous were clamped to the edge of the workbench. The air smelled of metal polish and the faint sweetness of machine oil. Malome David examined the music box with gentle, expert fingers, turning it this way and that under the bright workshop light. "This is a beautiful piece," he said, his voice full of respect. "Swiss-made, I think. Perhaps from the 1960s. Someone loved this very much — see how the wood is worn smooth where hands held it?" He carefully unscrewed the bottom panel and peered inside with his magnifying glass.`,

      `"Ah, here is your problem," Malome David said, pointing with a pair of tweezers that were thinner than a toothpick. Naledi and Kagiso leaned in, their heads nearly touching. Inside the music box was a small brass cylinder covered in tiny raised pins, like the bumps on a comb. Next to it was a flat piece of metal with thin teeth — the actual comb that made the sound when the pins plucked it. The mechanism was intricate and beautiful, like a tiny golden city of wheels and springs. "See this?" Malome David said. "One of the teeth on the comb is bent sideways, so it catches on the cylinder and stops it from turning. And this little spring here —" he pointed to a coiled piece of wire "— has come loose from its anchor point. That's why the key winds but nothing plays. The energy has nowhere to go." Naledi nodded slowly, fascinated by how something so small could make such a big difference.`,

      `"Can we fix it?" Naledi asked, her voice small and hopeful. Malome David smiled warmly, the wrinkles around his eyes deepening. "We can try. But this is delicate work — it requires patience and steady hands. Kagiso, get me the number three tweezers and the smallest flat screwdriver. Naledi, you hold this magnifying glass right here so I can see clearly." For the next half hour, the three of them worked together in focused silence. The only sounds were the ticking of the surrounding clocks and the occasional soft clink of metal on metal. Malome David gently bent the caught tooth back into its proper position using the tweezers, applying pressure so gradually that Naledi held her breath the entire time. Then he reattached the tiny spring to its anchor point, using a dot of special glue no bigger than a pinhead. "Now we must wait five minutes for the glue to set," he said. Those five minutes felt like five hours to Naledi. Finally, Malome David replaced the bottom panel and turned the music box right-side up.`,

      `"Now," Malome David said, "the moment of truth. Naledi — you should be the one to try it." He handed her the music box, and Naledi took it with trembling hands. The mahogany felt warm and alive in her palms. She gripped the small brass key between her thumb and finger and turned it slowly. One turn. Two turns. Three turns. She could feel the spring tightening inside, storing energy like a pulled-back slingshot. Then she released the key. For one agonising second, nothing happened. The gears seemed to hesitate. Then — tink, tink, tink-tink-tink — the most beautiful sound Naledi had ever heard began to fill the workshop. Clear, bright notes tumbled out of the little box like drops of silver rain, playing a melody that Naledi recognised immediately. It was "Mannenberg" — the famous South African jazz song by Abdullah Ibrahim. Ntatemoholo's favourite song. The melody filled every corner of the workshop, making even the silent clocks seem to listen.`,

      `Naledi burst into tears. Not sad tears — joy tears, the kind that feel warm on your cheeks and make your chest feel like it might float away. The melody tinkled on, each note perfect and clear, and memories flooded through her — Ntatemoholo sitting on the stoep at sunset, humming this exact tune while the evening birds sang along; Ntatemoholo dancing with Grandma in the kitchen, shuffling his slippers on the linoleum floor; Ntatemoholo holding baby Naledi on his lap and saying, "Listen, my star, listen to the music. It will always be there when you need it." Kagiso put a hand on her shoulder, his own eyes bright behind his glasses, and Malome David quietly wiped his own eyes with the corner of his work cloth. "It seems this box has been waiting a long time to sing again," Malome David said softly.`,

      `When Naledi got home that evening, she played the music box for her mother, who sat on the couch with her hands over her mouth and tears streaming down her face. The melody filled their small lounge, and even Lerato stopped playing with her dolls to listen, her head tilted to one side like a little bird. "Where did you find it?" her mother whispered. "I thought it was broken beyond repair. I almost gave it away to the charity shop last year." Naledi explained about Kagiso and Malome David, and her mother pulled her into the tightest hug. "Your grandfather bought this music box in Cape Town in 1965, on the same day he played his first big concert at the City Hall," her mother said, her voice thick with emotion. "He wound it every single night before bed. He said it played him to sleep and gave him dreams full of music. He would be so happy to know it sings again." Little Lerato toddled over and pressed her ear against the box, grinning widely. "Pretty!" she said. "Again, again!"`,

      `The music box became the centre of something new in the Molefe household. Naledi began asking her mother more and more questions about Ntatemoholo — what songs he played, where he performed, who taught him trumpet, what his favourite food was, what made him laugh. Her mother opened up the box of his things again, and together they went through everything piece by piece. The sheet music turned out to be original compositions — songs Ntatemoholo had written himself, with titles like "Sunrise Over Soweto," "Lerato's Lullaby" (named for Naledi's grandmother, not her sister), and "Dancing Stars." Some pages had small notes scribbled in the margins: "play this part softly, like a whisper" or "make the trumpet cry here." Naledi could not read the musical notation, but she hummed along, making up melodies that felt right, as if the music was already somewhere inside her, waiting to be discovered.`,

      `Inspired by her discoveries, Naledi decided to start her own music project. She asked her mother for a blank notebook and wrote "Naledi's Song Book" on the cover in gold marker, decorating it with stars and musical notes. Every day she wrote something in it — sometimes words for a song, sometimes a drawing of a musical instrument, sometimes a memory about Ntatemoholo, and sometimes just a description of a sound she heard that she wanted to remember: the rhythm of rain on the corrugated iron roof, the song of the hadeda ibises flying over at dawn, the way the school bell echoed across the playground, the sound of her mother humming while washing dishes. Kagiso helped her record some of her made-up melodies on his mother's phone, and they played them back, adding clapping rhythms and harmonies. "You sound like a real songwriter," Kagiso told her one afternoon, and Naledi felt warmth spread through her chest like sunshine.`,

      `One evening, about three weeks after the music box was fixed, Naledi was sitting on the stoep with her mother and Lerato. The sun was setting over Soweto, painting the sky in shades of orange, pink, and deep purple — colours so beautiful they did not seem real. Smoke from braai fires curled upward from neighbouring yards, carrying the smell of boerewors and roasting mielies. Naledi wound the music box and set it on the arm of the plastic chair. The notes of "Mannenberg" tinkled out into the warm evening air, and from somewhere down the street, a neighbour began to whistle along. Then another neighbour started humming from their stoep. Naledi's mother began to sing softly — words that Naledi had never heard before, words in Sesotho about stars and love and music that never dies. It was as if Ntatemoholo's music was a stone thrown into a pond, and the ripples were still spreading outward, touching everyone they reached, connecting house to house, heart to heart.`,

      `Naledi closed her eyes and listened. She could almost feel her grandfather sitting in the empty chair beside her — his long fingers tapping on the armrest, his silver head nodding to the beat, his warm voice saying, "You hear it, my little star? Music connects us all — the living and the remembered, the young and the old, the quiet and the loud. As long as someone keeps the music playing, no one is ever truly gone." When she opened her eyes, the first star of the evening had appeared in the darkening sky — bright and steady, like a note held perfectly in the air. Naledi made a silent promise to that star: she would keep the music playing. For Ntatemoholo. For her family. For herself. And one day, for the children and grandchildren who would sit on this very stoep and wonder about the people who came before them.`,

      `That night, before bed, Naledi wound the music box three turns — just like Ntatemoholo used to — and placed it on her bedside table. As the delicate notes filled her small bedroom and Lerato hummed sleepily in the next bed, Naledi opened her song book and wrote: "Music does not disappear when a song ends. It lives in the people who heard it. It lives in the instruments that played it. It lives in the hearts that loved it. Ntatemoholo's music lives in me, and one day, my music will live in someone else. That is how songs last forever." She put her pencil down, kissed the lid of the music box gently, and fell asleep to the sound of silver notes dancing in the darkness like tiny, beautiful, everlasting stars.`
    ],
    quizQuestionsDay1: [
      {
        question: 'What was wrong with the music box when Naledi found it?',
        options: [
          'It was missing the brass key entirely',
          'A tooth on the metal comb was bent and a spring had come loose',
          'All the pins on the cylinder were broken off',
          'The wooden case was cracked in half'
        ],
        correctIndex: 1,
        explanation: 'Malome David discovered that one of the teeth on the metal comb was bent sideways (catching on the cylinder and stopping it from turning) and a small spring had come loose from its anchor point. That\'s why the key wound but no music played.'
      },
      {
        question: 'Who was Naledi\'s grandfather and what did he do?',
        options: [
          'He was a teacher who loved painting',
          'He was a jazz musician who played trumpet at famous clubs in Sophiatown',
          'He was a builder who made houses in Soweto',
          'He was a farmer who grew mango trees'
        ],
        correctIndex: 1,
        explanation: 'Naledi\'s grandfather (Ntatemoholo) was a jazz musician who played trumpet at famous jazz clubs in Sophiatown. People came from all over Johannesburg to hear him play, and he said music was a language everyone understands.'
      }
    ],
    quizQuestionsDay2: [
      {
        question: 'What song did the music box play when it was finally fixed?',
        options: [
          'Happy Birthday',
          'Nkosi Sikelel\'i Afrika',
          'Mannenberg by Abdullah Ibrahim — Ntatemoholo\'s favourite song',
          'Twinkle Twinkle Little Star'
        ],
        correctIndex: 2,
        explanation: 'The music box played "Mannenberg," the famous South African jazz song by Abdullah Ibrahim. It was Ntatemoholo\'s favourite song, and hearing it brought back all of Naledi\'s precious memories of her grandfather.'
      },
      {
        question: 'What did Naledi learn about music and memory from this experience?',
        options: [
          'Music is only for professional musicians to enjoy',
          'Old things should always be thrown away',
          'Music connects people across time — it keeps loved ones alive in our hearts',
          'Fixing broken things is too difficult for children'
        ],
        correctIndex: 2,
        explanation: 'Naledi learned that music connects us all — the living and the remembered, the young and the old. As long as someone keeps the music playing, no one is ever truly gone. Her grandfather\'s music lived on in her and her family.'
      }
    ]
  }
];
