import { describe, it, expect } from 'vitest';
import { simulateJournalAnalysis, simulateStressPatterns, GeminiService } from './gemini';

describe('GenAI Offline Sentiment Analyzer tests', () => {
  it('should compile all 18 structural sentiment fields', () => {
    const res = simulateJournalAnalysis('Feeling normal today.');
    
    // Check key fields
    expect(res).toHaveProperty('stressScore');
    expect(res).toHaveProperty('wellnessScore');
    expect(res).toHaveProperty('burnoutRisk');
    expect(res).toHaveProperty('anxietyLevel');
    expect(res).toHaveProperty('primaryEmotion');
    expect(res).toHaveProperty('secondaryEmotion');
    
    // Check clamping bounds
    expect(res.stressScore).toBeGreaterThanOrEqual(10);
    expect(res.stressScore).toBeLessThanOrEqual(98);
  });

  it('should dynamically adapt stress and triggers based on mock exam keywords', () => {
    const calmResult = simulateJournalAnalysis('I am feeling confident.');
    const mockResult = simulateJournalAnalysis('I got terrible marks on my mock test today.');

    expect(mockResult.stressScore).toBeGreaterThan(calmResult.stressScore);
    expect(mockResult.hiddenStressTriggers).toContain('Mock Exam Performance');
  });

  it('should detect acute stress exhaustion keyword triggers', () => {
    const sleepResult = simulateJournalAnalysis('I am extremely tired and haven sleep well');
    expect(sleepResult.hiddenStressTriggers).toContain('Sleep Deficit & Exhaustion');
  });
});

describe('Stress Pattern Detector tests', () => {
  it('should return baseline templates when history logs are empty', () => {
    const patterns = simulateStressPatterns([]);
    expect(patterns.patterns[0].title).toBe('Collecting Profile Baselines');
  });

  it('should flag acute stress escalation when current log exceeds history average by 15%', () => {
    const history = [
      { id: '1', analysis: { stressScore: 40 } },
      { id: '2', analysis: { stressScore: 45 } }
    ];
    const currentLog = { id: '3', analysis: { stressScore: 70 } };

    const res = simulateStressPatterns(history, currentLog);
    const acutePattern = res.patterns.find(p => p.title === 'Acute Stress Escalation Detected');
    
    expect(acutePattern).toBeDefined();
    expect(acutePattern.severity).toBe('high');
  });
});

describe('Gemini Service Layer Instantiation tests', () => {
  it('should initialize service with key', () => {
    const service = new GeminiService('test-key-abc');
    expect(service.apiKey).toBe('test-key-abc');
  });
});
