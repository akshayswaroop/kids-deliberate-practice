/**
 * Test: Revision Panel Conditional Rendering
 * 
 * This test verifies that revision panels only appear for subjects
 * that have supportsRevision: true in their configuration.
 */

import { describe, it, expect } from 'vitest';
import { SUBJECT_CONFIGS, getSubjectSupportsRevision } from '../../infrastructure/repositories/subjectLoader';

describe('Revision Panel Conditional Logic', () => {
  it('should support revision for subjects with short questions', () => {
    // Test subjects that should support revision (short questions)
    const supportedSubjects = ['kannada', 'kannadaalphabets', 'hindialphabets', 'mathtables', 'numberspellings'];
    
    supportedSubjects.forEach(subject => {
      expect(getSubjectSupportsRevision(subject), `${subject} should support revision`).toBe(true);
      
      const config = SUBJECT_CONFIGS.find(c => c.name === subject);
      expect(config?.supportsRevision, `${subject} config should have supportsRevision: true`).toBe(true);
      expect(config?.revisionPanel, `${subject} should have revisionPanel config`).toBeDefined();
    });
  });

  it('should NOT support revision for subjects with long questions', () => {
    // Test subjects that should NOT support revision (long questions)
    const unsupportedSubjects = ['nationalsymbols', 'beforeafternumbers'];
    
    unsupportedSubjects.forEach(subject => {
      expect(getSubjectSupportsRevision(subject), `${subject} should NOT support revision`).toBe(false);
      
      const config = SUBJECT_CONFIGS.find(c => c.name === subject);
      expect(config?.supportsRevision, `${subject} config should have supportsRevision: false`).toBe(false);
      expect(config?.revisionPanel, `${subject} should NOT have revisionPanel config`).toBeUndefined();
    });
  });

  it('should NOT support revision for subjects without revisionPanel config', () => {
    // Test subjects that don't have revisionPanel configuration at all
    const noRevisionSubjects = ['english', 'grampanchayat', 'hanuman', 'comprehension'];
    
    noRevisionSubjects.forEach(subject => {
      expect(getSubjectSupportsRevision(subject), `${subject} should NOT support revision (no config)`).toBe(false);
      
      const config = SUBJECT_CONFIGS.find(c => c.name === subject);
      expect(config?.revisionPanel, `${subject} should NOT have revisionPanel config`).toBeUndefined();
      expect(config?.supportsRevision, `${subject} should not have supportsRevision property or it should be falsy`).toBeFalsy();
    });
  });

  it('should verify getSubjectSupportsRevision helper function accuracy', () => {
    // Test the helper function directly
    expect(getSubjectSupportsRevision('kannada')).toBe(true);
    expect(getSubjectSupportsRevision('kannadaalphabets')).toBe(true);
    expect(getSubjectSupportsRevision('hindialphabets')).toBe(true);
    expect(getSubjectSupportsRevision('mathtables')).toBe(true);
    expect(getSubjectSupportsRevision('numberspellings')).toBe(true);
    
    expect(getSubjectSupportsRevision('nationalsymbols')).toBe(false);
    expect(getSubjectSupportsRevision('beforeafternumbers')).toBe(false);
    
    expect(getSubjectSupportsRevision('english')).toBe(false);
    expect(getSubjectSupportsRevision('grampanchayat')).toBe(false);
    expect(getSubjectSupportsRevision('hanuman')).toBe(false);
    expect(getSubjectSupportsRevision('comprehension')).toBe(false);
    expect(getSubjectSupportsRevision('nonexistent')).toBe(false);
  });

  it('should validate subject configuration consistency', () => {
    // Ensure our configuration is consistent
    SUBJECT_CONFIGS.forEach(config => {
      if (config.supportsRevision === true) {
        expect(config.revisionPanel, `${config.name} marked supportsRevision:true should have revisionPanel config`).toBeDefined();
        expect(config.revisionPanel?.title, `${config.name} revisionPanel should have title`).toBeTruthy();
        expect(config.revisionPanel?.buttonLabel, `${config.name} revisionPanel should have buttonLabel`).toBeTruthy();
      }
      
      if (config.supportsRevision === false) {
        expect(config.revisionPanel, `${config.name} marked supportsRevision:false should NOT have revisionPanel config`).toBeUndefined();
      }
    });
  });

  it('should have the correct subjects marked for revision support', () => {
    // This test documents our business rules about which subjects support revision
    const withRevision = SUBJECT_CONFIGS.filter(c => c.supportsRevision === true).map(c => c.name);
    const withoutRevision = SUBJECT_CONFIGS.filter(c => c.supportsRevision === false).map(c => c.name);
    const noRevisionProperty = SUBJECT_CONFIGS.filter(c => c.supportsRevision === undefined).map(c => c.name);

    // Subjects with short questions/answers - good for revision
    expect(withRevision).toEqual(['kannada', 'kannadaalphabets', 'hindialphabets', 'mathtables', 'numberspellings']);
    
    // Subjects with long questions - not suitable for revision UI
    expect(withoutRevision).toEqual(['nationalsymbols', 'beforeafternumbers']);
    
    // Other subjects without revision panel setup
    expect(noRevisionProperty.length).toBeGreaterThan(0);
    expect(noRevisionProperty).toContain('english');
  });
});