import type { ComponentProps } from 'react';

// Native controls preserve keyboard, IME and platform input. This is their
// shared style owner in the DOM Studio, not a runtime renderer.
export function StudioInput({ className = '', ...props }: ComponentProps<'input'>) {
  return <input {...props} className={`studio-input ${className}`.trim()} />;
}
export function StudioSelect({ className = '', ...props }: ComponentProps<'select'>) {
  return <select {...props} className={`studio-select ${className}`.trim()} />;
}
export function StudioTextarea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return <textarea {...props} className={`studio-textarea ${className}`.trim()} />;
}
