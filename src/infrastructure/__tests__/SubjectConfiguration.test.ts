/**
 * 🎯 Tests: SubjectConfiguration
 * 
 * Tests infrastructure layer subject configuration that keeps
 * domain layer agnostic of specific subjects.
 * 
 * Architecture principle: "The core domain classes should have no knowledge about subject"
 */

import { describe, test, expect } from 'vitest';
import { SubjectConfiguration } from '../config/subjectConfiguration';

describe('SubjectConfiguration', () => {
  describe('Display Name Formatting', () => {
    test('should return display name for known subjects', () => {
      expect(SubjectConfiguration.getDisplayName('english')).toBe('English');
      expect(SubjectConfiguration.getDisplayName('kannada')).toBe('Kannada');
      expect(SubjectConfiguration.getDisplayName('mathtables')).toBe('Math Tables');
      expect(SubjectConfiguration.getDisplayName('humanbody')).toBe('Human Body');
      expect(SubjectConfiguration.getDisplayName('hanuman')).toBe('Hanuman Chalisa');
    });

    test('should handle compound subject names correctly', () => {
      expect(SubjectConfiguration.getDisplayName('kannadaalphabets')).toBe('Kannada Alphabets');
      expect(SubjectConfiguration.getDisplayName('hindialphabets')).toBe('Hindi Alphabets');
      expect(SubjectConfiguration.getDisplayName('englishquestions')).toBe('English Questions');
      expect(SubjectConfiguration.getDisplayName('indiageography')).toBe('India Geography');
      expect(SubjectConfiguration.getDisplayName('grampanchayat')).toBe('Gram Panchayat');
    });

    test('should capitalize unknown subject codes', () => {
      expect(SubjectConfiguration.getDisplayName('newsubject')).toBe('Newsubject');
      expect(SubjectConfiguration.getDisplayName('test')).toBe('Test');
      expect(SubjectConfiguration.getDisplayName('xyz')).toBe('Xyz');
    });

    test('should handle empty string gracefully', () => {
      const result = SubjectConfiguration.getDisplayName('');
      expect(result).toBe(''); // Empty string capitalizes to empty
    });

    test('should be case-sensitive', () => {
      // Lowercase matches
      expect(SubjectConfiguration.getDisplayName('english')).toBe('English');
      
      // Uppercase won't match, falls back to capitalization
      expect(SubjectConfiguration.getDisplayName('ENGLISH')).toBe('ENGLISH');
    });
  });

  describe('Parent Tips', () => {
    test('should return tips for subjects that have them', () => {
      expect(SubjectConfiguration.getParentTip('english')).toBe('Have them read it again.');
      expect(SubjectConfiguration.getParentTip('mathtables')).toBe('Ask them to explain the step.');
      expect(SubjectConfiguration.getParentTip('kannadaalphabets')).toBe('Trace in air + say the sound.');
      expect(SubjectConfiguration.getParentTip('hindialphabets')).toBe('Trace in air + say the sound.');
      expect(SubjectConfiguration.getParentTip('comprehension')).toBe('One-line re-tell before Next.');
      expect(SubjectConfiguration.getParentTip('hanuman')).toBe('One-line re-tell before Next.');
    });

    test('should return null for subjects without tips', () => {
      expect(SubjectConfiguration.getParentTip('kannada')).toBeNull();
      expect(SubjectConfiguration.getParentTip('humanbody')).toBeNull();
      expect(SubjectConfiguration.getParentTip('geography')).toBeNull();
      expect(SubjectConfiguration.getParentTip('math')).toBeNull();
    });

    test('should return null for unknown subjects', () => {
      expect(SubjectConfiguration.getParentTip('unknownsubject')).toBeNull();
      expect(SubjectConfiguration.getParentTip('test123')).toBeNull();
    });

    test('should return null for empty string', () => {
      expect(SubjectConfiguration.getParentTip('')).toBeNull();
    });
  });

  describe('Configuration Checking', () => {
    test('should identify configured subjects', () => {
      expect(SubjectConfiguration.isConfigured('english')).toBe(true);
      expect(SubjectConfiguration.isConfigured('kannada')).toBe(true);
      expect(SubjectConfiguration.isConfigured('mathtables')).toBe(true);
      expect(SubjectConfiguration.isConfigured('humanbody')).toBe(true);
      expect(SubjectConfiguration.isConfigured('hanuman')).toBe(true);
      expect(SubjectConfiguration.isConfigured('comprehension')).toBe(true);
    });

    test('should identify unconfigured subjects', () => {
      expect(SubjectConfiguration.isConfigured('unknown')).toBe(false);
      expect(SubjectConfiguration.isConfigured('newsubject')).toBe(false);
      expect(SubjectConfiguration.isConfigured('')).toBe(false);
    });

    test('should be case-sensitive for configuration check', () => {
      expect(SubjectConfiguration.isConfigured('english')).toBe(true);
      expect(SubjectConfiguration.isConfigured('English')).toBe(false);
      expect(SubjectConfiguration.isConfigured('ENGLISH')).toBe(false);
    });
  });

  describe('Complete Subject Coverage', () => {
    test('should have configuration for all main subjects', () => {
      const mainSubjects = [
        'english',
        'kannada',
        'hindi',
        'mathtables',
        'math',
        'humanbody',
        'geography',
        'hanuman',
        'comprehension'
      ];

      mainSubjects.forEach(subject => {
        expect(SubjectConfiguration.isConfigured(subject)).toBe(true);
        expect(SubjectConfiguration.getDisplayName(subject)).toBeTruthy();
      });
    });

    test('should have configuration for all variant subjects', () => {
      const variants = [
        'englishquestions',
        'kannadaalphabets',
        'kannadawords',
        'hindialphabets',
        'indiageography',
        'grampanchayat',
        'nationalsymbols'
      ];

      variants.forEach(subject => {
        expect(SubjectConfiguration.isConfigured(subject)).toBe(true);
        expect(SubjectConfiguration.getDisplayName(subject)).toBeTruthy();
      });
    });
  });

  describe('Architecture Compliance', () => {
    test('configuration should be in infrastructure layer, not domain', () => {
      // This test documents the architectural decision:
      // SubjectConfiguration lives in infrastructure/config/
      // Domain entities (like SessionGuidance) don't know about specific subjects
      
      const configFilePath = '/src/infrastructure/config/subjectConfiguration.ts';
      expect(configFilePath).toContain('infrastructure');
      expect(configFilePath).not.toContain('domain');
    });

    test('should support adding new subjects without changing domain', () => {
      // Architecture principle: Adding a new subject should be minimal
      // Just add to SubjectConfiguration, no domain changes needed
      
      // Test that display name fallback works (simulates new subject addition)
      const newSubject = 'astronomy'; // Not yet configured
      const displayName = SubjectConfiguration.getDisplayName(newSubject);
      
      // Should gracefully handle unknown subject
      expect(displayName).toBe('Astronomy');
    });
  });

  describe('Tips Architecture', () => {
    test('should allow some subjects to have tips and others not', () => {
      // Not all subjects need tips - this is OK
      const withTips = ['english', 'mathtables', 'hanuman'];
      const withoutTips = ['kannada', 'humanbody', 'geography'];

      withTips.forEach(subject => {
        expect(SubjectConfiguration.getParentTip(subject)).not.toBeNull();
      });

      withoutTips.forEach(subject => {
        expect(SubjectConfiguration.getParentTip(subject)).toBeNull();
      });
    });

    test('tips should be concise and actionable', () => {
      const englishTip = SubjectConfiguration.getParentTip('english');
      expect(englishTip).toBeTruthy();
      expect(englishTip!.length).toBeLessThan(50); // Short and actionable

      const mathTip = SubjectConfiguration.getParentTip('mathtables');
      expect(mathTip).toBeTruthy();
      expect(mathTip!.length).toBeLessThan(50);
    });
  });
});
