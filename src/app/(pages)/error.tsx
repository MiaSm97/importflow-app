'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import T from '@/app/components/T';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <></>;
}
