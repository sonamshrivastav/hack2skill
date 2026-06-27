import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Smart Offline 18-Field Journal Analyzer
 * Produces structured wellness metrics based on text keywords.
 */
function simulateJournalAnalysis(text, examName = 'Exams') {
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
  if (normalized.includes('confident') || normalized.includes('clear') || normalized.includes('ready') || normalized.includes('solve')) {
    confidence += 20;
    motivation += 15;
    focus += 10;
    stressScore -= 15;
    primaryEmotions.push('Optimism');
    positiveHabits.push('Self-affirmation practice');
  }
  if (normalized.includes('scared') || normalized.includes('fail') || normalized.includes('hopeless') || normalized.includes('give up')) {
    confidence -= 25;
    motivation -= 25;
    stressScore += 20;
    primaryEmotions.push('Self-Doubt');
  }

  // Bounds clamping
  stressScore = Math.max(10, Math.min(stressScore, 98));
  confidence = Math.max(10, Math.min(confidence, 98));
  motivation = Math.max(10, Math.min(motivation, 98));
  focus = Math.max(10, Math.min(focus, 98));

  // Secondary emotion selection
  let primary = primaryEmotions[0] || (stressScore > 65 ? 'Anxiety' : stressScore > 40 ? 'Overwhelm' : 'Calm');
  let secondary = stressScore > 75 ? 'Fatigue' : stressScore > 45 ? 'Self-Doubt' : 'Hopeful';

  // Burnout risk
  let burnoutRisk = 'low';
  if (stressScore > 75) burnoutRisk = 'high';
  else if (stressScore > 45) burnoutRisk = 'medium';

  // Anxiety level
  let anxietyLevel = 'low';
  if (stressScore > 70) anxietyLevel = 'high';
  else if (stressScore > 40) anxietyLevel = 'medium';

  // Emotional stability
  let emotionalStability = 'stable';
  if (stressScore > 75) emotionalStability = 'unstable';
  else if (stressScore > 45) emotionalStability = 'fluctuating';

  // Wellness score
  let wellnessScore = Math.round(100 - (stressScore * 0.7) + (confidence * 0.15) + (focus * 0.15));
  wellnessScore = Math.max(10, Math.min(wellnessScore, 98));

  // Defaults fallback
  if (triggers.length === 0) triggers.push('Syllabus Revision Loading');
  if (positiveHabits.length === 0) positiveHabits.push('Maintaining regular journals');
  if (negativeHabits.length === 0) negativeHabits.push('Slightly irregular rest boundaries');

  // Sleep and study observations
  const sleepObservations = normalized.includes('sleep') || normalized.includes('tired')
    ? 'Exhaustion noted in logs. Late-night focus is compromising REM recovery.'
    : 'Sleep observations seem relatively stable, though mental recovery checks are advised.';
    
  const studyObservations = normalized.includes('mock') || normalized.includes('syllabus')
    ? 'Student is actively addressing mock test schedules, though backlog anxiety drops focus.'
    : 'Study pacing is progressing, maintaining consistent Pomodoro cycles.';

  // Coping strategies
  const copingStrategies = [];
  if (stressScore > 75) {
    copingStrategies.push('Enforce an immediate 15-minute complete digital cutoff');
    copingStrategies.push('Perform a 4-4-4-4 box breathing cycle for 2 minutes');
  } else {
    copingStrategies.push('Break the next concept card into a 25-minute Pomodoro slot');
  }
  copingStrategies.push('Avoid relative peer comparisons; track personal metrics only');
  copingStrategies.push('Review incorrect questions in mock tests without looking at the score');

  const summary = `Preparation status is currently in the ${burnoutRisk === 'high' ? 'critical overload warning' : burnoutRisk === 'medium' ? 'mild adjustment needed' : 'stable balanced'} zone.`;

  const motivationalMessage = stressScore > 75
    ? `Take a deep breath. You are running a marathon for ${examName}. Slowing down for a moment to rest will actually speed up your long-term memory. We believe in you.`
    : `Excellent persistence. Pacing your study sessions systematically is how you climb this mountain. Keep going!`;

  return {
    primaryEmotion: primary,
    secondaryEmotion: secondary,
    stressScore,
    burnoutRisk,
    anxietyLevel,
    confidence,
    motivation,
    focus,
    emotionalStability,
    positiveHabits,
    negativeHabits,
    hiddenStressTriggers: triggers,
    sleepObservations,
    studyObservations,
    copingStrategies,
    motivationalMessage,
    wellnessScore,
    summary
  };
}

/**
 * Smart Offline Pattern Detector
 */
function simulateStressPatterns(logs, currentLog = null, examName = 'Exams') {
  if (!logs || logs.length === 0) {
    return {
      patterns: [
        {
          title: 'Collecting Profile Baselines',
          description: 'Aura is waiting for daily journal entries to analyze stress fluctuations.',
          severity: 'low'
        }
      ],
      correlation: 'Requires logs to map stress correlations.',
      recommendations: ['Perform reflections after mocks and mock reviews.']
    };
  }

  const patterns = [];
  const recommendations = [];

  let totalStress = 0;
  let mockTrigCount = 0;
  let peerTrigCount = 0;
  let sleepTrigCount = 0;
  let lateNightCount = 0;

  logs.forEach(log => {
    const analysis = log.analysis || {};
    totalStress += (analysis.stressScore || 40);

    const trigs = analysis.hiddenStressTriggers || [];
    if (trigs.some(t => t.includes('Mock') || t.includes('Performance'))) mockTrigCount++;
    if (trigs.some(t => t.includes('Peer') || t.includes('Comparison'))) peerTrigCount++;
    if (trigs.some(t => t.includes('Sleep') || t.includes('Exhaustion'))) sleepTrigCount++;
    
    if (log.timestamp) {
      const hrs = new Date(log.timestamp).getHours();
      if (hrs >= 22 || hrs <= 4) lateNightCount++;
    }
  });

  const avgStress = Math.round(totalStress / logs.length);

  // Compare current entry with past entries if currentLog exists
  if (currentLog && logs.length > 1) {
    const prevLogs = logs.filter(l => l.id !== currentLog.id);
    if (prevLogs.length > 0) {
      const prevAvg = prevLogs.reduce((acc, curr) => acc + (curr.analysis?.stressScore || 40), 0) / prevLogs.length;
      const currentStress = currentLog.analysis?.stressScore || 40;
      const diff = Math.round(currentStress - prevAvg);

      if (diff > 15) {
        patterns.push({
          title: 'Acute Stress Escalation Detected',
          description: `Your stress rating today is ${diff}% higher than your historical baseline. Take action to decompress.`,
          severity: 'high'
        });
      } else if (diff < -15) {
        patterns.push({
          title: 'Stress Levels Decreased',
          description: `Excellent work! Your current stress level has decreased by ${Math.abs(diff)}% relative to your recent averages.`,
          severity: 'low'
        });
      }
    }
  }

  // Cycles
  if (mockTrigCount >= Math.ceil(logs.length * 0.4)) {
    patterns.push({
      title: 'Mock-Test Stress Cycle',
      description: 'Stress levels spike in association with preparation mock scores and reviews.',
      severity: avgStress > 65 ? 'high' : 'medium'
    });
    recommendations.push('Aura suggests setting a post-exam decompression timer: no feedback review for 20 minutes.');
  }

  if (lateNightCount >= Math.ceil(logs.length * 0.4) || sleepTrigCount >= Math.ceil(logs.length * 0.35)) {
    patterns.push({
      title: 'Late-Night Exhaustion Risk',
      description: 'Frequent logs occur after 10 PM. Physical tiredness is impacting cognitive processing.',
      severity: 'high'
    });
    recommendations.push('Create a strict 10:30 PM books-closed threshold. Rest is an active prep step.');
  }

  if (peerTrigCount >= Math.ceil(logs.length * 0.35)) {
    patterns.push({
      title: 'Social Benchmarking Distress',
      description: 'Anxiety fluctuates when relative peer rankings and WhatsApp study groups are active.',
      severity: 'medium'
    });
    recommendations.push('Mute prep discussion forums for 48 hours. Focus only on personal improvement metrics.');
  }

  if (patterns.length === 0) {
    patterns.push({
      title: 'Stable Study Progress',
      description: 'Your baseline stress rates are matching steady pacing of your syllabus revision.',
      severity: 'low'
    });
    recommendations.push('Continue with the current balance. Add 5-minute movement sessions during subject breaks.');
  }

  let correlation = `Baseline averages are matching standard preparation timelines. Avg Stress: ${avgStress}/100.`;
  if (mockTrigCount > sleepTrigCount) {
    correlation = `Stress peaks show high correlation with mock test releases and syllabus evaluation points.`;
  } else if (sleepTrigCount > mockTrigCount) {
    correlation = `Primary stress factor is physical tiredness and late study hours. Cognitive recall will deteriorate.`;
  }

  return {
    patterns,
    correlation,
    recommendations
  };
}

/**
 * Smart Offline Weekly Report Compiler
 */
function simulateWeeklyReport(logs, userProfile) {
  if (!logs || logs.length === 0) {
    return {
      avgMood: 'Calm',
      avgStress: 0,
      avgSleep: 7,
      avgStudyHours: userProfile?.studyHours || 8,
      topTrigger: 'Syllabus Revision Loading',
      burnoutTrend: 'stable',
      achievements: ['Initialized ZenStudy wellness tracker'],
      areasToImprove: ['Log daily reflections after study sessions'],
      recommendation: 'Aura recommendations will populate as soon as you record study reflections.',
      motivationalMessage: 'You are embarking on a major goal. Step by step, you are constructing your capabilities.'
    };
  }

  let totalStress = 0;
  let totalWellness = 0;
  let totalStudy = 0;
  let mockCount = 0;
  let sleepCount = 0;
  let peerCount = 0;

  logs.forEach(log => {
    const a = log.analysis || {};
    totalStress += (a.stressScore || 40);
    totalWellness += (a.wellnessScore || 50);
    totalStudy += (userProfile?.studyHours || 8);
    
    const trigs = a.hiddenStressTriggers || [];
    if (trigs.some(t => t.includes('Mock'))) mockCount++;
    if (trigs.some(t => t.includes('Sleep'))) sleepCount++;
    if (trigs.some(t => t.includes('Peer'))) peerCount++;
  });

  const avgStress = Math.round(totalStress / logs.length);
  const avgWellness = Math.round(totalWellness / logs.length);
  const avgStudyHours = Math.round(totalStudy / logs.length);
  
  // Simulated sleep hours based on sleep alerts
  const avgSleep = sleepCount > logs.length * 0.4 ? 5.8 : 7.2;

  // Determine top trigger
  let topTrigger = 'General Study Load';
  if (mockCount >= sleepCount && mockCount >= peerCount) {
    topTrigger = 'Mock Exam Performance';
  } else if (sleepCount > mockCount) {
    topTrigger = 'Sleep Deficit & Physical Burnout';
  } else if (peerCount > 0) {
    topTrigger = 'Peer Comparison Pressure';
  }

  // Burnout trend
  let burnoutTrend = 'stable';
  if (avgStress > 70) burnoutTrend = 'worsening';
  else if (avgStress < 40) burnoutTrend = 'improving';

  const achievements = [];
  achievements.push(`Completed ${logs.length} mindful journals this week`);
  if (avgStress < 50) achievements.push('Maintained a balanced stress state');
  if (avgSleep >= 7) achievements.push('Prioritized physical recovery sleep');

  const areasToImprove = [];
  if (sleepCount > 0) areasToImprove.push('Enforce books-closed boundary 30 mins before sleep');
  if (mockCount > 0) areasToImprove.push('Focus on mistake mapping instead of mocking grades');
  if (areasToImprove.length === 0) areasToImprove.push('Maintain current study/life recovery balance');

  let recommendation = `Maintain your current Pomodoro blocks. `;
  if (burnoutTrend === 'worsening') {
    recommendation += `Enforce a strict 1-hour digital disconnect post mock test. Take a 15-minute walking break before evaluating answers.`;
  } else {
    recommendation += `Add a 2-minute box breathing cycle before launching tough subject study slots.`;
  }

  const avgMood = avgWellness > 75 ? 'Optimistic' : avgWellness > 50 ? 'Steady' : 'Overwhelmed';

  return {
    avgMood,
    avgStress,
    avgSleep,
    avgStudyHours,
    topTrigger,
    burnoutTrend,
    achievements,
    areasToImprove,
    recommendation,
    motivationalMessage: `Excellent commitment this week, ${userProfile?.name || 'Student'}. Naviagting ${userProfile?.exam || 'competitive exams'} is a cognitive marathon, and by monitoring your mental health you are building long-term resilience.`
  };
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
        console.error('Failed to initialize GoogleGenerativeAI SDK:', err);
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

      const result = await model.generateContent(prompt);
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
      console.error('Gemini 18-Field Analysis failed, falling back to simulator:', error);
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Gemini Pattern Detection failed, falling back to simulator:', error);
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Gemini Weekly Report generator failed, falling back to simulator:', error);
      return simulateWeeklyReport(logs, userProfile);
    }
  }

  /**
   * Upgraded Chatbot Companion with Full Context Memory
   */
  async talkToAura(chatHistory, userMessage, examName = 'Exams', studentName = 'Student', logs = [], patterns = null) {
    if (!this.ai) {
      // Enhanced simulated conversation incorporating last journal memory context
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
            `I hear you, ${studentName}. Navigating UPSC/entrance prep is a marathon, and carrying this pressure alone is exhausting. What is occupying your thoughts right now?`,
            `Venting helps clear cognitive RAM, ${studentName}. Knowing you had ${lastJournalTrig} in your recent log, how are you pacing yourself today?`,
            `I completely understand. ${examName} prep often induces comparison anxiety. Since your stress score is currently hovering around ${lastStress}/100, what brief resting block can we add today?`,
            `That's a lot to carry, ${studentName}. When we are constantly testing under timed mock conditions, our brains enter a fight-or-flight state. Tell me, what subject backlog is feeling like the biggest hurdle today?`
          ];

          if (examName === 'UPSC') {
            fallbacks = [
              `I hear you, ${studentName}. UPSC GS papers, Optionals, and CSAT are extremely heavy. Knowing you logged worries about ${lastJournalTrig} recently, how is your study schedule holding up today?`,
              `Venting about prelims/mains pressure is important, ${studentName}. Your current stress rating is ${lastStress}/100. How are you balancing GS static subjects with answer writing reviews?`,
              `I completely understand. UPSC self-doubt is real. If you could pause reading newspapers or optionals for just 5 minutes, what would feel most relaxing?`,
              `UPSC requires immense consistency, but rest is part of preparation. What GS or optional backlog is causing you the most focus slip today?`
            ];
          }

          const index = Math.floor(chatHistory.length / 2) % fallbacks.length;
          let reply = fallbacks[index];

          // Contextual keywords mapping
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
      // Compile Memory Context
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
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Aura Chat memory call failed, falling back to simulator:', error);
      return new Promise((resolve) => {
        resolve(`I'm listening, ${studentName}. Take a slow deep breath. UPSC/entrance prep can feel like a heavy weight, but let's take it one concept at a time. What topic are you working on today?`);
      });
    }
  }
}
