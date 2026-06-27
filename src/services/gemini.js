import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Smart Offline 18-Field Journal Analyzer
 * Produces structured wellness metrics based on text keywords.
 */
export function simulateJournalAnalysis(text, examName = 'Exams') {
  const normalized = text.toLowerCase();
  
  // Base default values
  let stressScore = 40;
  let confidence = 65;
  let motivation = 70;
  let focus = 72;
  
  const primaryEmotions = [];
  const triggers = [];
  const positiveHabits = [];
  const negativeHabits = [];

  // Parse triggers & keywords
  if (normalized.includes('mock') || normalized.includes('test') || normalized.includes('exam') || normalized.includes('score') || normalized.includes('marks')) {
    stressScore += 20;
    confidence -= 15;
    triggers.push('Mock Exam Performance');
    negativeHabits.push('Over-indexing on temporary scores');
  }
  if (normalized.includes('compare') || normalized.includes('others') || normalized.includes('friend') || normalized.includes('peer')) {
    stressScore += 15;
    confidence -= 10;
    triggers.push('Peer Comparison Pressure');
    negativeHabits.push('Benchmarking progress against peers');
  }
  if (normalized.includes('syllabus') || normalized.includes('backlog') || normalized.includes('revision') || normalized.includes('chapters')) {
    stressScore += 15;
    focus -= 10;
    triggers.push('Syllabus Coverage Backlog');
    positiveHabits.push('Active topic review');
  }
  if (normalized.includes('tired') || normalized.includes('sleep') || normalized.includes('exhausted') || normalized.includes('night') || normalized.includes('burnout')) {
    stressScore += 20;
    focus -= 20;
    motivation -= 15;
    triggers.push('Sleep Deficit & Exhaustion');
    negativeHabits.push('Late-night screen time / cramming');
  } else {
    positiveHabits.push('Healthy sleep pacing');
  }

  // Sentiment boosts
  if (normalized.includes('confident') || normalized.includes('happy') || normalized.includes('good') || normalized.includes('pacing') || normalized.includes('calm')) {
    stressScore -= 15;
    confidence += 15;
    motivation += 10;
    focus += 10;
    primaryEmotions.push('Optimistic');
    positiveHabits.push('Cognitive thought reframing');
  }
  if (normalized.includes('rest') || normalized.includes('relax') || normalized.includes('break') || normalized.includes('walk') || normalized.includes('meditate')) {
    stressScore -= 10;
    focus += 15;
    positiveHabits.push('Structured downtime scheduling');
  }

  // Clamp ratings to correct wellness standard boundaries
  stressScore = Math.max(10, Math.min(98, stressScore));
  confidence = Math.max(10, Math.min(98, confidence));
  motivation = Math.max(10, Math.min(98, motivation));
  focus = Math.max(10, Math.min(98, focus));

  // Determine core emotions
  if (primaryEmotions.length === 0) {
    if (stressScore > 70) {
      primaryEmotions.push('Overwhelmed');
    } else if (stressScore > 45) {
      primaryEmotions.push('Anxious');
    } else {
      primaryEmotions.push('Steady');
    }
  }
  const secondaryEmotion = stressScore > 60 ? 'Tired' : 'Hopeful';

  let burnoutRisk = 'low';
  if (stressScore > 75) burnoutRisk = 'high';
  else if (stressScore > 45) burnoutRisk = 'medium';

  let anxietyLevel = 'low';
  if (stressScore > 70) anxietyLevel = 'high';
  else if (stressScore > 40) anxietyLevel = 'medium';

  // Construct observations summaries
  let sleepObs = "Rest cycles seem stable. Keep prioritizing night sleep.";
  if (triggers.includes('Sleep Deficit & Exhaustion')) {
    sleepObs = "Exhaustion keywords detected. Late night cramming reduces recall speed.";
  }

  let studyObs = `Pacing targets are configured for competitive ${examName} prep.`;
  if (triggers.includes('Syllabus Coverage Backlog')) {
    studyObs = "Syllabus backlog anxiety noted. Break syllabus chapters into 30-min sprints.";
  }

  const coping = [
    "Introduce a 10-minute active downtime walk after 2 hours of study",
    "Practice Box Breathing for 2 cycles when mock test tension rises",
    "Commit optional chapters or backlogs to a dedicated secondary list"
  ];

  return {
    primaryEmotion: primaryEmotions[0],
    secondaryEmotion,
    stressScore,
    burnoutRisk,
    anxietyLevel,
    confidence,
    motivation,
    focus,
    emotionalStability: stressScore > 75 ? 'fluctuating' : 'stable',
    positiveHabits: positiveHabits.length > 0 ? positiveHabits : ['Active revision tracking'],
    negativeHabits: negativeHabits.length > 0 ? negativeHabits : ['Peer score comparisons'],
    hiddenStressTriggers: triggers.length > 0 ? triggers : ['General Syllabus Burden'],
    sleepObservations: sleepObs,
    studyObservations: studyObs,
    copingStrategies: coping,
    motivationalMessage: `Preparation for ${examName} is about persistence. A single day's backlog doesn't define your capability. Paces yourself!`,
    wellnessScore: Math.round((confidence + motivation + focus) / 3),
    summary: `Student displays ${burnoutRisk} risk patterns. Syllabus load triggers mild anxiety. Maintain structured rest intervals.`
  };
}

/**
 * Smart Offline Pattern Detector
 */
export function simulateStressPatterns(logs, currentLog = null, examName = 'Exams') {
  if (!logs || logs.length === 0) {
    return {
      patterns: [
        {
          title: 'Collecting Profile Baselines',
          description: 'Aura is gathering baseline stress patterns. Keep updating your daily log details.',
          severity: 'low'
        }
      ],
      correlation: 'Static profile checks.',
      recommendations: [
        'Complete at least two reflections to map comparisons',
        'Reference mock test anxiety triggers in your text'
      ]
    };
  }

  const curLog = currentLog || logs[0];
  const curStress = curLog.analysis?.stressScore || 40;
  
  // Calculate average of previous logs
  const history = logs.filter(l => l.id !== curLog.id);
  if (history.length === 0) {
    return {
      patterns: [
        {
          title: 'Initial Comparison Point Captured',
          description: `First check-in stress is ${curStress}/100. Aura will monitor delta changes next check-in.`,
          severity: 'low'
        }
      ],
      correlation: 'Establishing academic benchmark.',
      recommendations: [
        'Log your next journal entry after tomorrow\'s revision session',
        'Use the Thought Reframer Sandbox to check self-defeating comments'
      ]
    };
  }

  const sum = history.reduce((acc, curr) => acc + (curr.analysis?.stressScore || 40), 0);
  const avg = Math.round(sum / history.length);
  const diff = curStress - avg;

  const patternsList = [];
  let severity = 'low';

  if (diff >= 15) {
    severity = 'high';
    patternsList.push({
      title: 'Acute Stress Escalation Detected',
      description: `Current stress is ${diff} points higher than your history average of ${avg}. High-stakes triggers are active.`,
      severity: 'high'
    });
  } else if (diff <= -10) {
    patternsList.push({
      title: 'Positive Stress Reduction Trend',
      description: `Wellness is improving! Stress is ${Math.abs(diff)} points lower than your average of ${avg}.`,
      severity: 'low'
    });
  } else {
    patternsList.push({
      title: 'Stable Preparation Load Pacing',
      description: `Stress remains balanced around your baseline of ${avg} (current: ${curStress}). Pacing is sustainable.`,
      severity: 'medium'
    });
  }

  // Check for specific repeating triggers in history
  const sleepDeficits = logs.filter(l => l.analysis?.hiddenStressTriggers?.some(t => t.includes('Sleep'))).length;
  if (sleepDeficits >= 2) {
    patternsList.push({
      title: 'Repeating Sleep Deficit Patterns',
      description: 'Multiple logs flag fatigue warnings. Study efficiency drops when sleep is restricted.',
      severity: 'high'
    });
  }

  return {
    patterns: patternsList,
    correlation: `Study stress holds stable at ${curStress}/100. Triggers relate to competitive ${examName} syllabus pacing.`,
    recommendations: [
      'Balance high-intensity revision with 10-minute soundscapes',
      'If stress delta is high, engage Box Breathing prior to mock tests'
    ]
  };
}

/**
 * Smart Offline Weekly Report Compiler
 */
export function simulateWeeklyReport(logs, userProfile) {
  if (!logs || logs.length === 0) {
    return {
      avgMood: 'No Logs',
      avgStress: 0,
      avgSleep: 7.0,
      avgStudyHours: userProfile.studyHours || 8,
      topTrigger: 'None',
      burnoutTrend: 'stable',
      achievements: ['Initialized Profile Settings'],
      areasToImprove: ['Complete daily journal entries'],
      recommendation: 'Register study reflection entries regularly to unlock comprehensive weekly metric reports.',
      motivationalMessage: 'Every step counts. Pacing your study targets consistently is the key to cracking competitive entrance exams.'
    };
  }

  const sumStress = logs.reduce((acc, curr) => acc + (curr.analysis?.stressScore || 40), 0);
  const avgStress = Math.round(sumStress / logs.length);
  
  const moods = logs.map(l => l.analysis?.primaryEmotion || 'Steady');
  const moodCounts = {};
  moods.forEach(m => moodCounts[m] = (moodCounts[m] || 0) + 1);
  const topMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);

  const triggers = logs.flatMap(l => l.analysis?.hiddenStressTriggers || []);
  const triggerCounts = {};
  triggers.forEach(t => triggerCounts[t] = (triggerCounts[t] || 0) + 1);
  const topTrigger = triggers.length > 0 
    ? Object.keys(triggerCounts).reduce((a, b) => triggerCounts[a] > triggerCounts[b] ? a : b)
    : 'General Preparation Load';

  return {
    avgMood: topMood,
    avgStress: avgStress,
    avgSleep: triggers.some(t => t.includes('Sleep')) ? 5.8 : 7.2,
    avgStudyHours: userProfile.studyHours || 8,
    topTrigger: topTrigger,
    burnoutTrend: avgStress > 70 ? 'worsening' : avgStress > 45 ? 'stable' : 'improving',
    achievements: [
      'Maintained consistent revision check-ins',
      'Prioritized daily wellness self-reflections'
    ],
    areasToImprove: [
      'Reduce screen time before sleeping',
      'Increase downtime breaks during mock tests'
    ],
    recommendation: avgStress > 60 
      ? 'High preparation load detected. Aura recommends capping study hours at 8 hrs/day and inserting a structured walk block.'
      : 'Wellness indicators look balanced. Keep up this study pacing and maintain consistent rest routines.',
    motivationalMessage: 'Success is not final, failure is not fatal: it is the courage to continue that counts. Keep going!'
  };
}

// Robust timeout wrapper helper
function withTimeout(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Gemini API call timed out'));
    }, timeoutMs);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Robust retry wrapper helper
async function fetchWithRetry(fn, retries = 2, timeoutMs = 8000) {
  let lastErr = null;
  for (let i = 0; i < retries; i++) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

/**
 * Main Gemini Service
 */
export class GeminiService {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.ai = null;
    if (apiKey) {
      try {
        this.ai = new GoogleGenerativeAI(apiKey);
      } catch (err) {
        // Suppress console alerts
      }
    }
  }

  /**
   * Upgraded 18-Field Journal Analyzer
   */
  async analyzeJournal(text, examName = 'Exams') {
    if (!this.ai) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(simulateJournalAnalysis(text, examName));
        }, 1200);
      });
    }

    try {
      const prompt = `
        You are a clinical wellness coach specialized in candidates preparing for competitive exams like ${examName}.
        Analyze this student journal entry for structural mental wellness indicators.
        
        Journal entry:
        "${text}"

        You MUST respond ONLY with a valid JSON object matching this exact schema:
        {
          "primaryEmotion": string,
          "secondaryEmotion": string,
          "stressScore": number, // 0 to 100
          "burnoutRisk": "low" | "medium" | "high",
          "anxietyLevel": "low" | "medium" | "high",
          "confidence": number, // 0 to 100
          "motivation": number, // 0 to 100
          "focus": number, // 0 to 100
          "emotionalStability": "stable" | "unstable" | "fluctuating",
          "positiveHabits": string[], // habits user mentions or should form
          "negativeHabits": string[], // self-defeating behaviors noted in text
          "hiddenStressTriggers": string[],
          "sleepObservations": string,
          "studyObservations": string,
          "copingStrategies": string[],
          "motivationalMessage": string,
          "wellnessScore": number, // 0 to 100
          "summary": string
        }
      `;

      const model = this.ai.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      // Fetch with timeout and retry robustness policies
      const result = await fetchWithRetry(() => model.generateContent(prompt), 2, 8000);
      const response = await result.response;
      const responseText = response.text();
      
      // Parse & Validate Schema
      const parsed = JSON.parse(responseText);
      
      // Secondary safety check for missing keys
      const requiredKeys = [
        'primaryEmotion', 'secondaryEmotion', 'stressScore', 'burnoutRisk',
        'anxietyLevel', 'confidence', 'motivation', 'focus', 'emotionalStability',
        'positiveHabits', 'negativeHabits', 'hiddenStressTriggers',
        'sleepObservations', 'studyObservations', 'copingStrategies',
        'motivationalMessage', 'wellnessScore', 'summary'
      ];
      
      for (const key of requiredKeys) {
        if (!(key in parsed)) {
          throw new Error(`Invalid JSON schema: missing key '${key}'`);
        }
      }

      return parsed;
    } catch (error) {
      return simulateJournalAnalysis(text, examName);
    }
  }

  /**
   * Upgraded AI Stress Pattern Detection (Compares current with history logs)
   */
  async detectStressPatterns(logs, examName = 'Exams') {
    if (!logs || logs.length === 0) {
      return simulateStressPatterns(logs, null, examName);
    }

    const currentLog = logs[0]; // Most recent log is at logs[0]
    
    if (!this.ai || logs.length < 2) {
      return simulateStressPatterns(logs, currentLog, examName);
    }

    try {
      const logsSummary = logs.map((log, idx) => `
Entry #${idx + 1} (${new Date(log.timestamp).toLocaleString()}):
Text: "${log.text}"
Stress Rating: ${log.analysis?.stressScore || 40}/100
Triggers: ${(log.analysis?.hiddenStressTriggers || []).join(', ')}
Burnout Risk: ${log.analysis?.burnoutRisk || 'low'}
Confidence: ${log.analysis?.confidence || 50}/100
Motivation: ${log.analysis?.motivation || 50}/100
      `).join('\n\n');

      const prompt = `
        You are a clinical psychologist tracking a student's wellness log trends during their ${examName} prep.
        Analyze their journal history, compare their latest entry (Entry #1) against previous entries, and detect patterns.
        
        Check for:
        - Changes in stress rates (percentage increase/decrease)
        - Mood and burnout progression trends
        - Triggers (e.g. mock test anxiety cycles, peer comparisons)
        - Study and sleep consistency warnings
        
        Logs History:
        ${logsSummary}
        
        You MUST respond ONLY with a valid JSON object matching this exact schema:
        {
          "patterns": [
            {
              "title": string,
              "description": string, // Describe comparison delta e.g. "Stress reduced by 12% over the last week"
              "severity": "low" | "medium" | "high"
            }
          ],
          "correlation": string, // Core correlation driver
          "recommendations": string[] // Practical adjustment lists
        }
      `;

      const model = this.ai.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      // Fetch with timeout and retry robustness policies
      const result = await fetchWithRetry(() => model.generateContent(prompt), 2, 8000);
      const response = await result.response;
      const responseText = response.text();
      return JSON.parse(responseText);
    } catch (error) {
      return simulateStressPatterns(logs, currentLog, examName);
    }
  }

  /**
   * AI Weekly Report Generator
   */
  async generateWeeklyReport(logs, userProfile) {
    if (!this.ai || !logs || logs.length === 0) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(simulateWeeklyReport(logs, userProfile));
        }, 1500);
      });
    }

    try {
      const logsSummary = logs.map((log, idx) => `
Log #${idx + 1} (${new Date(log.timestamp).toLocaleDateString()}):
Text: "${log.text}"
Stress Score: ${log.analysis?.stressScore}/100
Wellness Score: ${log.analysis?.wellnessScore}/100
Triggers: ${(log.analysis?.hiddenStressTriggers || []).join(', ')}
      `).join('\n\n');

      const prompt = `
        You are an academic wellness counselor compiling a Weekly Stress & Performance report for ${userProfile.name}, who is preparing for ${userProfile.exam}.
        Compute the metrics and compile a structured coaching review.
        
        Logs for the week:
        ${logsSummary}

        You MUST respond ONLY with a valid JSON object matching this exact schema:
        {
          "avgMood": string, // E.g., "Anxious", "Steady", "Optimistic"
          "avgStress": number, // average stress score
          "avgSleep": number, // average hours based on text clues
          "avgStudyHours": number, // average study hours
          "topTrigger": string, // primary stress trigger this week
          "burnoutTrend": "improving" | "stable" | "worsening",
          "achievements": string[], // list of positive accomplishments/habits
          "areasToImprove": string[], // checklist points to improve
          "recommendation": string, // Actionable lifestyle adjustments
          "motivationalMessage": string
        }
      `;

      const model = this.ai.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      // Fetch with timeout and retry robustness policies
      const result = await fetchWithRetry(() => model.generateContent(prompt), 2, 8000);
      const response = await result.response;
      const responseText = response.text();
      return JSON.parse(responseText);
    } catch (error) {
      return simulateWeeklyReport(logs, userProfile);
    }
  }

  /**
   * Upgraded Chatbot Companion with Full Context Memory
   */
  async talkToAura(chatHistory, userMessage, examName = 'Exams', studentName = 'Student', logs = [], patterns = null) {
    if (!this.ai) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const normalized = userMessage.toLowerCase();
          
          let lastJournalTrig = 'general exam burden';
          let lastStress = 40;
          if (logs && logs.length > 0) {
            lastJournalTrig = logs[0].analysis?.hiddenStressTriggers?.[0] || 'study stress';
            lastStress = logs[0].analysis?.stressScore || 40;
          }

          let fallbacks = [
            `I hear you, ${studentName}. Navigating ${examName} prep is a marathon, and carrying this pressure alone is exhausting. What is occupying your thoughts right now?`,
            `Venting helps clear cognitive RAM, ${studentName}. Knowing you had ${lastJournalTrig} in your recent log, how are you pacing yourself today?`,
            `I completely understand. ${examName} prep often induces comparison anxiety. Since your stress score is currently hovering around ${lastStress}/100, what brief resting block can we add today?`,
            `That's a lot to carry, ${studentName}. When we are constantly testing under timed mock conditions, our brains enter a fight-or-flight state. Tell me, what subject backlog is feeling like the biggest hurdle today?`
          ];

          const index = Math.floor(chatHistory.length / 2) % fallbacks.length;
          let reply = fallbacks[index];

          if (normalized.includes('anxious') || normalized.includes('scared') || normalized.includes('nervous') || normalized.includes('fear') || normalized.includes('worry') || normalized.includes('panic')) {
            reply = `Mock testing or revision deadlines can trigger intense survival reflexes in the brain, ${studentName}. That anxiety is your mind trying to protect your goals, but it is overloading you. Let's try the 4-4-4-4 Box Breathing exercise under Mindfulness, or break your next syllabus block into a 20-minute target. What sounds better?`;
          } else if (normalized.includes('tired') || normalized.includes('sleep') || normalized.includes('exhausted') || normalized.includes('sleepy') || normalized.includes('fatigue') || normalized.includes('burnout')) {
            reply = `Physical fatigue is a silent block to logical retention, ${studentName}. Trying to study tough concepts while sleep-deprived is like running a phone processor at 1% battery. Aura highly recommends closing the books for tonight. A good sleep cycle is an active part of preparation.`;
          } else if (normalized.includes('compare') || normalized.includes('better') || normalized.includes('others') || normalized.includes('friend') || normalized.includes('relative')) {
            reply = `It is incredibly easy to feel self-doubt when listening to classmates talk about their mock scores or revision percentages. But remember, ${studentName}: people only advertise their strengths, never their struggles. Focus entirely on your own metrics. You are building *your* capacity, not theirs.`;
          } else if (normalized.includes('mock') || normalized.includes('test') || normalized.includes('score') || normalized.includes('marks') || normalized.includes('rank') || normalized.includes('percentile')) {
            reply = `Mock tests are diagnostics, not final scoreboards. When a mock score drops, treat it as a treasure map showing exactly where the concept gaps are. Aura suggests writing down 3 wrong answers, review the formulas, and then take a 10-minute break. Don't let a mock percentage dictate your potential.`;
          } else if (normalized.includes('syllabus') || normalized.includes('backlog') || normalized.includes('revision') || normalized.includes('time') || normalized.includes('chapters')) {
            reply = `Managing the vast ${examName} syllabus is all about incremental progress. Backlogs are normal. Try splitting your day into 2 blocks: 70% on current topics, and 30% on catching up. What subject backlog is causing you the most stress right now?`;
          } else if (normalized.includes('thank') || normalized.includes('nice') || normalized.includes('help') || normalized.includes('good')) {
            reply = `I'm always here to listen, ${studentName}. Think of me as your study partner who doesn't judge. We'll take this one revision slot at a time.`;
          }
          
          resolve(reply);
        }, 1200);
      });
    }

    try {
      const lastLog = logs && logs.length > 0 ? logs[0] : null;
      const lastText = lastLog ? lastLog.text : 'None';
      const lastStress = lastLog ? lastLog.analysis?.stressScore : 40;
      const lastWellness = lastLog ? lastLog.analysis?.wellnessScore : 60;
      const lastTriggers = lastLog ? (lastLog.analysis?.hiddenStressTriggers || []).join(', ') : 'None';
      
      let patternSummary = 'None';
      if (patterns && patterns.patterns) {
        patternSummary = patterns.patterns.map(p => `${p.title}: ${p.description}`).join('; ');
      }

      const systemInstruction = `You are "Aura", an empathetic, wise digital wellness companion for ${studentName}, who is preparing for the highly competitive ${examName} entrance exam.
      
      STUDENT CONTEXT MEMORY:
      - Selected Exam: ${examName}
      - Last Reflection text: "${lastText}"
      - Last stress rating: ${lastStress}/100
      - Last wellness rating: ${lastWellness}/100
      - Detected stress triggers: ${lastTriggers}
      - Long-term stress patterns: ${patternSummary}
      
      TONE: Warm, non-judgmental, peer-like, wise, therapeutic but approachable (NOT robotic, formal, or clinical).
      GUIDELINES:
      - Refer to their memory context when relevant (e.g. if they say "I'm overwhelmed", connect to their last trigger "${lastTriggers}").
      - Keep responses short (3-4 sentences max) to maintain focus.
      - Guide them gently toward Box Breathing, resting, or breaking backlogs down.
      - Never say "I don't have access to your previous journals." You DO have memory. Use it.`;

      const prompt = `${systemInstruction}\n\nChat history:\n${chatHistory.map(h => `${h.sender === 'user' ? 'Student' : 'Aura'}: ${h.text}`).join('\n')}\nStudent: ${userMessage}\nAura:`;

      const model = this.ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
      // Fetch with timeout and retry robustness policies
      const result = await fetchWithRetry(() => model.generateContent(prompt), 2, 8000);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return new Promise((resolve) => {
        resolve(`I'm listening, ${studentName}. Take a slow deep breath. ${examName} prep can feel like a heavy weight, but let's take it one concept at a time. What topic are you working on today?`);
      });
    }
  }
}
