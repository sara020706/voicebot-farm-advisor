import { useState, useEffect } from 'react';
import { apiCalendar } from '../../lib/api';
import { Spinner } from '../Spinner';

const CROPS = ['rice','wheat','maize','cotton','sugarcane','mungbean','blackgram',
  'lentil','pomegranate','banana','mango','grapes','watermelon','muskmelon',
  'apple','orange','papaya','coconut','jute','coffee','chickpea','kidneybeans'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface SeasonalCalendarProps {
  currentLang: string;
  onNav: (s: string) => void;
}

interface Task {
  month: number;
  week: number;
  task: string;
  type: string;
  is_current?: boolean;
}

export default function SeasonalCalendar({ currentLang, onNav }: SeasonalCalendarProps) {
  const [crop, setCrop] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    const last = localStorage.getItem('vb_last_crop');
    if (last) {
      const normalized = last.toLowerCase().trim();
      setCrop(normalized);
      fetchCalendar(normalized);
    }
  }, []);

  const fetchCalendar = async (c: string) => {
    const cropKey = c.toLowerCase().trim();
    
    setLoading(true);
    setError('');
    setData(null);
    
    try {
      const result = await apiCalendar(cropKey);
      
      if (!result || !result.tasks || result.tasks.length === 0) {
        setError(`No calendar data available for ${cropKey}. Try another crop.`);
        return;
      }
      
      setData(result);
      setSelectedMonth(result.current_month || new Date().getMonth() + 1);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = e.target.value;
    const cropKey = c.toLowerCase().trim();
    setCrop(cropKey);
    if (cropKey) {
      fetchCalendar(cropKey);
    } else {
      setData(null);
      setError('');
    }
  };

  const getTaskColor = (type: string) => {
    const colors: Record<string, string> = {
      sow: 'bg-green-500',
      fertilize: 'bg-amber-500',
      irrigate: 'bg-blue-500',
      harvest: 'bg-orange-500',
      maintain: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-400';
  };

  const getSeasonBadge = (season: string) => {
    const colors: Record<string, string> = {
      Kharif: 'bg-green-100 text-green-700 border-green-300',
      Rabi: 'bg-blue-100 text-blue-700 border-blue-300',
      Zaid: 'bg-amber-100 text-amber-700 border-amber-300',
      Annual: 'bg-purple-100 text-purple-700 border-purple-300',
    };
    return colors[season] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const monthHasTasks = (month: number) => {
    if (!data || !data.tasks) return false;
    return data.tasks.some((t: Task) => t.month === month);
  };

  const getMonthTasks = (month: number) => {
    if (!data || !data.tasks) return [];
    return data.tasks.filter((t: Task) => t.month === month);
  };

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-6">Crop Calendar</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Crop</label>
        <select
          value={crop}
          onChange={handleCropChange}
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">-- Choose a crop --</option>
          {CROPS.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="vb-card bg-amber-50 border-amber-200 text-amber-800 p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium mb-1">Limited Data</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {!loading && !data && !error && (
        <div className="vb-card text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={1.5} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <p className="text-muted-foreground mb-2">Select a crop to see planting calendar</p>
          <p className="text-xs text-muted-foreground">Month-by-month farming activities</p>
          {!crop && (
            <button
              onClick={() => onNav('cropAdvisor')}
              className="mt-4 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm hover:bg-accent/90 transition-colors"
            >
              Go to Crop Advisor
            </button>
          )}
        </div>
      )}

      {data && !loading && (
        <div>
          <div className="vb-card mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-heading text-xl font-bold capitalize">{data.crop}</h3>
                <p className="text-sm text-muted-foreground">Duration: {data.duration_days || 0} days</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeasonBadge(data.season || 'Varies')}`}>
                {data.season || 'Varies'}
              </span>
            </div>
          </div>

          <div className="vb-card mb-6">
            <div className="text-sm font-medium mb-4">12-Month Timeline</div>
            <div className="grid grid-cols-12 gap-1">
              {MONTHS.map((month, idx) => {
                const monthNum = idx + 1;
                const hasTasks = monthHasTasks(monthNum);
                const isCurrent = monthNum === data.current_month;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedMonth(monthNum)}
                    className={`relative p-2 rounded-lg text-xs font-medium transition-all ${
                      selectedMonth === monthNum
                        ? 'bg-accent text-accent-foreground ring-2 ring-accent'
                        : isCurrent
                        ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                        : hasTasks
                        ? 'bg-muted hover:bg-accent/20'
                        : 'bg-card text-muted-foreground'
                    }`}
                  >
                    {month}
                    {hasTasks && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-400 ring-2 ring-green-400" />
                <span>Current Month</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span>Has Tasks</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-lg font-bold mb-4">
              Tasks for {MONTHS[selectedMonth - 1]}
            </h3>
            {getMonthTasks(selectedMonth).length === 0 ? (
              <div className="vb-card text-center py-8 text-muted-foreground">
                No tasks scheduled for this month
              </div>
            ) : (
              <div className="space-y-3">
                {getMonthTasks(selectedMonth).map((task: Task, idx: number) => (
                  <div key={idx} className="vb-card">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getTaskColor(task.type)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">Week {task.week}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            task.type === 'sow' ? 'bg-green-100 text-green-700' :
                            task.type === 'fertilize' ? 'bg-amber-100 text-amber-700' :
                            task.type === 'irrigate' ? 'bg-blue-100 text-blue-700' :
                            task.type === 'harvest' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.type}
                          </span>
                        </div>
                        <p className="text-sm">{task.task}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="vb-card mt-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <strong>Note:</strong> Calendar is based on typical growing seasons. Adjust timing based on your local climate and weather conditions.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
