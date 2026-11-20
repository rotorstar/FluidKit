'use client';
import { useCallback } from 'react';
import { useStudioLocale } from './studio-locale';
import { diagnosticMessage, type DiagnosticStatus } from '../lib/diagnostic-messages';

export function useDiagnosticMessages() {
  const {locale} = useStudioLocale();
  return useCallback((...status: DiagnosticStatus) => diagnosticMessage(locale,...status),[locale]);
}
