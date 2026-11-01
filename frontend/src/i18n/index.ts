import { en } from './en.js';
import { te } from './te.js';

export const translations = {
  en,
  te,
};

export type Language = 'en' | 'te';
export type TranslationKey = typeof en;

