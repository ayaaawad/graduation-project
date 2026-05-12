/**
 * Linear Regression Prediction Engine
 * Formula: y = mx + b
 * Used to forecast future revenue based on historical sales data
 */

export interface SalesDataPoint {
  date: Date;
  revenue: number;
  sales_count: number;
}

export interface PredictionResult {
  actualRevenue: { date: string; revenue: number }[];
  predictedRevenue: { date: string; revenue: number }[];
  projectedMonthlyRevenue: number;
  growthVelocity: number;
  status: 'Bullish' | 'Stable';
  confidence: number;
  slope: number;
}

export type PaymentMethod = 'visa' | 'cash';

export interface EconomyDataPoint {
  date: Date;
  revenue: number;
  paymentMethod: PaymentMethod;
}

export function generateFakeSalesHistory(days: number = 30): SalesDataPoint[] {
  const history: SalesDataPoint[] = [];
  const today = new Date();
  const baseRevenue = 1200;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const weekIndex = Math.floor((days - 1 - i) / 7);
    const weeklyLift = 1 + weekIndex * 0.08;
    const dailyLift = 1 + (days - i) * 0.01;
    const noise = 0.85 + Math.random() * 0.3;

    const revenue = Math.max(0, Math.round(baseRevenue * weeklyLift * dailyLift * noise));

    history.push({
      date,
      revenue,
      sales_count: Math.max(1, Math.round(revenue / 900)),
    });
  }

  return history;
}

export function seedEngineeringEconomyData(days: number = 30): EconomyDataPoint[] {
  const history: EconomyDataPoint[] = [];
  const today = new Date();

  const weeklyTargets = [5000, 7000, 6500, 9000];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const weekIndex = Math.min(3, Math.floor((days - 1 - i) / 7));
    const dailyBase = weeklyTargets[weekIndex] / 7;
    const variance = 0.85 + Math.random() * 0.3;
    const revenue = Math.max(0, Math.round(dailyBase * variance));
    const paymentMethod: PaymentMethod = Math.random() > 0.55 ? 'visa' : 'cash';

    history.push({
      date,
      revenue,
      paymentMethod,
    });
  }

  return history;
}

/**
 * Calculate linear regression (y = mx + b)
 * @param data Array of data points with x (days) and y (revenue)
 * @returns Object containing slope (m) and intercept (b)
 */
function calculateLinearRegression(data: { x: number; y: number }[]): { slope: number; intercept: number } {
  if (data.length === 0) {
    return { slope: 0, intercept: 0 };
  }

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumX2 += point.x * point.x;
  }

  // Slope formula: m = (n * Σ(xy) - Σ(x) * Σ(y)) / (n * Σ(x²) - (Σ(x))²)
  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;

  // Intercept formula: b = (Σ(y) - m * Σ(x)) / n
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Calculate forecast using least squares regression
 * @param salesHistory Array of historical sales data grouped by date
 * @param daysToPredict Number of days to predict into the future (default: 14)
 * @returns Prediction result with actual and predicted revenue arrays
 */
export function calculateForecast(
  salesHistory: SalesDataPoint[],
  daysToPredict: number = 14
): PredictionResult {
  // Prepare historical data for regression
  const historicalData = salesHistory
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((point, index) => ({
      x: index,
      y: point.revenue,
      date: point.date,
    }));

  // Calculate linear regression
  const { slope, intercept } = calculateLinearRegression(
    historicalData.map((p) => ({ x: p.x, y: p.y }))
  );

  // Build actual revenue data
  const actualRevenue = historicalData.map(point => ({
    date: point.date.toISOString().split('T')[0],
    revenue: Math.round(point.y),
  }));

  // Predict future revenue for next N days
  const lastKnownDate = historicalData.length > 0
    ? new Date(historicalData[historicalData.length - 1].date)
    : new Date();
  const lastHistoricalIndex = historicalData.length - 1;
  const predictedRevenue = [];

  for (let i = 1; i <= daysToPredict; i++) {
    const futureDay = new Date(lastKnownDate);
    futureDay.setDate(futureDay.getDate() + i);

    // Use linear regression to predict: y = mx + b
    const predictedValue = slope * (lastHistoricalIndex + i) + intercept;

    predictedRevenue.push({
      date: futureDay.toISOString().split('T')[0],
      revenue: Math.round(Math.max(0, predictedValue)), // Ensure non-negative
    });
  }

  // Calculate projected monthly revenue (sum of next 30 days)
  const monthlyForecast = [] as number[];
  for (let i = 1; i <= 30; i++) {
    const value = slope * (lastHistoricalIndex + i) + intercept;
    monthlyForecast.push(Math.max(0, value));
  }
  const projectedMonthlyRevenue = Math.round(
    monthlyForecast.reduce((sum, value) => sum + value, 0)
  );

  // Growth velocity derived from slope relative to average revenue
  const averageRevenue = historicalData.length
    ? historicalData.reduce((sum, p) => sum + p.y, 0) / historicalData.length
    : 0;
  const growthVelocity = averageRevenue > 0
    ? Math.round((slope / averageRevenue) * 100)
    : 0;

  const status = slope > 0 ? 'Bullish' : 'Stable';

  // Determine confidence based on data availability
  const confidence = Math.min(100, Math.round((historicalData.length / 30) * 100));

  return {
    actualRevenue,
    predictedRevenue,
    projectedMonthlyRevenue,
    growthVelocity,
    status,
    confidence,
    slope,
  };
}

export function predictFutureRevenue(
  salesHistory: SalesDataPoint[],
  daysToPredict: number = 14
): PredictionResult {
  return calculateForecast(salesHistory, daysToPredict);
}

export function buildEconomyForecast(
  actuals: EconomyDataPoint[],
  daysToPredict: number = 30
): { actual: { date: string; revenue: number }[]; predicted: { date: string; revenue: number }[]; slope: number } {
  const sorted = [...actuals].sort((a, b) => a.date.getTime() - b.date.getTime());
  const points = sorted.map((point, index) => ({ x: index, y: point.revenue, date: point.date }));

  const { slope, intercept } = calculateLinearRegression(points.map((p) => ({ x: p.x, y: p.y })));

  const actual = points.map((point) => ({
    date: point.date.toISOString().split('T')[0],
    revenue: point.y,
  }));

  const lastDate = points.length ? new Date(points[points.length - 1].date) : new Date();
  const predicted = [] as { date: string; revenue: number }[];

  for (let i = 1; i <= daysToPredict; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);

    const predictedValue = slope * (points.length - 1 + i) + intercept;

    predicted.push({
      date: futureDate.toISOString().split('T')[0],
      revenue: Math.round(Math.max(0, predictedValue)),
    });
  }

  return { actual, predicted, slope };
}
