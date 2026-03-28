'use client';

import { useState, useCallback } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/lib/theme';

interface ThemeRegistryProps {
  children: React.ReactNode;
}

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  const [cache] = useState(() => {
    const c = createCache({ key: 'mui' });
    c.compat = true;
    return c;
  });

  const flush = useCallback(() => {
    const names = Object.keys(cache.inserted);
    if (names.length === 0) return null;

    let styles = '';
    const dataEmotionAttribute = cache.key;
    const insertedKeys: string[] = [];

    for (const name of names) {
      const val = cache.inserted[name];
      if (typeof val === 'string') {
        styles += val;
        insertedKeys.push(name);
      }
    }

    // Clear inserted so styles are not re-injected
    for (const key of insertedKeys) {
      delete cache.inserted[key];
    }

    if (!styles) return null;

    return (
      <style
        key={dataEmotionAttribute}
        data-emotion={`${dataEmotionAttribute} ${insertedKeys.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  }, [cache]);

  useServerInsertedHTML(flush);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
