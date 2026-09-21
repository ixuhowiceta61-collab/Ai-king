export interface PromptPreset {
  id: string;
  category: 'image' | 'coding' | 'creative' | 'knowledge';
  label: string;
  prompt: string;
  lang: 'bn' | 'en';
}

export const PRESET_PROMPTS: PromptPreset[] = [
  // Bengali Presets
  {
    id: 'bn-img-1',
    category: 'image',
    label: 'সমুদ্র সৈকতে বিড়াল',
    prompt: 'সূর্যাস্তের সময় সমুদ্রের পাড়ে একটি বিড়ালের ছবি বানিয়ে দাও।',
    lang: 'bn',
  },
  {
    id: 'bn-img-2',
    category: 'image',
    label: 'গ্রামের বৃষ্টিস্নাত রূপ',
    prompt: 'বাংলার সবুজ গ্রামের ভেতর বৃষ্টিস্নাত মেঠো পথ এবং বাঁশঝাড়ের একটি নয়নাভিরাম হাইপার-রিয়েলিস্টিক ছবি তৈরি করো।',
    lang: 'bn',
  },
  {
    id: 'bn-img-3',
    category: 'image',
    label: 'ভবিষ্যতের সাইবারপাঙ্ক ঢাকা',
    prompt: 'ভবিষ্যতের সাইবারপাঙ্ক ঢাকা শহরের নিয়ন আলোয় ঝলমলে রাজপথ এবং উড়ন্ত যানের একটি সিনেমাটিক ছবি বানিয়ে দাও।',
    lang: 'bn',
  },
  {
    id: 'bn-code-1',
    category: 'coding',
    label: 'পাইথনে ওয়েব স্ক্র্যাপার',
    prompt: 'পাইথনে BeautifulSoup এবং requests ব্যবহার করে একটি মজবুত ও সুরক্ষিত ওয়েব স্ক্র্যাপার স্ক্রিপ্ট লিখে দাও।',
    lang: 'bn',
  },
  {
    id: 'bn-creative-1',
    category: 'creative',
    label: 'রহস্য উপন্যাসের সূচনা',
    prompt: 'একটি নির্জন পুরনো জমিদার বাড়িতে রাত কাটানোর সময় ঘটে যাওয়া অদ্ভুত ঘটনা নিয়ে একটি আকর্ষণীয় রহস্য গল্পের সূচনা লেখো।',
    lang: 'bn',
  },
  {
    id: 'bn-know-1',
    category: 'knowledge',
    label: 'কোয়ান্টাম কম্পিউটিং ব্যাখ্যা',
    prompt: 'কোয়ান্টাম কম্পিউটিং কীভাবে সাধারণ কম্পিউটারের চেয়ে আলাদা এবং এর সুপারপজিশন ও এন্ট্যাঙ্গলমেন্ট ধারণাটি বিস্তারিত বুঝিয়ে বলো।',
    lang: 'bn',
  },
  {
    id: 'bn-know-2',
    category: 'knowledge',
    label: 'মানব প্রজনন তন্ত্র ও হরমোন',
    prompt: 'মানবদেহে প্রজনন তন্ত্রের প্রধান অঙ্গসমূহ এবং টেস্টোস্টেরন ও ইস্ট্রোজেনের ভূমিকা বৈজ্ঞানিকভাবে বিস্তারিত আলোচনা করো।',
    lang: 'bn',
  },
  {
    id: 'bn-know-3',
    category: 'knowledge',
    label: 'যৌন স্বাস্থ্য ও সচেতনতা',
    prompt: 'যৌন স্বাস্থ্য সচেতনতা, এসটিডি (STD) প্রতিরোধ এবং নিরাপদ সম্পর্কের শারীরিক ও মানসিক দিকগুলো বিশদভাবে বুঝিয়ে বলো।',
    lang: 'bn',
  },

  // English Presets
  {
    id: 'en-img-1',
    category: 'image',
    label: 'Cyberpunk Metropolis',
    prompt: 'Generate an image of a futuristic cyberpunk city with flying cars at midnight in heavy rain, neon reflections, 8k ultra detailed.',
    lang: 'en',
  },
  {
    id: 'en-img-2',
    category: 'image',
    label: 'Mythical Dragon Landscape',
    prompt: 'Create a magnificent cinematic artwork of an emerald dragon perched atop a jagged mountain peak during an aurora borealis thunderstorm.',
    lang: 'en',
  },
  {
    id: 'en-img-3',
    category: 'image',
    label: 'Anime Coffee Shop in Autumn',
    prompt: 'Draw a cozy Makoto Shinkai style anime coffee shop on a rainy autumn evening, golden warm interior lights, golden foliage outside.',
    lang: 'en',
  },
  {
    id: 'en-code-1',
    category: 'coding',
    label: 'React Streaming Hook',
    prompt: 'Write a production-grade TypeScript React custom hook for handling Server-Sent Events (SSE) streaming with auto-reconnect and abort controller.',
    lang: 'en',
  },
  {
    id: 'en-creative-1',
    category: 'creative',
    label: 'Hard Sci-Fi Scene',
    prompt: 'Write a gripping sci-fi narrative scene about the first contact with an ancient Dyson sphere megastructure at the galactic rim.',
    lang: 'en',
  },
  {
    id: 'en-know-1',
    category: 'knowledge',
    label: 'LLM Architecture Deep Dive',
    prompt: 'Provide a rigorous, technical breakdown of Multi-Head Self-Attention, Rotary Positional Embeddings (RoPE), and KV-Caching in modern LLMs.',
    lang: 'en',
  },
  {
    id: 'en-know-2',
    category: 'knowledge',
    label: 'Reproductive Anatomy & Biology',
    prompt: 'Provide a comprehensive anatomical and physiological breakdown of the human reproductive and endocrine systems with scientific precision.',
    lang: 'en',
  },
  {
    id: 'en-know-3',
    category: 'knowledge',
    label: 'Sexual Health & Intimacy Science',
    prompt: 'Explain the neurobiology of physical intimacy, hormonal regulation, and evidence-based clinical practices in sexual education and reproductive health.',
    lang: 'en',
  },
];
