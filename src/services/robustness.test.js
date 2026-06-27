import { describe, it, expect } from 'vitest';
import { GeminiService, simulateJournalAnalysis, simulateStressPatterns } from './gemini';

describe('Gemini API Error & Timeout Robustness tests', () => {
  it('should fall back to simulated analysis output if Gemini API throws an exception', async () => {
    // Instantiate with an invalid/mock API key that triggers exceptions
    const service = new GeminiService('invalid-key-xyz');
    
    // Attempting live analysis will throw error, catching it and returning offline metrics
    const res = await service.analyzeJournal('Feeling anxious about mock tests today.', 'UPSC');
    
    expect(res).toHaveProperty('stressScore');
    expect(res.hiddenStressTriggers).toContain('Mock Exam Performance');
  });

  it('should fall back to simulated patterns if pattern detector throws an exception', async () => {
    const service = new GeminiService('invalid-key-xyz');
    const logs = [{ id: '1', text: 'Stressed', analysis: { stressScore: 90 } }];
    
    const res = await service.detectStressPatterns(logs, 'JEE');
    
    expect(res).toHaveProperty('patterns');
    expect(res.patterns.length).toBeGreaterThan(0);
  });
});

describe('Input Validation Regex tests', () => {
  it('should identify valid and invalid email structures', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(emailRegex.test('student@zenstudy.com')).toBe(true);
    expect(emailRegex.test('student@sub.domain.edu')).toBe(true);
    expect(emailRegex.test('invalidemail.com')).toBe(false);
    expect(emailRegex.test('student@')).toBe(false);
  });

  it('should identify valid and invalid emergency contact phone structures', () => {
    const phoneRegex = /^[+]?[0-9\s\-()]{8,20}$/;
    
    expect(phoneRegex.test('+1 (555) 019-2834')).toBe(true);
    expect(phoneRegex.test('12345678')).toBe(true);
    expect(phoneRegex.test('123')).toBe(false); // Too short
    expect(phoneRegex.test('invalid-phone-abc')).toBe(false); // Has alphabets
  });
});

describe('Empty & Short Reflection Graceful checks', () => {
  it('should trigger offline simulation warning for short text input', () => {
    const res = simulateJournalAnalysis('Normal.');
    
    // Output should still be structured and not crash the parsing engine
    expect(res.stressScore).toBe(40);
    expect(res.primaryEmotion).toBe('Steady');
  });
});
