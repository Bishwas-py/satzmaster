// German sentences organized by patterns and difficulty
export const germanTexts = {
  beginner: [
    {
      text: "Ich bin müde heute",
      translation: "I am tired today",
      pattern: "Subject + Verb + Adjective + Time",
      explanation: "Basic sentence structure: Ich (I) + bin (am) + müde (tired) + heute (today)"
    },
    {
      text: "Das Haus ist groß",
      translation: "The house is big", 
      pattern: "Article + Noun + Verb + Adjective",
      explanation: "Der/Die/Das + Noun + ist/sind + Adjective is a fundamental German pattern"
    },
    {
      text: "Ich trinke Kaffee am Morgen",
      translation: "I drink coffee in the morning",
      pattern: "Subject + Verb + Object + Time phrase",
      explanation: "Notice 'am Morgen' (in the morning) - German uses 'am' with time periods"
    },
    {
      text: "Die Katze schläft auf dem Sofa",
      translation: "The cat sleeps on the sofa",
      pattern: "Article + Noun + Verb + Preposition + Dative",
      explanation: "auf + dem (dative) - prepositions change the case of nouns in German"
    }
  ],
  intermediate: [
    {
      text: "Ich habe gestern ein Buch gelesen",
      translation: "I read a book yesterday",
      pattern: "Perfect tense: haben/sein + past participle",
      explanation: "German perfect tense: habe (helper) + gelesen (past participle) at the end"
    },
    {
      text: "Weil es regnet, bleibe ich zu Hause",
      translation: "Because it's raining, I stay at home",
      pattern: "Subordinate clause + main clause",
      explanation: "'Weil' sends the verb to the end. Notice comma before main clause."
    },
    {
      text: "Der Mann, den ich gesehen habe, ist mein Lehrer",
      translation: "The man whom I saw is my teacher",
      pattern: "Relative clause with accusative",
      explanation: "'den' is accusative because the man is the object of 'gesehen habe'"
    }
  ],
  advanced: [
    {
      text: "Hätte ich mehr Zeit gehabt, wäre ich nach Deutschland gefahren",
      translation: "If I had had more time, I would have gone to Germany",
      pattern: "Subjunctive II - unreal conditional",
      explanation: "Hätte + past participle, wäre + past participle - expressing unreal past situations"
    },
    {
      text: "Nachdem er das Studium abgeschlossen hatte, begann er zu arbeiten",
      translation: "After he had finished his studies, he began to work",
      pattern: "Plusquamperfekt + simple past",
      explanation: "'Nachdem' with plusquamperfekt (had + past participle) for completed past actions"
    }
  ]
};

// Sentence building challenges - give key words, expect complete sentences
export const sentenceBuilderChallenges = {
  beginner: [
    {
      keyWords: ["Hund", "rennen", "Park"],
      possibleAnswers: [
        "Der Hund rennt im Park",
        "Ein Hund rennt im Park", 
        "Mein Hund rennt im Park",
        "Der kleine Hund rennt im Park"
      ],
      hints: [
        "Use 'der/ein/mein' before Hund",
        "Park needs 'im' (in + dem)",
        "Verb comes second in German"
      ],
      pattern: "Article + Noun + Verb + Preposition + Location",
      explanation: "Basic sentence with movement. 'im Park' = 'in the park' (dative case)"
    },
    {
      keyWords: ["ich", "Buch", "lesen"],
      possibleAnswers: [
        "Ich lese ein Buch",
        "Ich lese das Buch",
        "Ich lese mein Buch"
      ],
      hints: [
        "Subject comes first",
        "Add article before Buch",
        "Present tense: ich lese"
      ],
      pattern: "Subject + Verb + Article + Object",
      explanation: "Simple present tense. Remember: ich lese (I read), not 'ich lesen'"
    },
    {
      keyWords: ["Katze", "schlafen", "Sofa"],
      possibleAnswers: [
        "Die Katze schläft auf dem Sofa",
        "Meine Katze schläft auf dem Sofa",
        "Eine Katze schläft auf dem Sofa"
      ],
      hints: [
        "Use 'die/meine/eine' with Katze",
        "'auf dem' = on the (dative)",
        "3rd person: sie schläft"
      ],
      pattern: "Article + Noun + Verb + Preposition + Location",
      explanation: "'auf + dative' for 'on'. Katze is feminine, so 'die Katze schläft'"
    }
  ],
  intermediate: [
    {
      keyWords: ["gestern", "Film", "sehen"],
      possibleAnswers: [
        "Gestern habe ich einen Film gesehen",
        "Ich habe gestern einen Film gesehen",
        "Gestern haben wir einen Film gesehen"
      ],
      hints: [
        "Use perfect tense (haben + past participle)",
        "Past participle: gesehen",
        "'einen' = accusative masculine"
      ],
      pattern: "Time + Auxiliary + Subject + Object + Past Participle",
      explanation: "German perfect tense. Past participle goes to the end of the sentence"
    },
    {
      keyWords: ["weil", "müde", "schlafen"],
      possibleAnswers: [
        "Weil ich müde bin, gehe ich schlafen",
        "Ich gehe schlafen, weil ich müde bin"
      ],
      hints: [
        "'weil' sends verb to end of clause",
        "Main clause: normal word order",
        "Add comma between clauses"
      ],
      pattern: "Subordinate clause + main clause OR main + subordinate",
      explanation: "Subordinating conjunctions like 'weil' change word order - verb goes to the end"
    }
  ],
  advanced: [
    {
      keyWords: ["hätte", "Zeit", "reisen"],
      possibleAnswers: [
        "Hätte ich mehr Zeit, würde ich viel reisen",
        "Wenn ich mehr Zeit hätte, würde ich reisen"
      ],
      hints: [
        "Subjunctive II for hypothetical situations",
        "hätte = would have",
        "würde + infinitive = would do"
      ],
      pattern: "Subjunctive condition + subjunctive result",
      explanation: "Subjunctive II expresses hypothetical or unreal situations"
    }
  ]
};

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'; 