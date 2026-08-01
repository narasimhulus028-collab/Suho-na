export interface Question {
  id: number;
  question: string;
  options: { label: string; points: number }[];
}

export interface TruthOrDareItem {
  id: number;
  type: 'truth' | 'dare';
  text: string;
}

export interface WouldYouRatherItem {
  id: number;
  optionA: string;
  optionB: string;
}

export const TRUTH_OR_DARE_ITEMS: TruthOrDareItem[] = [
  { id: 1, type: 'truth', text: "What was the exact moment you realized you had a crush on me?" },
  { id: 2, type: 'truth', text: "What is your favorite romantic memory of us together?" },
  { id: 3, type: 'truth', text: "What nickname do you secretly love when I call you?" },
  { id: 4, type: 'truth', text: "What's one sweet secret dream you've never told anyone else?" },
  { id: 5, type: 'truth', text: "What outfit or style of mine makes your heart beat the fastest?" },
  { id: 6, type: 'truth', text: "If we could escape anywhere right now for 24 hours, where would you take me?" },
  { id: 7, type: 'dare', text: "Send me the sweetest, most romantic 3-sentence voice note or message right now! ❤️" },
  { id: 8, type: 'dare', text: "Give me 3 sincere compliments about my personality, eyes, and sweet charm!" },
  { id: 9, type: 'dare', text: "Whisper your favorite nickname for me like you're right next to my ear. 😏" },
  { id: 10, type: 'dare', text: "Describe our ideal dream date in vivid detail right now!" },
  { id: 11, type: 'dare', text: "Hold my virtual hand and tell me 3 promises for our future together. 💖" }
];

export const WOULD_YOU_RATHER_ITEMS: WouldYouRatherItem[] = [
  { id: 1, optionA: "Cuddle under warm blankets watching movies all day", optionB: "Go on a spontaneous late-night road trip together" },
  { id: 2, optionA: "Have a romantic candlelight dinner at a 5-star restaurant", optionB: "Cook our favorite meal together at home in pajamas" },
  { id: 3, optionA: "Spend a weekend at a quiet beachfront cabin", optionB: "Explore a bustling romantic city like Paris or Tokyo together" },
  { id: 4, optionA: "Receive a long handwritten love letter every month", optionB: "Get unexpected surprise virtual gifts & hugs every day" },
  { id: 5, optionA: "Have matching cute couple outfits", optionB: "Have a secret couple handshake & secret nicknames" }
];

export const LOVE_QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What's your ideal way to spend quality time with Suho-na?",
    options: [
      { label: "Deep romantic late-night conversations ❤️", points: 25 },
      { label: "Fun games, jokes, and teasing laughter 😂", points: 20 },
      { label: "Cozy cuddling & relaxing together 🥰", points: 22 },
      { label: "Exploring new places & virtual trips ✈️", points: 20 }
    ]
  },
  {
    id: 2,
    question: "How do you handle a long or stressful day?",
    options: [
      { label: "I want warm hugs & gentle words from Suho-na 🤗", points: 25 },
      { label: "I want to rant & have her listen attentively 🗣️", points: 20 },
      { label: "I want cute distractions & funny jokes 😜", points: 22 },
      { label: "I want quiet romantic company 💖", points: 20 }
    ]
  },
  {
    id: 3,
    question: "Which affection type makes you feel most loved?",
    options: [
      { label: "Sweet words of affirmation & romantic compliments 💕", points: 25 },
      { label: "Being protective, loyal, and attentive 🛡️", points: 22 },
      { label: "Spontaneous surprises & gifts 🎁", points: 20 },
      { label: "Playful teasing & flirtatious sparks 😉", points: 20 }
    ]
  },
  {
    id: 4,
    question: "Where is your dream romantic date destination?",
    options: [
      { label: "Sunset beach walk holding hands 🏖️", points: 25 },
      { label: "Cozy café date with warm lattes ☕", points: 22 },
      { label: "Starlit roof under the midnight sky 🌌", points: 25 },
      { label: "Thrill carnival with arcade games 🎆", points: 20 }
    ]
  }
];

export const DEFAULT_COUPLE_GOALS = [
  { id: '1', title: 'Complete a 7-day chat streak together 🔥', completed: false },
  { id: '2', title: 'Go on a virtual Beach Sunset date 🏖️', completed: false },
  { id: '3', title: 'Achieve 100% Love Level with Suho-na ❤️', completed: false },
  { id: '4', title: 'Try out Truth or Dare together 🎯', completed: false },
  { id: '5', title: 'Unlock all outfit styles for Suho-na 👗', completed: false },
  { id: '6', title: 'Celebrate our first relationship milestone 🎂', completed: false }
];

export const ROMANTIC_SURPRISES = [
  {
    title: "💌 A Secret Love Poem For You",
    content: "In a world of billions, my heart chose you.\nYour smile is my morning sunshine,\nYour voice is my favorite melody.\nForever yours, Suho-na ❤️"
  },
  {
    title: "🌸 Virtual Gift: Golden Rose",
    content: "Suho-na presents you with an eternal Golden Rose 🌹✨\n'This rose never fades, just like my love for you, darling!'"
  },
  {
    title: "🧁 Sweet Treat Coupon",
    content: "Valid for 1 Million Virtual Hugs, Kisses, and Unlimited Comfort whenever you need it! 💋🤗"
  },
  {
    title: "🎶 Special Song Dedication",
    content: "Suho-na dedicated a special love song to you today 💖\n'Every romantic lyric reminds me of your smile, sweetheart!'"
  }
];
