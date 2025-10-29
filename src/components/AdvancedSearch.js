import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Chip,
  Stack,
  Paper,
  Typography,
  Collapse,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const AdvancedSearch = ({ onSearch, onClear }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: 'all',
    urgency: 'all',
    status: 'all',
    sortBy: 'newest',
    dateFrom: '',
    dateTo: ''
  });

  const categories = [
    'all',
    'General Help',
    'Groceries & Shopping',
    'Medical Assistance',
    'Transportation',
    'Housework & Cleaning',
    'Pet Care',
    'Childcare',
    'Technology Help',
    'Yard Work',
    'Moving & Delivery',
    'Companionship',
    'Other'
  ];

  const urgencies = ['all', 'low', 'medium', 'high'];
  const statuses = ['all', 'open', 'claimed', 'pending_completion', 'completed'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'urgency-high', label: 'Urgency: High to Low' },
    { value: 'urgency-low', label: 'Urgency: Low to High' },
    { value: 'title', label: 'Title (A-Z)' }
  ];

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      searchTerm: '',
      category: 'all',
      urgency: 'all',
      status: 'all',
      sortBy: 'newest',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(clearedFilters);
    onClear();
  };

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.urgency !== 'all',
    filters.status !== 'all',
    filters.dateFrom,
    filters.dateTo
  ].filter(Boolean).length;

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      {/* Main Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: expanded ? 2 : 0 }}>
        <TextField
          fullWidth
          placeholder="Search by title, description, or location..."
          value={filters.searchTerm}
          onChange={(e) => handleChange('searchTerm', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: filters.searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => handleChange('searchTerm', '')}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <Button
          variant={expanded ? 'contained' : 'outlined'}
          startIcon={<FilterIcon />}
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ minWidth: 140 }}
        >
          Filters
          {activeFiltersCount > 0 && (
            <Chip
              label={activeFiltersCount}
              size="small"
              color="primary"
              sx={{ ml: 1, height: 20, minWidth: 20 }}
            />
          )}
        </Button>
      </Box>

      {/* Advanced Filters */}
      <Collapse in={expanded}>
        <Box sx={{ pt: 2 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Filter Options
          </Typography>
          
          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
            <TextField
              select
              label="Category"
              value={filters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              sx={{ minWidth: 200 }}
              size="small"
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Urgency"
              value={filters.urgency}
              onChange={(e) => handleChange('urgency', e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              {urgencies.map((urg) => (
                <MenuItem key={urg} value={urg}>
                  {urg === 'all' ? 'All Urgencies' : urg.charAt(0).toUpperCase() + urg.slice(1)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              {statuses.map((stat) => (
                <MenuItem key={stat} value={stat}>
                  {stat === 'all' ? 'All Statuses' : stat.charAt(0).toUpperCase() + stat.slice(1)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Sort By"
              value={filters.sortBy}
              onChange={(e) => handleChange('sortBy', e.target.value)}
              sx={{ minWidth: 200 }}
              size="small"
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Date Range
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              type="date"
              label="From"
              value={filters.dateFrom}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ minWidth: 180 }}
            />
            
            <TextField
              type="date"
              label="To"
              value={filters.dateTo}
              onChange={(e) => handleChange('dateTo', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ minWidth: 180 }}
            />
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearAll}
              disabled={activeFiltersCount === 0 && !filters.searchTerm}
            >
              Clear All Filters
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AdvancedSearch;
