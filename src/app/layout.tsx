'use client';

import './globals.css';
import { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import ThemeRegistry from '@/components/ThemeRegistry';
import Sidebar, { DRAWER_WIDTH } from '@/components/Sidebar';
import ProvenanceBanner from '@/components/ProvenanceBanner';
import { hasSyntheticData } from '@/utils/provenance';
import type { Property, Alert } from '@/lib/types';
import propertiesData from '@/data/properties.json';
import alertsData from '@/data/alerts.json';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    document.title = 'AHPT - Affordable Housing Portfolio Tracker';
  }, []);

  const alerts = alertsData as unknown as Alert[];
  const properties = propertiesData as unknown as Property[];

  const unacknowledgedCount = useMemo(
    () => alerts.filter((a) => !a.acknowledged).length,
    [alerts],
  );

  const showProvenance = useMemo(
    () => hasSyntheticData(properties),
    [properties],
  );

  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar alertCount={unacknowledgedCount} />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                ml: 0,
                minHeight: '100vh',
                backgroundColor: '#EFF2F0',
              }}
            >
              <ProvenanceBanner show={showProvenance} />
              <Box sx={{ p: 3, pt: showProvenance ? 8 : 3 }}>
                {children}
              </Box>
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
