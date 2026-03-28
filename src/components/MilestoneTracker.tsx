'use client';

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import type { StepIconProps } from '@mui/material/StepIcon';
import Box from '@mui/material/Box';

interface MilestoneTrackerProps {
  milestones: {
    pod?: string;
    coc?: string;
    co?: string;
  };
}

interface MilestoneStep {
  key: 'pod' | 'coc' | 'co';
  label: string;
}

const STEPS: MilestoneStep[] = [
  { key: 'pod', label: 'POD' },
  { key: 'coc', label: 'COC' },
  { key: 'co', label: 'CO' },
];

function getStepColor(dateStr?: string): string {
  if (!dateStr) return '#8D8D8D'; // grey
  const date = new Date(dateStr);
  return date <= new Date() ? '#22c55e' : '#F5821E'; // green if past, amber if future
}

function CustomStepIcon(props: StepIconProps & { stepColor: string }) {
  const { stepColor } = props;
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        backgroundColor: stepColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#fff' }} />
    </Box>
  );
}

export default function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  // Determine active step index (first step without a past date)
  const activeStep = STEPS.findIndex((s) => {
    const d = milestones[s.key];
    return !d || new Date(d) > new Date();
  });

  return (
    <Stepper activeStep={activeStep === -1 ? STEPS.length : activeStep} alternativeLabel>
      {STEPS.map((step) => {
        const dateStr = milestones[step.key];
        const color = getStepColor(dateStr);

        return (
          <Step key={step.key} completed={!!dateStr && new Date(dateStr) <= new Date()}>
            <StepLabel
              StepIconComponent={(iconProps) => (
                <CustomStepIcon {...iconProps} stepColor={color} />
              )}
              sx={{
                '& .MuiStepConnector-line': {
                  borderColor: color,
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {step.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dateStr ? new Date(dateStr).toLocaleDateString() : '—'}
              </Typography>
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}
