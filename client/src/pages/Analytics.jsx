import { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../services/api';
import './Analytics.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [peakHours, setPeakHours] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    types: [],
    granularity: 'day'
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.types.length > 0) params.append('types', filters.types.join(','));

      const [summaryRes, trendsRes, peakHoursRes] = await Promise.all([
        api.get(`/analytics/summary?${params.toString()}`),
        api.get(`/analytics/trends?${params.toString()}&granularity=${filters.granularity}`),
        api.get(`/analytics/peak-hours?${params.toString()}`)
      ]);

      setSummary(summaryRes.data.data);
      setTrends(trendsRes.data.data || []);
      setPeakHours(peakHoursRes.data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const toggleType = (type) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  // Chart configurations
  const trendChartData = {
    labels: trends.map(t => {
      const { year, month, day } = t.period;
      if (day) return `${month}/${day}`;
      if (month) return `${year}-${month}`;
      return `${year}`;
    }),
    datasets: [
      {
        label: 'Total Incidents',
        data: trends.map(t => t.count),
        borderColor: '#1a365d',
        backgroundColor: 'rgba(26, 54, 93, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const typeChartData = {
    labels: summary?.typeBreakdown?.map(t => t.type.replace('_', ' ')) || [],
    datasets: [{
      data: summary?.typeBreakdown?.map(t => t.count) || [],
      backgroundColor: ['#c53030', '#553c9a', '#744210', '#4a5568']
    }]
  };

  const severityChartData = {
    labels: summary?.severityBreakdown?.map(s => s.severity) || [],
    datasets: [{
      data: summary?.severityBreakdown?.map(s => s.count) || [],
      backgroundColor: ['#48bb78', '#ecc94b', '#f56565', '#c53030']
    }]
  };

  const hourlyChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Incidents by Hour',
      data: peakHours?.hourlyDistribution || Array(24).fill(0),
      backgroundColor: 'rgba(26, 54, 93, 0.7)'
    }]
  };

  const dayOfWeekChartData = {
    labels: peakHours?.dayOfWeekDistribution?.map(d => d.day) || [],
    datasets: [{
      label: 'Incidents by Day',
      data: peakHours?.dayOfWeekDistribution?.map(d => d.count) || [],
      backgroundColor: 'rgba(45, 55, 72, 0.7)'
    }]
  };

  if (loading && !summary) {
    return <div className="container loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="container">
        <h1>Analytics Dashboard</h1>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Granularity</label>
            <select
              value={filters.granularity}
              onChange={(e) => handleFilterChange('granularity', e.target.value)}
            >
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
          <div className="filter-group types-filter">
            <label>Types</label>
            <div className="type-buttons">
              {['dangerous_driving', 'crime', 'security', 'other'].map(type => (
                <button
                  key={type}
                  className={filters.types.includes(type) ? 'active' : ''}
                  onClick={() => toggleType(type)}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'trends' ? 'active' : ''}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
          <button
            className={activeTab === 'time' ? 'active' : ''}
            onClick={() => setActiveTab('time')}
          >
            Time Analysis
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && summary && (
          <div className="analytics-content">
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="stat-card">
                <h3>Total Incidents</h3>
                <div className="stat-value">{summary.totalIncidents}</div>
              </div>
              <div className="stat-card">
                <h3>This Week</h3>
                <div className="stat-value">{summary.thisWeek}</div>
                <div className={`stat-change ${summary.trend}`}>
                  {summary.changePercentage > 0 ? '+' : ''}{summary.changePercentage}%
                </div>
              </div>
              <div className="stat-card">
                <h3>Last Week</h3>
                <div className="stat-value">{summary.lastWeek}</div>
              </div>
              <div className="stat-card">
                <h3>Trend</h3>
                <div className={`trend-indicator ${summary.trend}`}>
                  {summary.trend === 'up' ? '↑' : summary.trend === 'down' ? '↓' : '→'}
                  {summary.trend}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Incidents by Type</h3>
                <div className="chart-container pie-chart">
                  <Doughnut
                    data={typeChartData}
                    options={{ plugins: { legend: { position: 'bottom' } } }}
                  />
                </div>
              </div>
              <div className="chart-card">
                <h3>Incidents by Severity</h3>
                <div className="chart-container pie-chart">
                  <Pie
                    data={severityChartData}
                    options={{ plugins: { legend: { position: 'bottom' } } }}
                  />
                </div>
              </div>
            </div>

            {/* Type Breakdown Table */}
            <div className="breakdown-table">
              <h3>Type Breakdown</h3>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Count</th>
                    <th>Percentage</th>
                    <th>Avg Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.typeBreakdown?.map(t => (
                    <tr key={t.type}>
                      <td className="type-cell">
                        <span className={`type-badge ${t.type}`}>{t.type.replace('_', ' ')}</span>
                      </td>
                      <td>{t.count}</td>
                      <td>{t.percentage}%</td>
                      <td>{t.avgSeverity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="analytics-content">
            <div className="chart-card full-width">
              <h3>Incident Trends Over Time</h3>
              <div className="chart-container line-chart">
                <Line
                  data={trendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </div>
            </div>

            {trends.length > 0 && (
              <div className="trend-details">
                <h3>Period Details</h3>
                <div className="trend-list">
                  {trends.slice(-10).reverse().map((t, i) => (
                    <div key={i} className="trend-item">
                      <span className="period">
                        {t.period.month}/{t.period.day || '01'}/{t.period.year}
                      </span>
                      <span className="count">{t.count} incidents</span>
                      <div className="mini-breakdown">
                        {Object.entries(t.typeBreakdown || {}).map(([type, count]) => (
                          count > 0 && <span key={type} className={`mini-badge ${type}`}>{count}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Time Analysis Tab */}
        {activeTab === 'time' && peakHours && (
          <div className="analytics-content">
            <div className="time-stats">
              <div className="stat-card">
                <h3>Rush Hour Incidents</h3>
                <div className="stat-value">{peakHours.rushHourStats?.rushHour || 0}</div>
                <div className="stat-label">{peakHours.rushHourStats?.rushHourPercentage || 0}% of total</div>
              </div>
              <div className="stat-card">
                <h3>Weekend Incidents</h3>
                <div className="stat-value">{peakHours.weekendStats?.weekend || 0}</div>
                <div className="stat-label">{peakHours.weekendStats?.weekendPercentage || 0}% of total</div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Incidents by Hour of Day</h3>
                <div className="chart-container bar-chart">
                  <Bar
                    data={hourlyChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: { y: { beginAtZero: true } }
                    }}
                  />
                </div>
              </div>
              <div className="chart-card">
                <h3>Incidents by Day of Week</h3>
                <div className="chart-container bar-chart">
                  <Bar
                    data={dayOfWeekChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: { y: { beginAtZero: true } }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
