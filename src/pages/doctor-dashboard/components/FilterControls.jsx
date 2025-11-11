import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const FilterControls = ({ onFiltersChange, patientCount, totalPatients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const complianceOptions = [
    { value: 'all', label: 'All Compliance Levels' },
    { value: 'excellent', label: 'Excellent (90%+)' },
    { value: 'good', label: 'Good (70-89%)' },
    { value: 'fair', label: 'Fair (50-69%)' },
    { value: 'poor', label: 'Poor (<50%)' }
  ];

  const riskOptions = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'critical', label: 'Critical Risk' }
  ];

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchTerm(value);
    applyFilters({ searchTerm: value });
  };

  const handleComplianceChange = (e) => {
    const value = e?.target?.value;
    setComplianceFilter(value);
    applyFilters({ complianceFilter: value });
  };

  const handleRiskChange = (e) => {
    const value = e?.target?.value;
    setRiskFilter(value);
    applyFilters({ riskFilter: value });
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    applyFilters({ dateRange: newDateRange });
  };

  const applyFilters = (newFilters = {}) => {
    const filters = {
      searchTerm: newFilters?.searchTerm ?? searchTerm,
      complianceFilter: newFilters?.complianceFilter ?? complianceFilter,
      riskFilter: newFilters?.riskFilter ?? riskFilter,
      dateRange: newFilters?.dateRange ?? dateRange
    };
    onFiltersChange(filters);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setComplianceFilter('all');
    setRiskFilter('all');
    setDateRange({ start: '', end: '' });
    onFiltersChange({
      searchTerm: '',
      complianceFilter: 'all',
      riskFilter: 'all',
      dateRange: { start: '', end: '' }
    });
  };

  const hasActiveFilters = searchTerm || complianceFilter !== 'all' || riskFilter !== 'all' || dateRange?.start || dateRange?.end;

  return (
    <div className="bg-surface rounded-lg border border-border p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-text-primary">Patient Filters</h2>
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <span>Showing {patientCount} of {totalPatients} patients</span>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Filtered
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName={showAdvanced ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
            iconSize={16}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-text-secondary"
          >
            Advanced Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              iconName="X"
              iconPosition="left"
              iconSize={16}
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
      {/* Primary Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Search */}
        <div className="md:col-span-1">
          <Input
            type="search"
            placeholder="Search patients by name or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>

        {/* Compliance Filter */}
        <div>
          <select
            value={complianceFilter}
            onChange={handleComplianceChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-medical"
          >
            {complianceOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Filter */}
        <div>
          <select
            value={riskFilter}
            onChange={handleRiskChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-medical"
          >
            {riskOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Discharge Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={dateRange?.start}
                  onChange={(e) => handleDateRangeChange('start', e?.target?.value)}
                />
                <Input
                  type="date"
                  placeholder="End date"
                  value={dateRange?.end}
                  onChange={(e) => handleDateRangeChange('end', e?.target?.value)}
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Quick Filters
              </label>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRiskFilter('high');
                    applyFilters({ riskFilter: 'high' });
                  }}
                  className="w-full justify-start text-error border-error/20 hover:bg-error/10"
                  iconName="AlertTriangle"
                  iconPosition="left"
                  iconSize={14}
                >
                  High Risk Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setComplianceFilter('poor');
                    applyFilters({ complianceFilter: 'poor' });
                  }}
                  className="w-full justify-start text-warning border-warning/20 hover:bg-warning/10"
                  iconName="TrendingDown"
                  iconPosition="left"
                  iconSize={14}
                >
                  Poor Compliance
                </Button>
              </div>
            </div>

            {/* Export Options */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Export Data
              </label>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  iconName="Download"
                  iconPosition="left"
                  iconSize={14}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  iconName="FileText"
                  iconPosition="left"
                  iconSize={14}
                >
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Search: "{searchTerm}"
              <button
                onClick={() => {
                  setSearchTerm('');
                  applyFilters({ searchTerm: '' });
                }}
                className="ml-2 hover:text-primary/70"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          {complianceFilter !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
              Compliance: {complianceOptions?.find(o => o?.value === complianceFilter)?.label}
              <button
                onClick={() => {
                  setComplianceFilter('all');
                  applyFilters({ complianceFilter: 'all' });
                }}
                className="ml-2 hover:text-accent/70"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          {riskFilter !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
              Risk: {riskOptions?.find(o => o?.value === riskFilter)?.label}
              <button
                onClick={() => {
                  setRiskFilter('all');
                  applyFilters({ riskFilter: 'all' });
                }}
                className="ml-2 hover:text-warning/70"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterControls;