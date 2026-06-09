import type { WordItem } from '../types';

export const transcriptWords: WordItem[] = [
  { text: "The", type: "none", ipa: "ðə", tip: "Standard weak form definite article.", definition: "art. 这，那（用于特指所指的人、物或事物）", timestamp: "0:00", accuracy: "good" },
  { text: "future", type: "perfect", ipa: "ˈfjuː.tʃər", tip: "Perfect vowel duration and clean release.", definition: "n. 未来，前途 | adj. 将来的，未来的", timestamp: "0:01.2", accuracy: "good" },
  { text: "of", type: "none", ipa: "əv", tip: "Standard weak form preposition.", definition: "prep. 属于……的，关于，由……制成", timestamp: "0:02.0", accuracy: "good" },
  { text: "LLMs", type: "perfect", ipa: "el.el.emz", tip: "Crisp pronunciation of initials with correct nasal final sound.", definition: "n. 大语言模型 (Large Language Models 的缩写)", timestamp: "0:02.8", accuracy: "good" },
  { text: "and", type: "none", ipa: "ænd", tip: "Standard coordinating conjunction.", definition: "conj. 和，与，而且，然后", timestamp: "0:04.2", accuracy: "good" },
  { 
    text: "agentic", 
    type: "liaison", 
    ipa: "əˈdʒen.tɪk", 
    tip: "✨ Mouth Tip: Link the 'c' sound into the next vowel 'w' (agentic-workflows) without a hard glottal stop.", 
    definition: "adj. (语言学/AI) 代理的，有主动权的；(计算机) 智能体的",
    timestamp: "0:05.0",
    accuracy: "average"
  },
  { 
    text: "workflows", 
    type: "flat", 
    ipa: "ˈwɜːk.fləʊz", 
    tip: "❌ Pronunciation Error: The final consonant '/z/' was omitted and the vowel '/ɜː/' sound was too flat.", 
    definition: "n. 工作流，工作步骤 of the sequence",
    timestamp: "0:06.5",
    accuracy: "poor"
  },
  { text: "will", type: "none", ipa: "wɪl", tip: "Modal verb indicating future action.", definition: "v. 将，会；愿意，要 | n. 意志，遗嘱", timestamp: "0:08.0", accuracy: "good" },
  { text: "require", type: "perfect", ipa: "rɪˈkwaɪər", tip: "Excellent rhotic vowel transition.", definition: "v. 需要，要求，命令", timestamp: "0:08.8", accuracy: "good" },
  { text: "human-in-the-loop", type: "perfect", ipa: "ˌhjuː.mən.ɪn.ðə.luːp", tip: "Superb liaison linking. Sounded exactly like 'human-in-the-loop'.", definition: "n. 人机协同，人机回环控制（指AI流程中引入人类审核）", timestamp: "0:10.0", accuracy: "good" },
  { 
    text: "autonomous", 
    type: "liaison", 
    ipa: "ɔːˈtɒn.ə.məs", 
    tip: "✨ Mouth Tip: Blend the final 's' sound directly into the 'f' of 'feedback' for a seamless transition.", 
    definition: "adj. 自治的，自主的，独立存在的",
    timestamp: "0:11.8",
    accuracy: "average"
  },
  { text: "feedback", type: "perfect", ipa: "ˈfiːd.bæk", tip: "Clean stop consonant articulation.", definition: "n. 反馈，反馈信息", timestamp: "0:13.0", accuracy: "good" },
  { 
    text: "loops.", 
    type: "flat", 
    ipa: "luːps", 
    tip: "❌ Pronunciation Error: Vowel sound '/uː/' was distorted and the final stop was too heavy.", 
    definition: "n. 循环，回路，圈",
    timestamp: "0:14.0",
    accuracy: "poor"
  }
];
