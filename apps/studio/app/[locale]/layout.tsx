import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isStudioLocale } from '../../lib/locale-routing';

export default async function LocalizedLayout({ children, params }: {
  children: ReactNode; params: Promise<{ locale: string }>;
}) {
  if (!isStudioLocale((await params).locale)) notFound();
  return children;
}
