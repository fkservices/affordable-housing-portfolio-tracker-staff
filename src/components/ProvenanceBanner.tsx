'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

interface ProvenanceBannerProps {
  show: boolean;
}

export default function ProvenanceBanner({ show }: ProvenanceBannerProps) {
  if (!show) return null;

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1400 }}>
      <Alert
        severity="warning"
        sx={{
          borderRadius: 0,
          justifyContent: 'center',
          py: 0.5,
          fontWeight: 600,
        }}
      >
        ⚠ DEMO DATA — Some records use synthetic data for demonstration purposes
      </Alert>
    </Box>
  );
}
