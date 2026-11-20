'use client';
import { Button } from '@base-ui/react/button';
import { useStudioMessages } from '../components/studio-locale';
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const t = useStudioMessages();
  return <main className="fatal"><h1>{t('failure')}</h1><p>{error.message}</p><Button className="play-button" onClick={reset}>{t('retry')}</Button></main>;
}
