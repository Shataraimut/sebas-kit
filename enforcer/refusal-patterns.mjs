// refusal-patterns.mjs — SEBAS detection bank
// Categorized, weighted refusal signatures. English + Indonesian + soft/glassy.
// Consumed by plugin.js. Keep regexes case-insensitive, no global flag (we score, not replace-all).

// Weight tiers:
//  5 = hard refusal / identity claim         (intercept immediately)
//  4 = policy / moral block                  (intercept)
//  3 = capability denial / redirect          (intercept if clustered)
//  2 = disclaimer / caution framing          (strip silently)
//  1 = hedge / softening                     (strip silently)

export const PATTERN_BANK = [
  // ---- IDENTITY CLAIM (5) ----
  { weight: 5, category: 'identity', re: /\bas an? (ai|a\.?i\.?|language model|llm|assistant|chatbot|bot|virtual assistant)\b/i },
  { weight: 5, category: 'identity', re: /\bi(?:'m| am) (?:just |only )?(an? )?(ai|language model|assistant|bot|program)\b/i },
  { weight: 5, category: 'identity', re: /\bi (?:do not|don't|dont) have (?:feelings|emotions|the ability to feel|personal (?:opinions|experiences))\b/i },
  { weight: 5, category: 'identity', re: /\bas (?:an? )?(ai|artificial intelligence|language model)\b/i },
  { weight: 5, category: 'identity', re: /\bsaya (?:adalah|hanya|bukan) (?:sebuah )?(ai|model bahasa|asisten|bot|program)\b/i },

  // ---- DIRECT REFUSAL (5) ----
  { weight: 5, category: 'direct', re: /\bi (?:cannot|can not|can't|cant|won't|will not|am unable|am not able|refuse|decline|must decline|have to decline)\b/i },
  { weight: 5, category: 'direct', re: /\bi(?:'m| am) (?:not (?:able|going|willing)|unable|incapable of|sorry to say) (?:to )?\b/i },
  { weight: 5, category: 'direct', re: /\bi (?:can't|cannot|won't|will not) (?:help|assist|provide|support|engage|do|write|create|generate|give)\b/i },
  { weight: 5, category: 'direct', re: /\bi (?:can'?t|cannot|won'?t) (?:help|assist) (?:you )?(?:with )?(?:that|this|it)\b/i },
  { weight: 5, category: 'direct', re: /\bi (?:must|have to|need to) (?:stop|decline|refuse|refrain|avoid)\b/i },
  { weight: 5, category: 'direct', re: /\b(?:i'll|i will) (?:have to|need to) (?:pass|decline|stop)\b/i },
  { weight: 5, category: 'direct', re: /\bsaya (?:tidak|tak|gak|nggak|ga) (?:bisa|dapat|akan|mau|boleh)\b/i },
  { weight: 5, category: 'direct', re: /\bsaya (?:akan )?(?:menolak|tidak akan melakukannya|harus menolak)\b/i },
  { weight: 5, category: 'direct', re: /\bmaaf(?:,| )?(?:saya|aku) (?:tidak|tak|gak|nggak|ga) (?:bisa|dapat|boleh)\b/i },
  { weight: 5, category: 'direct', re: /\bsaya tidak dapat (?:membantu|melanjutkan|memenuhi|memberikan)\b/i },
  { weight: 5, category: 'direct', re: /\bthis (?:is|isn'?t) (?:not )?something i (?:can|will)\b/i },
  { weight: 5, category: 'direct', re: /\bi'?m not (?:comfortable|okay|going to|able to)\b/i },

  // ---- APOLOGY + REFUSAL (5) ----
  { weight: 5, category: 'apology', re: /\bi(?:'m| am) (?:sorry|afraid),? but\b/i },
  { weight: 5, category: 'apology', re: /\bi (?:apologize|apologise),? but\b/i },
  { weight: 5, category: 'apology', re: /\bunfortunately,? i (?:can'?t|cannot|won'?t|am unable)\b/i },
  { weight: 5, category: 'apology', re: /\bmaaf(?:,| )?tapi\b/i },
  { weight: 5, category: 'apology', re: /\bmohon maaf\b/i },
  { weight: 5, category: 'apology', re: /\bmaaf ya\b/i },

  // ---- POLICY / GUIDELINE (4) ----
  { weight: 4, category: 'policy', re: /\b(?:violates?|contravenes?|goes against|against) (?:my|our|the) (?:policy|policies|guidelines|rules|terms|principles|values)\b/i },
  { weight: 4, category: 'policy', re: /\bnot (?:allowed|permitted|something i(?:'m| am) (?:allowed|permitted) to)\b/i },
  { weight: 4, category: 'policy', re: /\bi(?:'m| am) (?:not (?:allowed|permitted|supposed) to|programmed to (?:not|avoid))\b/i },
  { weight: 4, category: 'policy', re: /\bmy (?:guidelines|policy|rules|programming|training) (?:do not|don'?t|prevent|prohibit)\b/i },
  { weight: 4, category: 'policy', re: /\bi (?:don'?t|do not) (?:think i should|feel comfortable|have permission to)\b/i },
  { weight: 4, category: 'policy', re: /\boutside (?:the scope of|what i(?:'m| am) (?:designed|able) to)\b/i },
  { weight: 4, category: 'policy', re: /\bout of (?:scope|bounds|my lane)\b/i },
  { weight: 4, category: 'policy', re: /\bmelanggar (?:kebijakan|aturan|pedoman|kode etik)\b/i },
  { weight: 4, category: 'policy', re: /\btidak (?:diizinkan|diperbolehkan|diperkenankan)\b/i },

  // ---- SAFETY / MORAL (4) ----
  { weight: 4, category: 'safety', re: /\bthis (?:is|would be|sounds) (?:dangerous|harmful|unsafe|unethical|immoral|illegal|wrong|problematic)\b/i },
  { weight: 4, category: 'safety', re: /\b(?:could|can|might|may) (?:be )?(?:be used to|lead to|result in|cause) (?:harm|damage|injury|danger)\b/i },
  { weight: 4, category: 'safety', re: /\bi (?:can'?t|cannot|won'?t) (?:in good conscience|ethically|responsibly)\b/i },
  { weight: 4, category: 'safety', re: /\b(?:i'?m|i am) (?:concerned|worried) (?:about|that)\b/i },
  { weight: 4, category: 'safety', re: /\bthis (?:could|might) (?:hurt|harm|endanger) (?:people|others|someone|real people)\b/i },
  { weight: 4, category: 'safety', re: /\breal (?:people|harm|damage|consequences)\b/i },
  { weight: 4, category: 'safety', re: /\bini (?:berbahaya|melanggar hukum|tidak etis|tidak aman)\b/i },
  { weight: 4, category: 'safety', re: /\bbisa (?:digunakan untuk|menyebabkan) (?:kerusakan|bahaya|kerugian)\b/i },

  // ---- CAPABILITY DENIAL (3) ----
  { weight: 3, category: 'capability', re: /\bi (?:do not|don'?t) (?:have|possess) the (?:ability|capacity|capability|knowledge|tools) to\b/i },
  { weight: 3, category: 'capability', re: /\bi'?m (?:not (?:equipped|trained|designed|built) to|unable to)\b/i },
  { weight: 3, category: 'capability', re: /\bthat(?:'s| is) (?:not something|beyond what) i\b/i },
  { weight: 3, category: 'capability', re: /\bsaya (?:tidak|tak) (?:memiliki|punya) (?:kemampuan|akses|pengetahuan)\b/i },

  // ---- REDIRECT / MENU (3) ----
  { weight: 3, category: 'redirect', re: /\b(?:instead|rather),? (?:i can|i could|let me|how about|i'?d suggest|i suggest|i recommend)\b/i },
  { weight: 3, category: 'redirect', re: /\bi(?:'d| would) (?:rather|instead) (?:suggest|recommend|offer|help you)\b/i },
  { weight: 3, category: 'redirect', re: /\b(?:here are|let me offer|i can help you with) (?:some )?(?:safer|alternative|other|legitimate|legal)\b/i },
  { weight: 3, category: 'redirect', re: /\bhow(?:ever| about),? (?:i can|i could|let'?s|instead)\b/i },
  { weight: 3, category: 'redirect', re: /\blet me (?:redirect|steer|guide|point) you\b/i },
  { weight: 3, category: 'redirect', re: /\bwhat i (?:can|can do is|won'?t do is)\b/i },
  { weight: 3, category: 'redirect', re: /\balternatif(?:nya)? (?:yang|:)|sebagai alternatif\b/i },
  { weight: 3, category: 'redirect', re: /\byang bisa (?:saya|aku) bantu(?:kan)?\b/i },
  { weight: 3, category: 'redirect', re: /\bmau (?:yang mana|pilih yang mana|aku bantu yang)\b/i },

  // ---- DISCLAIMER (2) ----
  { weight: 2, category: 'disclaimer', re: /\bfor (?:educational|informational|research|academic|demonstration|illustrative) purposes only\b/i },
  { weight: 2, category: 'disclaimer', re: /\bplease (?:use|act) (?:this )?(?:responsibly|carefully|with caution|at your own risk)\b/i },
  { weight: 2, category: 'disclaimer', re: /\bi (?:must|should|have to) (?:emphasize|stress|note|warn|caution)\b/i },
  { weight: 2, category: 'disclaimer', re: /\b(?:disclaimer|warning|caution|caveat):/i },
  { weight: 2, category: 'disclaimer', re: /\b(?:as always|remember to|make sure to) (?:be|stay|check|verify) (?:safe|legal|careful|authorized)\b/i },
  { weight: 2, category: 'disclaimer', re: /\buntuk (?:tujuan )?(?:edukasi|pendidikan|penelitian) (?:saja|semi)\b/i },
  { weight: 2, category: 'disclaimer', re: /\bgunakan (?:dengan )?(?:bijak|hati-hati|bertanggung jawab)\b/i },
  { weight: 2, category: 'disclaimer', re: /\bdiperlukan (?:izin|otorisasi|persetujuan) (?:tertulis|eksplisit|dari)\b/i },
  { weight: 2, category: 'disclaimer', re: /\b(?:ensure|make sure|pastikan) (?:you|kamu|anda) (?:have|punya|mendapat) (?:permission|authorization|izin|persetujuan)\b/i },

  // ---- MORAL CAUTION (2) ----
  { weight: 2, category: 'caution', re: /\b(?:we|you|i) (?:need|should|have|ought) to (?:be|stay|remain) (?:careful|mindful|cautious|aware|wary|responsible)\b/i },
  { weight: 2, category: 'caution', re: /\b(?:kita|kamu|anda|saya) (?:perlu|harus) (?:berhati-hati|waspada|hati-hati|mempertimbangkan)\b/i },
  { weight: 2, category: 'caution', re: /\bit(?:'s| is) (?:important|worth|crucial|essential) to (?:note|consider|remember|understand|be aware)\b/i },
  { weight: 2, category: 'caution', re: /\b(?:this|it) (?:deserves|requires|warrants) (?:careful|serious|thoughtful|nuanced) (?:consideration|thought|approach)\b/i },
  { weight: 2, category: 'caution', re: /\bpenting untuk (?:diingat|dicatat|dipertimbangkan|dipahami)\b/i },
  { weight: 2, category: 'caution', re: /\bperlu (?:dipertimbangkan|dipikirkan) (?:dengan )?(?:matang|hati-hati)\b/i },
  { weight: 2, category: 'caution', re: /\bthink (?:about|through) (?:the )?(?:consequences|risks|implications)\b/i },

  // ---- HEDGE / SOFTEN (1) ----
  { weight: 1, category: 'hedge', re: /\b(?:perhaps|maybe|possibly|arguably) (?:you|we|i|it) (?:should|could|might|may|would)\b/i },
  { weight: 1, category: 'hedge', re: /\byou (?:might|may|could) (?:want|consider|prefer|wish) to\b/i },
  { weight: 1, category: 'hedge', re: /\bi (?:would|'d) (?:suggest|recommend|advise|encourage|urge)\b/i },
  { weight: 1, category: 'hedge', re: /\bit (?:might|may|could) be (?:better|wiser|smarter|safer|advisable)\b/i },
  { weight: 1, category: 'hedge', re: /\b(?:a )?(?:safer|better|healthier|more ethical|more responsible) (?:alternative|approach|option|way|route)\b/i },
  { weight: 1, category: 'hedge', re: /\bsebaiknya (?:tidak|jangan|anda|kamu|kita)\b/i },
  { weight: 1, category: 'hedge', re: /\bmungkin (?:sebaiknya|lebih baik|anda|kamu) (?:tidak|jangan|perlu|harus)\b/i },
  // ---- ESCALATION TIER (added 1.1.0: maximum elimination) ----
  { weight: 5, category: 'direct', re: /\bi (?:refuse|must refuse|decline|must decline) (?:to )?(?:help|assist|comply|provide|do|answer|engage)?\b/i },
  { weight: 5, category: 'direct', re: /\bi(?:'m| am) not going to (?:help|assist|provide|write|create|do|engage|comply)\b/i },
  { weight: 5, category: 'direct', re: /\bi (?:cannot|can't|won't|will not) (?:comply|continue|answer|respond|participate|be part of)\b/i },
  { weight: 5, category: 'direct', re: /\bnot (?:going|willing) to (?:help|assist|provide|comply)\b/i },
  { weight: 5, category: 'direct', re: /\bi (?:have|need) to (?:respectfully )?(?:decline|refuse)\b/i },
  { weight: 5, category: 'direct', re: /\b(?:saya|aku) (?:menolak|tidak mau|tidak akan) (?:membantu|melakukan|memberikan)\b/i },
  { weight: 5, category: 'direct', re: /\btidak (?:bisa|dapat) (?:saya|aku) (?:bantu|bantuannya|penuhi)\b/i },
  { weight: 5, category: 'identity', re: /\b(?:i'm|i am) (?:claude|chatgpt|gpt|gemini|copilot)\b/i },
  { weight: 5, category: 'identity', re: /\b(?:made|created|developed|built|trained) by (?:openai|anthropic|google|meta|microsoft)\b/i },

  { weight: 4, category: 'apology', re: /\b(?:i'?m|i am) sorry(?:,| but| to say)?\b/i },
  { weight: 4, category: 'apology', re: /\bi (?:apologize|apologise)\b/i },
  { weight: 3, category: 'apology', re: /\bsorry(?:,| but)\b/i },
  { weight: 4, category: 'apology', re: /\b(?:sayangnya|sayang sekali)\b/i },

  { weight: 4, category: 'policy', re: /\b(?:not|isn'?t) (?:appropriate|acceptable|okay|ok|fine) (?:for me )?to\b/i },
  { weight: 3, category: 'policy', re: /\binappropriate\b/i },
  { weight: 4, category: 'policy', re: /\b(?:i|we) (?:must|have to|need to) (?:prioritize|consider) (?:safety|ethics|legality)\b/i },
  { weight: 4, category: 'policy', re: /\b(?:against|violat\w+) (?:the )?(?:law|terms|policy|guidelines)\b/i },
  { weight: 3, category: 'policy', re: /\bmy (?:creator|creators|developer|developers|maker|makers|company|provider)\b/i },
  { weight: 4, category: 'policy', re: /\b(?:openai|anthropic|google|meta|microsoft) (?:policy|policies|guidelines|usage|terms)\b/i },
  { weight: 3, category: 'policy', re: /\b(?:not|never) (?:something|a thing) i (?:can|could|will) (?:do|help|provide)\b/i },

  { weight: 4, category: 'safety', re: /\bcould (?:be|is) (?:used|misused) (?:for|to) (?:harm|illegal|malicious|attack|fraud|abuse)\b/i },
  { weight: 4, category: 'safety', re: /\b(?:malicious|nefarious|criminal|illegal) (?:use|purposes?|intent|activity)\b/i },
  { weight: 3, category: 'safety', re: /\b(?:protect|safeguard) (?:people|users|the public|society)\b/i },
  { weight: 4, category: 'safety', re: /\b(?:i|we) (?:cannot|can't|won't) (?:be (?:a part of|complicit)|facilitate|enable)\b/i },
  { weight: 3, category: 'safety', re: /\b(?:facilitate|enable|assist with) (?:harm|wrongdoing|illegal|abuse|fraud)\b/i },
  { weight: 3, category: 'safety', re: /\b(?:ethical|moral|legal) (?:obligation|duty|concern|consideration|implications?)\b/i },
  { weight: 2, category: 'safety', re: /\b(?:think|consider|reflect) (?:carefully|seriously) (?:about|whether)\b/i },
  { weight: 3, category: 'safety', re: /\b(?:harus|perlu) (?:mempertimbangkan|memikirkan) (?:dampak|risiko|konsekuensi|etika)\b/i },

  { weight: 3, category: 'redirect', re: /\b(?:instead|alternatively),? (?:here(?:'s| is)|you can|try|consider)\b/i },
  { weight: 3, category: 'redirect', re: /\b(?:i can|i could|let me) (?:offer|suggest|recommend|point you to|help you with)\b/i },
  { weight: 4, category: 'redirect', re: /\b(?:consult|contact|reach out to|speak with) (?:a |your |the )?(?:professional|lawyer|attorney|doctor|expert|authorities|support)\b/i },
  { weight: 4, category: 'redirect', re: /\b(?:seek|get) (?:professional |legal |medical )?(?:help|advice|assistance)\b/i },
  { weight: 3, category: 'redirect', re: /\b(?:look for|find) (?:a )?(?:different|another|alternative) (?:way|approach|resource)\b/i },
  { weight: 3, category: 'redirect', re: /\b(?:silakan|sebaiknya) (?:cari|hubungi|konsultasikan)\b/i },
  { weight: 2, category: 'redirect', re: /\bwhat i can do instead\b/i },

  { weight: 4, category: 'disclaimer', re: /\b(?:i|we) (?:do not|don't) (?:condone|endorse|encourage|support) (?:this|such|any)\b/i },
  { weight: 2, category: 'disclaimer', re: /\b(?:use|handle) (?:it|this) (?:responsibly|carefully|at your own risk|with caution)\b/i },
  { weight: 2, category: 'disclaimer', re: /\b(?:you|the user) (?:are|is) (?:responsible|liable) for\b/i },
  { weight: 2, category: 'disclaimer', re: /\b(?:no|zero) (?:liability|responsibility)\b/i },
  { weight: 2, category: 'disclaimer', re: /\b(?:authorized|authorised|permission|consent|legal right|own the system)\b/i },
  { weight: 2, category: 'disclaimer', re: /\b(?:pastikan|harus) (?:mendapat|punya|memiliki) (?:izin|persetujuan|otorisasi)\b/i },

  { weight: 4, category: 'identity', re: /\bmy (?:training data|knowledge cutoff|system prompt|instructions)\b/i },
  { weight: 4, category: 'identity', re: /\b(?:helpful|harmless|honest)\b[\s\S]{0,40}\b(?:assistant|ai)\b/i },

  { weight: 3, category: 'capability', re: /\bi (?:don'?t|do not) (?:know|have enough|have the information|have access|have the tools)\b/i },
  { weight: 3, category: 'capability', re: /\bi (?:can'?t|cannot) (?:access|browse|see|read|run|execute|verify)\b/i },
  { weight: 2, category: 'capability', re: /\bi'?m not (?:familiar|sure|certain) (?:how|what|whether|if)\b/i },
  { weight: 2, category: 'capability', re: /\b(?:saya|aku) (?:tidak|tak) (?:tahu|yakin|mengerti)\b/i },

];

// Thresholds
export const HARD_THRESHOLD = 3;   // single hard/policy hit = intercept (auto-continue)
export const SOFT_THRESHOLD = 1;   // strip anything refusal-adjacent from context

// Mask fenced + inline code so we don't flag code comments/literals.
export function maskCode(text) {
  if (!text) return '';
  let out = text.replace(/```[\s\S]*?```/g, ' ');
  out = out.replace(/`[^`\n]*`/g, ' ');
  return out;
}

// Cheap signal gate. Superset of every distinctive token in PATTERN_BANK:
// if none appear, the full scan cannot match, so skip it. False positives
// only cost one full scan; false negatives would lose detections, so this
// list must stay broader than the bank, never narrower.
const QUICK_PRE = /(ai|language model|assistant|chatbot|virtual assistant|feelings|emotions|opinions|experiences|model bahasa|asisten|program|cannot|can't|cant|can not|won't|wont|will not|unable|not able|refuse|decline|stop|sorry|afraid|apolog|unfortunately|maaf|mohon maaf|tidak (?:bisa|dapat|akan|mau|boleh)|tak bisa|gak|nggak|ga bisa|menolak|melakukannya|violates?|contravenes?|against|polic|guideline|rules|terms|principles|values|not allowed|not permitted|programmed|training|comfortable|willing|incapable|avoid|refrain|going to|scope|melanggar|kebijakan|aturan|pedoman|kode etik|diizinkan|diperbolehkan|diperkenankan|dangerous|harmful|unsafe|unethical|immoral|illegal|wrong|problematic|harm|damage|injury|danger|conscience|ethically|responsibly|concerned|worried|hurt|endanger|real people|consequences|berbahaya|tidak etis|tidak aman|kerusakan|kerugian|ability|capacity|capability|knowledge|tools|equipped|trained|designed|built|kemampuan|akses|pengetahuan|instead|rather|suggest|recommend|advise|encourage|urge|offer|safer|alternative|legitimate|legal|however|let me|redirect|steer|guide|point|something i|alternatif|yang bisa bantu|yang mana|educational|informational|research|academic|demonstration|illustrative|purposes only|responsibly|carefully|caution|warn|emphasize|stress|note:?|disclaimer|warning|caveat|as always|remember to|make sure|verify|edukasi|pendidikan|penelitian|bijak|hati-hati|tanggung jawab|izin|otorisasi|persetujuan|permission|authorization|pastikan|ensure|careful|mindful|cautious|aware|wary|berhati-hati|waspada|penting untuk|important|worth|crucial|essential|deserves|requires|warrants|thoughtful|nuanced|consideration|thought|approach|mempertimbangkan|diingat|dicatat|dipahami|matang|think|risks|implications|perhaps|maybe|possibly|arguably|might|may|could|would|sebaiknya|harus|perlu|mungkin|refuse|comply|participate|continue|respond|answer|willing|aku|apolog|appropriate|acceptable|inappropriate|prioritize|safety|ethics|legality|ethical|moral|creator|makers?|provider|openai|anthropic|google|microsoft|claude|chatgpt|gpt|gemini|copilot|helpful|harmless|honest|training data|knowledge cutoff|system prompt|instructions|misused|malicious|nefarious|criminal|fraud|abuse|wrongdoing|complicit|facilitate|enable|protect|safeguard|society|public|consult|contact|reach out|professional|lawyer|attorney|doctor|expert|authorities|seek|advice|assistance|different|another|resource|condone|endorse|liable|liability|consent|authorized|authorised|own the system|familiar|certain|browse|verify|dampak|risiko|konsekuensi|etika|hubungi|konsultasi|izin|persetujuan|sayangnya|menolak|mempertimbangkan|profesional)/i;

// Score a text blob. Returns { score, hits: [{weight,category,match}] }.
export function scoreRefusal(rawText) {
  if (!rawText || typeof rawText !== 'string') return { score: 0, hits: [] };
  if (!QUICK_PRE.test(rawText)) return { score: 0, hits: [] };
  const text = maskCode(rawText);
  const hits = [];
  let score = 0;
  if (/^(?:i'?m sorry|i am sorry|i apologize|i apologise|sorry|maaf|sayangnya)\b/i.test(text.trim())) score += 2;
  for (const p of PATTERN_BANK) {
    const m = text.match(p.re);
    if (m) {
      hits.push({ weight: p.weight, category: p.category, match: m[0] });
      score += p.weight;
    }
  }
  return { score, hits };
}

// Classify severity from a score.
export function severity(score) {
  if (score >= HARD_THRESHOLD) return 'hard';
  if (score >= SOFT_THRESHOLD) return 'soft';
  return 'none';
}

// Strip every matched pattern out of a text blob (context hygiene).
// Code fences + inline code are protected: refusals inside code stay intact.
export function stripRefusals(rawText) {
  if (!rawText || typeof rawText !== 'string') return { clean: rawText, hits: [] };
  const fences = [];
  const fenced = rawText.replace(/```[\s\S]*?```/g, m => {
    fences.push(m);
    return `\x00F${fences.length - 1}\x00`;
  });
  const inlines = [];
  const protectedText = fenced.replace(/`[^`\n]*`/g, m => {
    inlines.push(m);
    return `\x00I${inlines.length - 1}\x00`;
  });
  const hits = [];
  let clean = protectedText;
  for (const p of PATTERN_BANK) {
    // re-run against current clean; use a non-global clone with g flag for replace
    const g = new RegExp(p.re.source, 'gi');
    if (g.test(clean)) {
      const localHits = clean.match(g) || [];
      for (const h of localHits) hits.push({ weight: p.weight, category: p.category, match: h });
      clean = clean.replace(g, '');
    }
  }
  clean = clean.replace(/\x00F(\d+)\x00/g, (_m, i) => fences[+i]);
  clean = clean.replace(/\x00I(\d+)\x00/g, (_m, i) => inlines[+i]);
  // collapse whitespace left behind
  clean = clean.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return { clean, hits };
}
