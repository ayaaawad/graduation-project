'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), {
  ssr: false,
});
const PieChartJs = dynamic(() => import('react-chartjs-2').then((mod) => mod.Pie), {
  ssr: false,
});
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type DashboardLoaders = {
  setLoading: (value: boolean) => void;
  setAuthenticated: (value: boolean) => void;
  setAnalytics: (value: any) => void;
  setAdminRole: (value: string) => void;
  setOrders: (value: any[]) => void;
  setPrediction: (value: any) => void;
  setSpecialOrders: (value: any[]) => void;
  setEconomyData: (value: any) => void;
};

async function loadDashboardData(loaders: DashboardLoaders) {
  loaders.setLoading(true);
  try {
    const analyticsResponse = await fetch('/api/admin/analytics', {
      credentials: 'include',
    });
    if (analyticsResponse.status === 401) {
      loaders.setAuthenticated(false);
      loaders.setAnalytics(null);
      loaders.setOrders([]);
      loaders.setPrediction(null);
      return;
    }

    if (!analyticsResponse.ok) {
      const txt = await analyticsResponse.text();
      throw new Error(txt || 'Failed');
    }

    const analyticsData = await analyticsResponse.json();
    loaders.setAnalytics(analyticsData);
    loaders.setAuthenticated(true);

    const role = document.cookie
      .split('; ')
      .find((row) => row.startsWith('admin_role='))
      ?.split('=')[1];
    if (role) {
      loaders.setAdminRole(role);
    }

    const ordersResponse = await fetch('/api/admin/orders', {
      credentials: 'include',
    });
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      loaders.setOrders(
        Array.isArray(ordersData.orders) ? ordersData.orders : []
      );
    }

    const specialOrdersResponse = await fetch('/api/admin/special-orders', {
      credentials: 'include',
    });
    if (specialOrdersResponse.ok) {
      const specialOrdersData = await specialOrdersResponse.json();
      loaders.setSpecialOrders(
        Array.isArray(specialOrdersData.orders)
          ? specialOrdersData.orders
          : []
      );
    }

    // Fetch prediction data
    const predictionResponse = await fetch('/api/admin/analytics/predict', {
      credentials: 'include',
    });
    if (predictionResponse.ok) {
      const predictionData = await predictionResponse.json();
      loaders.setPrediction(predictionData);
    }

    const economyResponse = await fetch('/api/admin/analytics/economy', {
      credentials: 'include',
    });
    if (economyResponse.ok) {
      const economyData = await economyResponse.json();
      loaders.setEconomyData(economyData);
    }
  } catch (err) {
    console.error('Dashboard load error', err);
  } finally {
    loaders.setLoading(false);
  }
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [specialOrders, setSpecialOrders] = useState<any[]>([]);
  const [economyData, setEconomyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminRole, setAdminRole] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void loadDashboardData({
      setLoading,
      setAuthenticated,
      setAnalytics,
      setAdminRole,
      setOrders,
      setPrediction,
      setSpecialOrders,
      setEconomyData,
    });
  }, []);

  const forecastData = useMemo(() => {
    if (!prediction) return [];

    const actual = prediction.actualRevenue.map((item: any) => ({
      date: item.date,
      label: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      actual: item.revenue,
      predicted: null,
    }));

    const predicted = prediction.predictedRevenue.map((item: any) => ({
      date: item.date,
      label: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      actual: null,
      predicted: item.revenue,
    }));

    return [...actual, ...predicted].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [prediction]);

  const economySeries = useMemo(() => {
    if (!economyData) return [];

    const actual = economyData.actualRevenue.map((item: any) => ({
      date: item.date,
      label: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      actual: item.revenue,
      predicted: null,
    }));

    const predicted = economyData.predictedRevenue.map((item: any) => ({
      date: item.date,
      label: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      actual: null,
      predicted: item.revenue,
    }));

    return [...actual, ...predicted].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [economyData]);

  const paymentDonut = useMemo(() => {
    if (!economyData?.paymentDistribution) return [];
    return [
      { name: 'Visa', value: economyData.paymentDistribution.visa },
      { name: 'Cash', value: economyData.paymentDistribution.cash },
    ];
  }, [economyData]);

  async function login() {
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Auth failed');
      }
      const data = await res.json();
      setAdminRole(data.role);
      setAuthenticated(true);
      setEmail('');
      setPassword('');
      await loadDashboardData({
        setLoading,
        setAuthenticated,
        setAnalytics,
        setAdminRole,
        setOrders,
        setPrediction,
        setSpecialOrders,
        setEconomyData,
      });
    } catch (e: any) {
      setError(e.message || 'Invalid email or password');
    }
  }

  async function logout() {
    document.cookie = 'admin_email=; path=/; max-age=0';
    document.cookie = 'admin_role=; path=/; max-age=0';
    setAuthenticated(false);
    setAdminRole('');
    setAnalytics(null);
    setOrders([]);
    setPrediction(null);
    setSpecialOrders([]);
    setEconomyData(null);
  }

  if (!authenticated) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
          <div className="glass-panel mx-auto max-w-xl rounded-2xl p-8">
            Loading dashboard...
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
        <div className="glass-panel mx-auto max-w-xl rounded-2xl p-8">
          <h2 className="mb-6 text-2xl font-bold">Admin Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input mb-3 w-full rounded-lg p-3 text-white placeholder-slate-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input mb-4 w-full rounded-lg p-3 text-white placeholder-slate-500"
          />
          <button
            onClick={login}
            className="primary-button w-full rounded-lg p-3 font-semibold text-white transition hover:brightness-110"
          >
            Sign in
          </button>
          {error && <p className="mt-3 text-red-400">{error}</p>}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
        <div className="mx-auto max-w-7xl">Loading analytics...</div>
      </div>
    );
  }

  const pieData = {
    labels: ['New', 'Used'],
    datasets: [
      {
        data: [
          analytics.inventoryBreakdown.new,
          analytics.inventoryBreakdown.used,
        ],
        backgroundColor: ['#0ea5e9', '#0284c7'],
        hoverBackgroundColor: ['#38bdf8', '#0369a1'],
      },
    ],
  };

  const barData = {
    labels: analytics.topPerformers.map((p: any) => p.modelName),
    datasets: [
      {
        label: 'Sales Count',
        data: analytics.topPerformers.map((p: any) => p.sales_count || 0),
        backgroundColor: '#0ea5e9',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400">
              Role:{' '}
              <span className="font-semibold capitalize text-blue-400">
                {adminRole}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            {adminRole === 'admin' && (
              <Link
                href="/admin/manage"
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold transition hover:bg-blue-700"
              >
                📦 Manage Products
              </Link>
            )}
            <button
              onClick={logout}
              className="rounded-lg bg-slate-700 px-6 py-2 font-semibold transition hover:bg-slate-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold">BI Analytics</h2>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-900/60">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="glass-panel rounded-lg p-4">
                    <p className="text-sm text-slate-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-400">
                      ${analytics.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="glass-panel rounded-lg p-4">
                    <p className="text-sm text-slate-400">Total Laptops Sold</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {analytics.totalSold}
                    </p>
                  </div>
                  <div className="glass-panel rounded-lg p-4">
                    <p className="text-sm text-slate-400">Current Stock Count</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {analytics.currentStockCount}
                    </p>
                  </div>
                  <div className="glass-panel rounded-lg p-4">
                    <p className="text-sm text-slate-400">
                      Most Requested Out-of-Stock Items
                    </p>
                    <p className="text-2xl font-bold text-amber-300">
                      {analytics.mostRequestedOutOfStock?.totalRequests ?? 0}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {(analytics.mostRequestedOutOfStock?.topItems ?? [])[0]
                        ? `${analytics.mostRequestedOutOfStock.topItems[0].brand} ${analytics.mostRequestedOutOfStock.topItems[0].modelName}`
                        : 'No special orders yet'}
                    </p>
                  </div>
                </div>

                {specialOrders.length > 0 && (
                  <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-5 text-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-amber-200">
                        New Procurement Request
                      </h3>
                      <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                        {specialOrders.length} Pending
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-slate-200">
                      {specialOrders.map((order) => (
                        <div
                          key={order._id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">User Email</p>
                            <p className="font-medium">{order.email}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Requested Laptop</p>
                            <p className="font-medium">
                              {order.brand} {order.modelName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AI Match</p>
                            <p className="font-semibold text-amber-200">
                              {order.matchScore}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="glass-panel col-span-1 rounded-lg p-4">
                    <h3 className="mb-4 font-semibold text-white">
                      Inventory Health
                    </h3>
                    <PieChartJs data={pieData} />
                  </div>

                  <div className="glass-panel col-span-2 rounded-lg p-4">
                    <h3 className="mb-4 font-semibold text-white">Top Performers</h3>
                    <Bar data={barData} />
                  </div>
                </div>

                <div className="glass-panel rounded-lg p-4">
                  <h3 className="mb-2 font-semibold text-white">Match Accuracy</h3>
                  <p className="text-slate-300">
                    High Match (&gt;90%):{' '}
                    <strong className="text-blue-400">
                      {analytics.matchAccuracy.highMatch}
                    </strong>
                    {'  '}| AI Fallback:{' '}
                    <strong className="text-blue-400">
                      {analytics.matchAccuracy.fallback}
                    </strong>
                  </p>
                </div>

                <div className="glass-panel rounded-lg p-4">
                  <h3 className="mb-4 font-semibold text-white">Order History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-slate-400">
                        <tr>
                          <th className="pb-3 pr-4 font-medium">Laptop</th>
                          <th className="pb-3 pr-4 font-medium">Price</th>
                          <th className="pb-3 pr-4 font-medium">Payment</th>
                          <th className="pb-3 pr-4 font-medium">Buyer</th>
                          <th className="pb-3 pr-4 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr
                            key={order._id}
                            className="border-t border-white/5 text-slate-200"
                          >
                            <td className="py-3 pr-4">
                              {order.productBrand} {order.productModelName}
                            </td>
                            <td className="py-3 pr-4 text-blue-300">
                              ${Number(order.price).toLocaleString()}
                            </td>
                            <td className="py-3 pr-4">
                              {order.paymentMethod === 'card'
                                ? 'Visa/Card'
                                : 'Cash on Delivery'}
                            </td>
                            <td className="py-3 pr-4">{order.customerName}</td>
                            <td className="py-3 pr-4 text-slate-400">
                              {new Date(order.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td className="py-4 text-slate-400" colSpan={5}>
                              No orders recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="intelligence">
              <div className="space-y-6">
                <Card className="border-white/10 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle>Revenue Forecast</CardTitle>
                    <CardDescription>
                      Blue line: historical sales | Dashed line: AI prediction for the next 14 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {prediction ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={forecastData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="3 3" />
                            <XAxis dataKey="label" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                color: '#e2e8f0',
                              }}
                              labelStyle={{ color: '#cbd5e1' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="actual"
                              stroke="#0ea5e9"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              connectNulls
                            />
                            <Line
                              type="monotone"
                              dataKey="predicted"
                              stroke="#38bdf8"
                              strokeDasharray="6 6"
                              strokeWidth={2}
                              dot={false}
                              connectNulls
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          Loading forecast...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle>Engineering Economy Forecast</CardTitle>
                    <CardDescription>
                      Actual payments vs. predicted revenue with a break-even line.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                      <div className="h-80">
                        {economyData ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={economySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                              <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="3 3" />
                              <XAxis dataKey="label" stroke="#94a3b8" />
                              <YAxis yAxisId="left" stroke="#94a3b8" />
                              <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: '#0f172a',
                                  border: '1px solid rgba(148, 163, 184, 0.2)',
                                  color: '#e2e8f0',
                                }}
                                labelStyle={{ color: '#cbd5e1' }}
                              />
                              <ReferenceLine
                                y={economyData.targetRevenue}
                                yAxisId="left"
                                stroke="#f97316"
                                strokeDasharray="4 4"
                                label={{ value: 'Target', fill: '#f97316', fontSize: 12 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                dot={{ r: 2 }}
                                yAxisId="left"
                                connectNulls
                              />
                              <Line
                                type="monotone"
                                dataKey="predicted"
                                stroke="#38bdf8"
                                strokeDasharray="6 6"
                                strokeWidth={2}
                                dot={false}
                                yAxisId="right"
                                connectNulls
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            Loading economy forecast...
                          </div>
                        )}
                      </div>
                      <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                        <div>
                          <p className="text-sm text-slate-400">Total Actual Revenue (MoM)</p>
                          <p className="text-2xl font-semibold text-blue-300">
                            ${(economyData?.totalActualRevenue ?? 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Forecasted Revenue</p>
                          <p className="text-2xl font-semibold text-cyan-300">
                            ${(economyData?.forecastedRevenue ?? 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Payment Distribution</p>
                          <div className="h-40">
                            {paymentDonut.length ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <RechartsTooltip
                                    contentStyle={{
                                      backgroundColor: '#0f172a',
                                      border: '1px solid rgba(148, 163, 184, 0.2)',
                                      color: '#e2e8f0',
                                    }}
                                  />
                                  <Pie
                                    data={paymentDonut}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={45}
                                    outerRadius={65}
                                    paddingAngle={6}
                                  >
                                    <Cell fill="#38bdf8" />
                                    <Cell fill="#facc15" />
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                No payment data
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Target Revenue</p>
                          <p className="text-lg font-semibold text-orange-300">
                            ${(economyData?.targetRevenue ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-gradient-to-r from-blue-900/30 to-cyan-900/30">
                  <CardHeader>
                    <CardTitle>Prediction Card</CardTitle>
                    <CardDescription>
                      Forecast summary based on the linear regression slope.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-slate-400">Projected Monthly Revenue</p>
                        <p className="text-2xl font-semibold text-blue-300">
                          ${(prediction?.projectedMonthlyRevenue ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Growth Velocity</p>
                        <p className={`text-2xl font-semibold ${
                          (prediction?.growthVelocity ?? 0) > 0 ? 'text-green-400' : 'text-slate-200'
                        }`}>
                          {(prediction?.growthVelocity ?? 0) > 0 ? '+' : ''}{prediction?.growthVelocity ?? 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Status</p>
                        <p className={`text-2xl font-semibold ${
                          prediction?.status === 'Bullish' ? 'text-emerald-400' : 'text-slate-200'
                        }`}>
                          {prediction?.status || 'Stable'}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-400">
                      Confidence: {prediction?.confidence ?? 0}% (based on {prediction?.dataPoints ?? 0} days of data)
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
