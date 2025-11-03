import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AdherenceCalendar = ({ adherenceData = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'week' or 'month'

  const mockAdherenceData = [
    { date: '2025-09-01', adherence: 100, missed: 0, taken: 4 },
    { date: '2025-09-02', adherence: 75, missed: 1, taken: 3 },
    { date: '2025-09-03', adherence: 100, missed: 0, taken: 4 },
    { date: '2025-09-04', adherence: 50, missed: 2, taken: 2 },
    { date: '2025-09-05', adherence: 100, missed: 0, taken: 4 },
    { date: '2025-09-06', adherence: 100, missed: 0, taken: 4 },
    { date: '2025-09-07', adherence: 25, missed: 3, taken: 1 },
    { date: '2025-09-08', adherence: 75, missed: 1, taken: 3 }
  ];

  const activeData = adherenceData?.length > 0 ? adherenceData : mockAdherenceData;

  const getAdherenceColor = (adherence) => {
    if (adherence >= 90) return 'bg-success';
    if (adherence >= 70) return 'bg-warning';
    if (adherence >= 50) return 'bg-orange-500';
    if (adherence > 0) return 'bg-error';
    return 'bg-gray-200';
  };

  const getAdherenceIntensity = (adherence) => {
    if (adherence >= 90) return 'opacity-100';
    if (adherence >= 70) return 'opacity-75';
    if (adherence >= 50) return 'opacity-50';
    if (adherence > 0) return 'opacity-25';
    return 'opacity-10';
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)?.getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)?.getDay();
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate?.setMonth(currentDate?.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    let day = startOfWeek?.getDay();
    const diff = startOfWeek?.getDate() - day;
    startOfWeek?.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date?.setDate(startOfWeek?.getDate() + i);
      weekDays?.push(date);
    }
    return weekDays;
  };

  const getAdherenceForDate = (date) => {
    const dateString = date?.toISOString()?.split('T')?.[0];
    return activeData?.find(d => d?.date === dateString);
  };

  const calculateWeeklyStats = () => {
    const weekDays = getWeekDays();
    let totalAdherence = 0;
    let totalMissed = 0;
    let totalTaken = 0;
    let daysWithData = 0;

    weekDays?.forEach(day => {
      const data = getAdherenceForDate(day);
      if (data) {
        totalAdherence += data?.adherence;
        totalMissed += data?.missed;
        totalTaken += data?.taken;
        daysWithData++;
      }
    });

    return {
      avgAdherence: daysWithData > 0 ? Math.round(totalAdherence / daysWithData) : 0,
      totalMissed,
      totalTaken,
      daysWithData
    };
  };

  const calculateMonthlyStats = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    let totalAdherence = 0;
    let totalMissed = 0;
    let totalTaken = 0;
    let daysWithData = 0;

    activeData?.forEach(data => {
      const dataDate = new Date(data.date);
      if (dataDate >= monthStart && dataDate <= monthEnd) {
        totalAdherence += data?.adherence;
        totalMissed += data?.missed;
        totalTaken += data?.taken;
        daysWithData++;
      }
    });

    return {
      avgAdherence: daysWithData > 0 ? Math.round(totalAdherence / daysWithData) : 0,
      totalMissed,
      totalTaken,
      daysWithData
    };
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days?.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const adherenceData = getAdherenceForDate(date);
      const isToday = date?.toDateString() === new Date()?.toDateString();

      days?.push(
        <div
          key={day}
          className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium relative cursor-pointer transition-medical hover:scale-105 ${
            isToday ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div
            className={`absolute inset-0 rounded-lg ${
              adherenceData 
                ? `${getAdherenceColor(adherenceData?.adherence)} ${getAdherenceIntensity(adherenceData?.adherence)}`
                : 'bg-gray-100'
            }`}
          />
          <span className={`relative z-10 ${
            adherenceData && adherenceData?.adherence >= 70 ? 'text-white' : 'text-text-primary'
          }`}>
            {day}
          </span>
          {adherenceData && adherenceData?.missed > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{adherenceData?.missed}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-text-secondary">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();

    return (
      <div className="space-y-3">
        {weekDays?.map((day, index) => {
          const adherenceData = getAdherenceForDate(day);
          const isToday = day?.toDateString() === new Date()?.toDateString();

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-medical ${
                isToday ? 'border-primary bg-primary/5' : 'border-border bg-surface'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <div className="text-sm font-medium text-text-primary">
                      {day?.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold text-text-primary">
                      {day?.getDate()}
                    </div>
                  </div>
                  
                  {adherenceData ? (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${getAdherenceColor(adherenceData?.adherence)}`} />
                        <span className="text-sm font-medium text-text-primary">
                          {adherenceData?.adherence}% adherence
                        </span>
                      </div>
                      <div className="text-sm text-text-secondary">
                        {adherenceData?.taken} taken, {adherenceData?.missed} missed
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-text-secondary">No data</div>
                  )}
                </div>

                {adherenceData && (
                  <div className="flex items-center space-x-2">
                    {adherenceData?.taken > 0 && (
                      <div className="flex items-center space-x-1 text-success">
                        <Icon name="CheckCircle" size={16} />
                        <span className="text-sm font-medium">{adherenceData?.taken}</span>
                      </div>
                    )}
                    {adherenceData?.missed > 0 && (
                      <div className="flex items-center space-x-1 text-error">
                        <Icon name="XCircle" size={16} />
                        <span className="text-sm font-medium">{adherenceData?.missed}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const stats = viewMode === 'week' ? calculateWeeklyStats() : calculateMonthlyStats();

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Medication Adherence</h2>
          <p className="text-sm text-text-secondary mt-1">
            Track your daily medication compliance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
        </div>
      </div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          iconName="ChevronLeft"
          iconPosition="left"
          iconSize={16}
          onClick={() => navigateMonth(-1)}
        >
          Previous
        </Button>
        
        <h3 className="text-lg font-medium text-text-primary">
          {formatDate(currentDate)}
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          iconName="ChevronRight"
          iconPosition="right"
          iconSize={16}
          onClick={() => navigateMonth(1)}
        >
          Next
        </Button>
      </div>
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-success">{stats?.avgAdherence}%</div>
          <div className="text-sm text-text-secondary">Avg Adherence</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">{stats?.totalTaken}</div>
          <div className="text-sm text-text-secondary">Doses Taken</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-error">{stats?.totalMissed}</div>
          <div className="text-sm text-text-secondary">Doses Missed</div>
        </div>
      </div>
      {/* Calendar View */}
      {viewMode === 'month' ? renderMonthView() : renderWeekView()}
      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-success rounded" />
          <span className="text-text-secondary">90-100%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-warning rounded" />
          <span className="text-text-secondary">70-89%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded" />
          <span className="text-text-secondary">50-69%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-error rounded" />
          <span className="text-text-secondary">&lt;50%</span>
        </div>
      </div>
    </div>
  );
};

export default AdherenceCalendar;