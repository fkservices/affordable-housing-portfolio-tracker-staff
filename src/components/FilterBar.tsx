'use client';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type { SelectChangeEvent } from '@mui/material/Select';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDef {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: FilterDef[];
  onFilterChange: (key: string, value: string) => void;
  currentFilters: Record<string, string>;
  onSearch?: (query: string) => void;
}

export default function FilterBar({
  filters,
  onFilterChange,
  currentFilters,
  onSearch,
}: FilterBarProps) {
  const handleClear = () => {
    filters.forEach((f) => onFilterChange(f.key, ''));
    onSearch?.('');
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
      {filters.map((filter) => (
        <FormControl key={filter.key} size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{filter.label}</InputLabel>
          <Select
            label={filter.label}
            value={currentFilters[filter.key] ?? ''}
            onChange={(e: SelectChangeEvent) => onFilterChange(filter.key, e.target.value)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {filter.options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}

      {onSearch && (
        <TextField
          size="small"
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          sx={{ minWidth: 200 }}
        />
      )}

      <Button variant="outlined" size="small" onClick={handleClear}>
        Clear Filters
      </Button>
    </Box>
  );
}
