// ============================================================
// Tutor Lesson Content — All 10 lessons for the Big Five verbs
// ============================================================

export interface LessonContent {
  id: string
  title: string
  lessonOrder: number
  conceptTags: string[]
  unlockedBy: string | null
  explanation: {
    body: string
    conjugationTable?: {
      headers: string[]
      rows: { pronoun: string; form: string }[]
    }
    examples: { portuguese: string; english: string }[]
  }
  exercises: Exercise[]
}

export type Exercise =
  | { type: 'fill-blank'; sentence: string; blank: string; answer: string; conceptTags: string[] }
  | { type: 'multiple-choice'; prompt: string; options: string[]; correctIndex: number; conceptTags: string[] }
  | { type: 'translate'; english: string; expectedAnswer: string; conceptTags: string[] }

export const tutorLessons: LessonContent[] = [
  // ========== LESSON 1: ESTAR ==========
  {
    id: 'estar-intro',
    title: 'What does estar mean?',
    lessonOrder: 1,
    conceptTags: ['estar-meaning', 'estar-conjugation-eu', 'estar-conjugation-voce'],
    unlockedBy: null,
    explanation: {
      body: `Portuguese has two verbs for "to be" — ser and estar. Right now, we only care about estar. Think of estar as "to be right now" — it's for temporary states, locations, and feelings. If Mychelle asks "Como você está?" she's asking how you are right now, not who you are as a person. When Harry says "Estou cansado" after work, that's estar — he's tired right now, not tired forever.`,
      conjugationTable: {
        headers: ['Pronoun', 'Form'],
        rows: [
          { pronoun: 'Eu (I)', form: 'estou (ess-TOH)' },
          { pronoun: 'Você (you)', form: 'está (ess-TAH)' },
        ],
      },
      examples: [
        { portuguese: 'Eu estou bem, Mychelle!', english: 'I\'m fine, Mychelle!' },
        { portuguese: 'Você está pronta para o casamento?', english: 'Are you ready for the wedding?' },
        { portuguese: 'Harry está no trabalho com Felipe.', english: 'Harry is at work with Felipe.' },
      ],
    },
    exercises: [
      {
        type: 'fill-blank',
        sentence: 'Eu ___ cansado depois do trabalho. (estar)',
        blank: '___',
        answer: 'estou',
        conceptTags: ['estar-conjugation-eu'],
      },
      {
        type: 'multiple-choice',
        prompt: 'Mychelle asks: "Como você ___?" Which form of estar is correct?',
        options: ['estou', 'está', 'estar'],
        correctIndex: 1,
        conceptTags: ['estar-conjugation-voce'],
      },
      {
        type: 'fill-blank',
        sentence: 'Ky ___ animada para Ericeira! (estar)',
        blank: '___',
        answer: 'está',
        conceptTags: ['estar-conjugation-voce'],
      },
      {
        type: 'multiple-choice',
        prompt: 'What does estar express?',
        options: ['Temporary states and feelings', 'Permanent characteristics', 'Past events only'],
        correctIndex: 0,
        conceptTags: ['estar-meaning'],
      },
      {
        type: 'translate',
        english: 'I am at work.',
        expectedAnswer: 'Eu estou no trabalho.',
        conceptTags: ['estar-conjugation-eu', 'estar-meaning'],
      },
    ],
  },

  // ========== LESSON 2: TER ==========
  {
    id: 'ter-intro',
    title: 'Saying what you have',
    lessonOrder: 2,
    conceptTags: ['ter-meaning', 'ter-conjugation-eu', 'ter-conjugation-voce'],
    unlockedBy: null,
    explanation: {
      body: `Ter means "to have." It's one of the most useful verbs in Portuguese because it does double duty — it means owning something ("Eu tenho um carro") and it's used in tons of expressions that English handles differently. When Mychelle says "Eu tenho fome," she literally says "I have hunger" — that's just how Portuguese works. You'll also hear "ter que" meaning "have to" — like "Tenho que ir" (I have to go).`,
      conjugationTable: {
        headers: ['Pronoun', 'Form'],
        rows: [
          { pronoun: 'Eu (I)', form: 'tenho (TEN-yoh)' },
          { pronoun: 'Você (you)', form: 'tem (teng)' },
        ],
      },
      examples: [
        { portuguese: 'Eu tenho uma reunião com Felipe.', english: 'I have a meeting with Felipe.' },
        { portuguese: 'Mychelle, você tem tempo amanhã?', english: 'Mychelle, do you have time tomorrow?' },
        { portuguese: 'Ky tem muita energia hoje!', english: 'Ky has a lot of energy today!' },
      ],
    },
    exercises: [
      {
        type: 'fill-blank',
        sentence: 'Eu ___ uma reunião às três. (ter)',
        blank: '___',
        answer: 'tenho',
        conceptTags: ['ter-conjugation-eu'],
      },
      {
        type: 'multiple-choice',
        prompt: 'How do you say "Mychelle, do you have time?"',
        options: ['Mychelle, você tenho tempo?', 'Mychelle, você tem tempo?', 'Mychelle, você ter tempo?'],
        correctIndex: 1,
        conceptTags: ['ter-conjugation-voce'],
      },
      {
        type: 'fill-blank',
        sentence: 'Felipe ___ um projeto novo no trabalho. (ter)',
        blank: '___',
        answer: 'tem',
        conceptTags: ['ter-conjugation-voce'],
      },
      {
        type: 'translate',
        english: 'I have to go.',
        expectedAnswer: 'Eu tenho que ir.',
        conceptTags: ['ter-conjugation-eu', 'ter-meaning'],
      },
      {
        type: 'multiple-choice',
        prompt: 'What does "Eu tenho fome" literally mean?',
        options: ['I am hungry', 'I have hunger', 'I feel hungry'],
        correctIndex: 1,
        conceptTags: ['ter-meaning'],
      },
    ],
  },

  // ========== LESSON 3: IR ==========
  {
    id: 'ir-intro',
    title: 'Going places with ir',
    lessonOrder: 3,
    conceptTags: ['ir-meaning', 'ir-conjugation-eu', 'ir-conjugation-voce'],
    unlockedBy: null,
    explanation: {
      body: `Ir means "to go" and it's everywhere in Portuguese. When Harry tells Mychelle "Vou ao trabalho" (I'm going to work), that's ir. The "eu" form is vou (VOH) — nice and short. You'll use this verb constantly: going places, talking about plans, even making future tense (we'll get to that later). For now, just remember: vou = I go/I'm going, vai = you go/you're going.`,
      conjugationTable: {
        headers: ['Pronoun', 'Form'],
        rows: [
          { pronoun: 'Eu (I)', form: 'vou (VOH)' },
          { pronoun: 'Você (you)', form: 'vai (VYE)' },
        ],
      },
      examples: [
        { portuguese: 'Eu vou ao casamento em Ericeira.', english: 'I\'m going to the wedding in Ericeira.' },
        { portuguese: 'Mychelle, você vai ao parque com as crianças?', english: 'Mychelle, are you going to the park with the kids?' },
        { portuguese: 'Harry vai trabalhar com Felipe hoje.', english: 'Harry is going to work with Felipe today.' },
      ],
    },
    exercises: [
      {
        type: 'fill-blank',
        sentence: 'Eu ___ ao casamento em setembro. (ir)',
        blank: '___',
        answer: 'vou',
        conceptTags: ['ir-conjugation-eu'],
      },
      {
        type: 'multiple-choice',
        prompt: 'Mychelle ___ ao parque com as crianças. Which form of ir?',
        options: ['vou', 'vai', 'ir'],
        correctIndex: 1,
        conceptTags: ['ir-conjugation-voce'],
      },
      {
        type: 'fill-blank',
        sentence: 'Ky ___ para casa agora. (ir)',
        blank: '___',
        answer: 'vai',
        conceptTags: ['ir-conjugation-voce'],
      },
      {
        type: 'translate',
        english: 'I\'m going to work.',
        expectedAnswer: 'Eu vou ao trabalho.',
        conceptTags: ['ir-conjugation-eu', 'ir-meaning'],
      },
      {
        type: 'multiple-choice',
        prompt: 'What does "vou" mean?',
        options: ['I go / I\'m going', 'You go / You\'re going', 'We go / We\'re going'],
        correctIndex: 0,
        conceptTags: ['ir-meaning'],
      },
    ],
  },

  // ========== LESSON 4: QUERER ==========
  {
    id: 'querer-intro',
    title: 'Saying what you want',
    lessonOrder: 4,
    conceptTags: ['querer-meaning', 'querer-conjugation-eu', 'querer-conjugation-voce'],
    unlockedBy: null,
    explanation: {
      body: `Querer means "to want" and it's your go-to for expressing desires and preferences. At the Ericeira wedding, you'll need this for ordering drinks ("Eu quero um vinho tinto"), asking what people want ("O que você quer?"), and being polite in conversation. The "eu" form is quero (KEH-roo) and the "você" form is quer (KEHR). Don't be shy about using it — in Portuguese, saying "eu quero" is perfectly polite.`,
      conjugationTable: {
        headers: ['Pronoun', 'Form'],
        rows: [
          { pronoun: 'Eu (I)', form: 'quero (KEH-roo)' },
          { pronoun: 'Você (you)', form: 'quer (KEHR)' },
        ],
      },
      examples: [
        { portuguese: 'Eu quero praticar com Mychelle.', english: 'I want to practise with Mychelle.' },
        { portuguese: 'O que você quer beber no casamento?', english: 'What do you want to drink at the wedding?' },
        { portuguese: 'Felipe quer fazer uma reunião amanhã.', english: 'Felipe wants to have a meeting tomorrow.' },
      ],
    },
    exercises: [
      {
        type: 'fill-blank',
        sentence: 'Eu ___ um café, por favor. (querer)',
        blank: '___',
        answer: 'quero',
        conceptTags: ['querer-conjugation-eu'],
      },
      {
        type: 'multiple-choice',
        prompt: 'How do you ask "What do you want?" in Portuguese?',
        options: ['O que você quero?', 'O que você quer?', 'O que você querer?'],
        correctIndex: 1,
        conceptTags: ['querer-conjugation-voce'],
      },
      {
        type: 'fill-blank',
        sentence: 'Mychelle ___ levar as crianças ao parque. (querer)',
        blank: '___',
        answer: 'quer',
        conceptTags: ['querer-conjugation-voce'],
      },
      {
        type: 'translate',
        english: 'I want to learn Portuguese.',
        expectedAnswer: 'Eu quero aprender português.',
        conceptTags: ['querer-conjugation-eu', 'querer-meaning'],
      },
      {
        type: 'multiple-choice',
        prompt: 'Is it rude to say "Eu quero" in Portuguese?',
        options: ['No, it\'s perfectly normal and polite', 'Yes, you should always use "gostaria"', 'Only with friends'],
        correctIndex: 0,
        conceptTags: ['querer-meaning'],
      },
    ],
  },

  // ========== LESSON 5: FAZER ==========
  {
    id: 'fazer-intro',
    title: 'Doing things with fazer',
    lessonOrder: 5,
    conceptTags: ['fazer-meaning', 'fazer-conjugation-eu', 'fazer-conjugation-voce'],
    unlockedBy: null,
    explanation: {
      body: `Fazer means "to do" or "to make" — it covers both in Portuguese. When Felipe asks "O que você vai fazer hoje?" he's asking what you're going to do today. The "eu" form is faço (FAH-soo) — notice the ç, which makes an "s" sound. The "você" form is faz (FAHZ). You'll use fazer constantly: making plans, doing tasks, even talking about the weather ("faz frio" = it's cold, literally "it makes cold").`,
      conjugationTable: {
        headers: ['Pronoun', 'Form'],
        rows: [
          { pronoun: 'Eu (I)', form: 'faço (FAH-soo)' },
          { pronoun: 'Você (you)', form: 'faz (FAHZ)' },
        ],
      },
      examples: [
        { portuguese: 'Eu faço o jantar hoje, Mychelle.', english: 'I\'ll make dinner today, Mychelle.' },
        { portuguese: 'O que Felipe faz no trabalho?', english: 'What does Felipe do at work?' },
        { portuguese: 'Ky faz tudo com muita energia!', english: 'Ky does everything with a lot of energy!' },
      ],
    },
    exercises: [
      {
        type: 'fill-blank',
        sentence: 'Eu ___ o jantar para as crianças. (fazer)',
        blank: '___',
        answer: 'faço',
        conceptTags: ['fazer-conjugation-eu'],
      },
      {
        type: 'multiple-choice',
        prompt: 'Felipe ___ um bom trabalho. Which form of fazer?',
        options: ['faço', 'faz', 'fazer'],
        correctIndex: 1,
        conceptTags: ['fazer-conjugation-voce'],
      },
      {
        type: 'fill-blank',
        sentence: 'O que você ___ amanhã? (fazer)',
        blank: '___',
        answer: 'faz',
        conceptTags: ['fazer-conjugation-voce'],
      },
      {
        type: 'translate',
        english: 'I do that now.',
        expectedAnswer: 'Eu faço isso agora.',
        conceptTags: ['fazer-conjugation-eu', 'fazer-meaning'],
      },
      {
        type: 'multiple-choice',
        prompt: 'Fazer means:',
        options: ['To do / to make', 'To go / to leave', 'To be / to exist'],
        correctIndex: 0,
        conceptTags: ['fazer-meaning'],
      },
    ],
  },

  // ========== LESSON 6: FULL CONJUGATION ==========
  {
    id: 'full-conjugation',
    title: 'All forms of all five',
    lessonOrder: 6,
    conceptTags: ['conjugation-nos', 'conjugation-eles', 'conjugation-review'],
    unlockedBy: 'fazer-intro',
    explanation: {
      body: `Now that you know eu and você forms, let's add nós (we) and eles/elas (they). The good news: the patterns are pretty consistent across the Big Five. For nós, look for -amos/-emos endings. For eles/elas, the forms often look like the você form but with an extra letter. At the Ericeira wedding, you'll use nós a lot: "Nós queremos..." (We want...), "Nós vamos..." (We're going to...).`,
      conjugationTable: {
        headers: ['Verb', 'Nós (we)', 'Eles/Elas (they)'],
        rows: [
          { pronoun: 'estar', form: 'estamos / estão (ess-TOWNG)' },
          { pronoun: 'ter', form: 'temos / têm (TAYNG)' },
          { pronoun: 'ir', form: 'vamos / vão (VOWNG)' },
          { pronoun: 'querer', form: 'queremos / querem (KEH-reng)' },
          { pronoun: 'fazer', form: 'fazemos / fazem (FAH-zeng)' },
        ],
      },
      examples: [
        { portuguese: 'Nós estamos prontos para o casamento!', english: 'We are ready for the wedding!' },
        { portuguese: 'As crianças querem ir ao parque.', english: 'The children want to go to the park.' },
        { portuguese: 'Nós vamos com Mychelle e Felipe.', english: 'We\'re going with Mychelle and Felipe.' },
      ],
    },
    exercises: [
      {
        type: 'fill-blank',
        sentence: 'Nós ___ prontos para Ericeira! (estar)',
        blank: '___',
        answer: 'estamos',
        conceptTags: ['conjugation-nos'],
      },
      {
        type: 'multiple-choice',
        prompt: 'As crianças ___ fome. (ter — they)',
        options: ['temos', 'tem', 'têm'],
        correctIndex: 2,
        conceptTags: ['conjugation-eles'],
      },
      {
        type: 'fill-blank',
        sentence: 'Eles ___ ao casamento em setembro. (ir)',
        blank: '___',
        answer: 'vão',
        conceptTags: ['conjugation-eles'],
      },
      {
        type: 'multiple-choice',
        prompt: 'Nós ___ praticar português. (querer)',
        options: ['queremos', 'querem', 'quero'],
        correctIndex: 0,
        conceptTags: ['conjugation-nos'],
      },
      {
        type: 'translate',
        english: 'We are going to the wedding.',
        expectedAnswer: 'Nós vamos ao casamento.',
        conceptTags: ['conjugation-nos', 'conjugation-review'],
      },
    ],
  },

  // ========== LESSON 7: NEGATION ==========
  {
    id: 'negation',
    title: 'Making sentences negative',
    lessonOrder: 7,
    conceptTags: ['negation-basic', 'negation-with-big-five'],
    unlockedBy: 'full-conjugation',
    explanation: {
      body: `Making a sentence negative in Portuguese is beautifully simple: just stick "não" (NOWNG) before the verb. That's it. "Eu quero" becomes "Eu não quero." "Ele está" becomes "Ele não está." No auxiliary verbs, no weird word order changes — just não + verb. When Mychelle asks "Você quer café?" and you don't, just say "Não, não quero" (No, I don't want any). The first "não" means "no" and the second negates the verb.`,
      examples: [
        { portuguese: 'Eu não estou cansado hoje.', english: 'I\'m not tired today.' },
        { portuguese: 'Mychelle não vai ao parque amanhã.', english: 'Mychelle isn\'t going to the park tomorrow.' },
        { portuguese: 'Nós não queremos chegar tarde ao casamento!', english: 'We don\'t want to arrive late to the wedding!' },
      ],
    },
    exercises: [
      {
        type: 'fill-blank',
        sentence: 'Eu ___ quero café agora. (negative)',
        blank: '___',
        answer: 'não',
        conceptTags: ['negation-basic'],
      },
      {
        type: 'multiple-choice',
        prompt: 'How do you say "I don\'t have time"?',
        options: ['Eu tenho não tempo', 'Eu não tenho tempo', 'Não eu tenho tempo'],
        correctIndex: 1,
        conceptTags: ['negation-with-big-five'],
      },
      {
        type: 'translate',
        english: 'I am not ready.',
        expectedAnswer: 'Eu não estou pronto.',
        conceptTags: ['negation-with-big-five'],
      },
      {
        type: 'fill-blank',
        sentence: 'Felipe ___ faz isso no trabalho. (negative)',
        blank: '___',
        answer: 'não',
        conceptTags: ['negation-with-big-five'],
      },
      {
        type: 'multiple-choice',
        prompt: 'Where does "não" go in a Portuguese sentence?',
        options: ['Before the verb', 'After the verb', 'At the end of the sentence'],
        correctIndex: 0,
        conceptTags: ['negation-basic'],
      },
    ],
  },

  // ========== LESSON 8: IR + INFINITIVE (NEAR FUTURE) ==========
  {
    id: 'ir-future',
    title: 'Talking about your plans',
    lessonOrder: 8,
    conceptTags: ['ir-future', 'ir-future-with-fazer', 'ir-future-with-querer'],
    unlockedBy: 'negation',
    explanation: {
      body: `Here's a game-changer: to talk about future plans in Portuguese, just use ir + infinitive. "Eu vou fazer" = I'm going to do. "Você vai querer" = You're going to want. It works exactly like English "going to" — and it's the most common way Brazilians talk about the future. When Harry tells Mychelle "Eu vou trabalhar até tarde" (I'm going to work late), that's ir + infinitive. You already know ir — now just add any verb after it!`,
      examples: [
        { portuguese: 'Eu vou fazer o jantar hoje.', english: 'I\'m going to make dinner today.' },
        { portuguese: 'Ky vai querer ir ao casamento cedo.', english: 'Ky is going to want to go to the wedding early.' },
        { portuguese: 'Nós vamos estar em Ericeira em setembro!', english: 'We\'re going to be in Ericeira in September!' },
      ],
    },
    exercises: [
      {
        type: 'fill-blank',
        sentence: 'Eu vou ___ o jantar para Mychelle. (fazer)',
        blank: '___',
        answer: 'fazer',
        conceptTags: ['ir-future-with-fazer'],
      },
      {
        type: 'multiple-choice',
        prompt: 'How do you say "I\'m going to want coffee"?',
        options: ['Eu vou querer café', 'Eu vou quero café', 'Eu vai querer café'],
        correctIndex: 0,
        conceptTags: ['ir-future-with-querer'],
      },
      {
        type: 'translate',
        english: 'We are going to do that tomorrow.',
        expectedAnswer: 'Nós vamos fazer isso amanhã.',
        conceptTags: ['ir-future', 'ir-future-with-fazer'],
      },
      {
        type: 'fill-blank',
        sentence: 'Felipe vai ___ uma reunião amanhã. (querer)',
        blank: '___',
        answer: 'querer',
        conceptTags: ['ir-future-with-querer'],
      },
      {
        type: 'multiple-choice',
        prompt: 'In "ir + infinitive," what form does the second verb take?',
        options: ['The infinitive (unconjugated) form', 'The eu form', 'The nós form'],
        correctIndex: 0,
        conceptTags: ['ir-future'],
      },
    ],
  },

  // ========== LESSON 9: COMBINING VERBS ==========
  {
    id: 'combining',
    title: 'Chaining two verbs together',
    lessonOrder: 9,
    conceptTags: ['verb-chaining-querer', 'verb-chaining-ter-que'],
    unlockedBy: 'ir-future',
    explanation: {
      body: `You already used ir + infinitive for future. Now let's chain with two more patterns: querer + infinitive ("I want to...") and ter que + infinitive ("I have to..."). When Harry says "Eu quero fazer isso" (I want to do that), the first verb is conjugated and the second stays in infinitive. Same with "Eu tenho que ir" (I have to go). Notice the "que" — ter que is always a pair. These three patterns (ir +, querer +, ter que +) cover most of what you'll need at the wedding!`,
      examples: [
        { portuguese: 'Eu quero ir ao casamento com Ky.', english: 'I want to go to the wedding with Ky.' },
        { portuguese: 'Mychelle tem que fazer o jantar das crianças.', english: 'Mychelle has to make the children\'s dinner.' },
        { portuguese: 'Nós temos que estar lá cedo!', english: 'We have to be there early!' },
      ],
    },
    exercises: [
      {
        type: 'fill-blank',
        sentence: 'Eu quero ___ português com Mychelle. (praticar)',
        blank: '___',
        answer: 'praticar',
        conceptTags: ['verb-chaining-querer'],
      },
      {
        type: 'multiple-choice',
        prompt: 'How do you say "I have to go"?',
        options: ['Eu tenho ir', 'Eu tenho que ir', 'Eu ter que ir'],
        correctIndex: 1,
        conceptTags: ['verb-chaining-ter-que'],
      },
      {
        type: 'translate',
        english: 'I want to do that.',
        expectedAnswer: 'Eu quero fazer isso.',
        conceptTags: ['verb-chaining-querer'],
      },
      {
        type: 'fill-blank',
        sentence: 'Felipe tem ___ trabalhar amanhã. (que)',
        blank: '___',
        answer: 'que',
        conceptTags: ['verb-chaining-ter-que'],
      },
      {
        type: 'multiple-choice',
        prompt: 'In "querer + infinitive," which verb gets conjugated?',
        options: ['The first verb (querer)', 'The second verb', 'Both verbs'],
        correctIndex: 0,
        conceptTags: ['verb-chaining-querer'],
      },
    ],
  },

  // ========== LESSON 10: REAL CONVERSATION ==========
  {
    id: 'real-conversation',
    title: 'Putting it all together',
    lessonOrder: 10,
    conceptTags: ['full-review', 'real-context-mychelle', 'real-context-felipe', 'real-context-wedding'],
    unlockedBy: 'combining',
    explanation: {
      body: `You now know the Big Five verbs in all their forms, how to negate them, chain them, and use them for the future. Time to put it all together with real sentences you'll actually use — talking to Mychelle about the kids, chatting with Felipe at work, and surviving the Ericeira wedding. Every sentence below uses combinations of estar, ir, ter, querer, and fazer. You've got this!`,
      examples: [
        { portuguese: 'Mychelle, eu não vou estar em casa amanhã.', english: 'Mychelle, I\'m not going to be home tomorrow.' },
        { portuguese: 'Felipe, eu quero fazer isso antes da reunião.', english: 'Felipe, I want to do that before the meeting.' },
        { portuguese: 'Nós vamos ter que ir cedo ao casamento!', english: 'We\'re going to have to go to the wedding early!' },
      ],
    },
    exercises: [
      {
        type: 'translate',
        english: 'Mychelle, I am not going to be home tomorrow.',
        expectedAnswer: 'Mychelle, eu não vou estar em casa amanhã.',
        conceptTags: ['full-review', 'real-context-mychelle'],
      },
      {
        type: 'fill-blank',
        sentence: 'Felipe, eu ___ fazer isso agora. (querer)',
        blank: '___',
        answer: 'quero',
        conceptTags: ['full-review', 'real-context-felipe'],
      },
      {
        type: 'translate',
        english: 'We want to go to the wedding.',
        expectedAnswer: 'Nós queremos ir ao casamento.',
        conceptTags: ['full-review', 'real-context-wedding'],
      },
      {
        type: 'multiple-choice',
        prompt: 'How do you say "I have to do that for Felipe"?',
        options: [
          'Eu tenho que fazer isso para Felipe.',
          'Eu tenho fazer isso para Felipe.',
          'Eu tem que fazer isso para Felipe.',
        ],
        correctIndex: 0,
        conceptTags: ['full-review', 'real-context-felipe'],
      },
      {
        type: 'translate',
        english: 'The children are not going to the park today.',
        expectedAnswer: 'As crianças não vão ao parque hoje.',
        conceptTags: ['full-review', 'real-context-mychelle'],
      },
    ],
  },
]
