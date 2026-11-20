import { z } from 'zod';
import { FLUID_THEME } from './theme';

export const DesignTokensSchema = z.strictObject({
  captionPx: z.number().positive(), labelPx: z.number().positive(), bodyPx: z.number().positive(),
  minimumTargetPx: z.number().positive(), focusColor: z.string().regex(/^#[0-9a-f]{6}$/),
});
// Product tokens, independent of DOM, Three.js and any design checker.
export const DESIGN_TOKENS = Object.freeze(DesignTokensSchema.parse({
  captionPx: FLUID_THEME.typography.caption, labelPx: FLUID_THEME.typography.label, bodyPx: FLUID_THEME.typography.body, minimumTargetPx: FLUID_THEME.minimumTarget, focusColor: FLUID_THEME.colors.focus,
}));
