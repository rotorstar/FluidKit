'use client';
import { StudioLink, useStudioMessages } from '../components/studio-locale';
export default function NotFound() {
  const t = useStudioMessages();
  return <main className="fatal"><h1>{t('notFound')}</h1><StudioLink className="outline-button" href="/">{t('notFoundBack')}</StudioLink></main>;
}
