import Incident from '../../models/Incident.js';

/**
 * Get heatmap data points for incidents
 */
export async function getHeatmapData(filters = {}) {
  const matchStage = buildMatchStage(filters);

  // Only include incidents with valid coordinates
  matchStage['location.lat'] = { $exists: true, $ne: null };
  matchStage['location.lng'] = { $exists: true, $ne: null };

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          // Round coordinates for clustering
          lat: { $round: ['$location.lat', 3] },
          lng: { $round: ['$location.lng', 3] }
        },
        count: { $sum: 1 },
        types: { $push: '$type' },
        avgSeverity: {
          $avg: {
            $switch: {
              branches: [
                { case: { $eq: ['$severity', 'low'] }, then: 1 },
                { case: { $eq: ['$severity', 'medium'] }, then: 2 },
                { case: { $eq: ['$severity', 'high'] }, then: 3 },
                { case: { $eq: ['$severity', 'critical'] }, then: 4 }
              ],
              default: 2
            }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        lat: '$_id.lat',
        lng: '$_id.lng',
        count: 1,
        weight: { $multiply: ['$count', '$avgSeverity'] },
        dominantType: { $arrayElemAt: ['$types', 0] }
      }
    },
    { $sort: { weight: -1 } },
    { $limit: 1000 }
  ];

  return await Incident.aggregate(pipeline);
}

/**
 * Get incident trends over time
 */
export async function getTrends(filters = {}, granularity = 'day') {
  const matchStage = buildMatchStage(filters);

  const dateGrouping = getDateGrouping(granularity);

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: dateGrouping,
        count: { $sum: 1 },
        byType: {
          $push: '$type'
        },
        bySeverity: {
          $push: '$severity'
        }
      }
    },
    {
      $project: {
        _id: 0,
        period: '$_id',
        count: 1,
        typeBreakdown: {
          dangerous_driving: {
            $size: { $filter: { input: '$byType', as: 't', cond: { $eq: ['$$t', 'dangerous_driving'] } } }
          },
          crime: {
            $size: { $filter: { input: '$byType', as: 't', cond: { $eq: ['$$t', 'crime'] } } }
          },
          security: {
            $size: { $filter: { input: '$byType', as: 't', cond: { $eq: ['$$t', 'security'] } } }
          },
          other: {
            $size: { $filter: { input: '$byType', as: 't', cond: { $eq: ['$$t', 'other'] } } }
          }
        },
        severityBreakdown: {
          low: {
            $size: { $filter: { input: '$bySeverity', as: 's', cond: { $eq: ['$$s', 'low'] } } }
          },
          medium: {
            $size: { $filter: { input: '$bySeverity', as: 's', cond: { $eq: ['$$s', 'medium'] } } }
          },
          high: {
            $size: { $filter: { input: '$bySeverity', as: 's', cond: { $eq: ['$$s', 'high'] } } }
          },
          critical: {
            $size: { $filter: { input: '$bySeverity', as: 's', cond: { $eq: ['$$s', 'critical'] } } }
          }
        }
      }
    },
    { $sort: { 'period.year': 1, 'period.month': 1, 'period.day': 1, 'period.hour': 1 } }
  ];

  return await Incident.aggregate(pipeline);
}

/**
 * Get peak hours analysis
 */
export async function getPeakHours(filters = {}) {
  const matchStage = buildMatchStage(filters);

  // Hourly distribution
  const hourlyPipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$timeBreakdown.hour',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        hour: '$_id',
        count: 1
      }
    },
    { $sort: { hour: 1 } }
  ];

  // Day of week distribution
  const dayOfWeekPipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$timeBreakdown.dayOfWeek',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        dayOfWeek: '$_id',
        count: 1
      }
    },
    { $sort: { dayOfWeek: 1 } }
  ];

  // Rush hour stats
  const rushHourPipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$timeBreakdown.isRushHour',
        count: { $sum: 1 }
      }
    }
  ];

  // Weekend stats
  const weekendPipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$timeBreakdown.isWeekend',
        count: { $sum: 1 }
      }
    }
  ];

  const [hourly, dayOfWeek, rushHour, weekend] = await Promise.all([
    Incident.aggregate(hourlyPipeline),
    Incident.aggregate(dayOfWeekPipeline),
    Incident.aggregate(rushHourPipeline),
    Incident.aggregate(weekendPipeline)
  ]);

  // Fill in missing hours
  const hourlyDistribution = Array(24).fill(0);
  hourly.forEach(h => {
    if (h.hour !== null) hourlyDistribution[h.hour] = h.count;
  });

  // Fill in missing days
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekDistribution = dayNames.map((name, index) => {
    const found = dayOfWeek.find(d => d.dayOfWeek === index);
    return { day: name, dayOfWeek: index, count: found?.count || 0 };
  });

  const rushHourCount = rushHour.find(r => r._id === true)?.count || 0;
  const nonRushHourCount = rushHour.find(r => r._id === false)?.count || 0;
  const weekendCount = weekend.find(w => w._id === true)?.count || 0;
  const weekdayCount = weekend.find(w => w._id === false)?.count || 0;

  return {
    hourlyDistribution,
    dayOfWeekDistribution,
    rushHourStats: {
      rushHour: rushHourCount,
      nonRushHour: nonRushHourCount,
      rushHourPercentage: rushHourCount + nonRushHourCount > 0
        ? Math.round((rushHourCount / (rushHourCount + nonRushHourCount)) * 100)
        : 0
    },
    weekendStats: {
      weekend: weekendCount,
      weekday: weekdayCount,
      weekendPercentage: weekendCount + weekdayCount > 0
        ? Math.round((weekendCount / (weekendCount + weekdayCount)) * 100)
        : 0
    }
  };
}

/**
 * Get breakdown by incident type
 */
export async function getByType(filters = {}) {
  const matchStage = buildMatchStage(filters);

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgSeverity: {
          $avg: {
            $switch: {
              branches: [
                { case: { $eq: ['$severity', 'low'] }, then: 1 },
                { case: { $eq: ['$severity', 'medium'] }, then: 2 },
                { case: { $eq: ['$severity', 'high'] }, then: 3 },
                { case: { $eq: ['$severity', 'critical'] }, then: 4 }
              ],
              default: 2
            }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        type: '$_id',
        count: 1,
        avgSeverity: { $round: ['$avgSeverity', 2] },
        percentage: 1
      }
    },
    { $sort: { count: -1 } }
  ];

  const results = await Incident.aggregate(pipeline);

  // Calculate percentages
  const total = results.reduce((sum, r) => sum + r.count, 0);
  return results.map(r => ({
    ...r,
    percentage: total > 0 ? Math.round((r.count / total) * 100) : 0
  }));
}

/**
 * Get breakdown by severity
 */
export async function getBySeverity(filters = {}) {
  const matchStage = buildMatchStage(filters);

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        severity: '$_id',
        count: 1
      }
    }
  ];

  const results = await Incident.aggregate(pipeline);

  const total = results.reduce((sum, r) => sum + r.count, 0);

  // Ensure all severities are represented
  const severities = ['low', 'medium', 'high', 'critical'];
  return severities.map(severity => {
    const found = results.find(r => r.severity === severity);
    const count = found?.count || 0;
    return {
      severity,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    };
  });
}

/**
 * Get breakdown by location
 */
export async function getByLocation(filters = {}) {
  const matchStage = buildMatchStage(filters);

  // By city
  const byCityPipeline = [
    { $match: { ...matchStage, 'location.city': { $exists: true, $ne: null } } },
    {
      $group: {
        _id: { city: '$location.city', state: '$location.state' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        city: '$_id.city',
        state: '$_id.state',
        count: 1
      }
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ];

  // By state
  const byStatePipeline = [
    { $match: { ...matchStage, 'location.state': { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$location.state',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        state: '$_id',
        count: 1
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ];

  const [byCity, byState] = await Promise.all([
    Incident.aggregate(byCityPipeline),
    Incident.aggregate(byStatePipeline)
  ]);

  return { byCity, byState };
}

/**
 * Get summary statistics for dashboard
 */
export async function getSummary(filters = {}) {
  const matchStage = buildMatchStage(filters);

  const totalCount = await Incident.countDocuments(matchStage);

  // Recent activity (last 7 days vs previous 7 days)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeekCount = await Incident.countDocuments({
    ...matchStage,
    createdAt: { $gte: weekAgo }
  });

  const lastWeekCount = await Incident.countDocuments({
    ...matchStage,
    createdAt: { $gte: twoWeeksAgo, $lt: weekAgo }
  });

  // Type and severity counts
  const [typeBreakdown, severityBreakdown] = await Promise.all([
    getByType(filters),
    getBySeverity(filters)
  ]);

  // Calculate change percentage
  const changePercentage = lastWeekCount > 0
    ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
    : thisWeekCount > 0 ? 100 : 0;

  return {
    totalIncidents: totalCount,
    thisWeek: thisWeekCount,
    lastWeek: lastWeekCount,
    changePercentage,
    trend: changePercentage > 0 ? 'up' : changePercentage < 0 ? 'down' : 'stable',
    typeBreakdown,
    severityBreakdown
  };
}

// Helper: Build match stage from filters
function buildMatchStage(filters) {
  const match = {};

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
  }

  if (filters.types && filters.types.length > 0) {
    match.type = { $in: filters.types };
  }

  if (filters.severities && filters.severities.length > 0) {
    match.severity = { $in: filters.severities };
  }

  if (filters.statuses && filters.statuses.length > 0) {
    match.status = { $in: filters.statuses };
  }

  if (filters.city) {
    match['location.city'] = filters.city;
  }

  if (filters.state) {
    match['location.state'] = filters.state;
  }

  if (filters.bounds) {
    const { north, south, east, west } = filters.bounds;
    match['location.lat'] = { $gte: south, $lte: north };
    match['location.lng'] = { $gte: west, $lte: east };
  }

  return match;
}

// Helper: Get date grouping based on granularity
function getDateGrouping(granularity) {
  switch (granularity) {
    case 'hour':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
        hour: { $hour: '$createdAt' }
      };
    case 'day':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    case 'week':
      return {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
    case 'month':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    case 'year':
      return {
        year: { $year: '$createdAt' }
      };
    default:
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }
}

export default {
  getHeatmapData,
  getTrends,
  getPeakHours,
  getByType,
  getBySeverity,
  getByLocation,
  getSummary
};
