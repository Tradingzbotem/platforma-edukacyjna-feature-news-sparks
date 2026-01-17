'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
};

const DEFAULT_SRC = '/media/covers/default-cover.svg';

export default function CoverImage(props: Props) {
  const { src, alt, className, sizes, priority = false, fill = true, width, height } = props;
  const [failed, setFailed] = useState(false);
  const resolvedSrc = useMemo(() => {
    const s = (src || '').trim();
    if (!s) return DEFAULT_SRC;
    if (failed) return DEFAULT_SRC;
    return s;
  }, [src, failed]);

  // DALL-E URLs can expire, so don't optimize them through Next.js Image proxy
  const isDALLEUrl = resolvedSrc.includes('oaidalleapiprodscus.blob.core.windows.net');

  const common = {
    alt,
    className,
    sizes,
    priority,
    onError: () => setFailed(true),
    unoptimized: isDALLEUrl, // Don't optimize external DALL-E URLs that might expire
  } as const;

  if (fill) {
    return <Image src={resolvedSrc} fill {...common} />;
  }
  return <Image src={resolvedSrc} width={width || 800} height={height || 450} {...common} />;
}


