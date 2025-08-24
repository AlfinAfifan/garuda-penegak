'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboard } from '@/services/dashboard';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Users, Building2, UserCheck, Trophy, Award, FileText, BarChart3 } from 'lucide-react';
import { useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useSession } from 'next-auth/react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, isPending } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard(),
    retry: 1,
    retryDelay: 1000,
  });

  const hasChartData = (chartData: any) => {
    if (!chartData || !chartData.datasets || !chartData.datasets[0]) return false;
    const data = chartData.datasets[0].data;
    return data && data.some((value: number) => value > 0);
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Line Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Doughnut Chart options
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  // TKU Doughnut Chart Data
  const tkuDoughnutData = {
    labels: ['Bantara', 'Laksana'],
    datasets: [
      {
        data: [data?.detail_tku?.bantara ?? 0, data?.detail_tku?.laksana ?? 0],
        backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(59, 130, 246, 0.8)'],
        borderColor: ['rgb(99, 102, 241)', 'rgb(59, 130, 246)'],
        borderWidth: 2,
      },
    ],
  };

  // TKK Doughnut Chart Data
  const tkkDoughnutData = {
    labels: ['Purwa', 'Madya', 'Utama'],
    datasets: [
      {
        data: [data?.detail_tkk?.purwa ?? 0, data?.detail_tkk?.madya ?? 0, data?.detail_tkk?.utama ?? 0],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(21, 128, 61, 0.8)'],
        borderColor: ['rgb(16, 185, 129)', 'rgb(34, 197, 94)', 'rgb(21, 128, 61)'],
        borderWidth: 2,
      },
    ],
  };

  // Monthly Member Registration Chart Data
  const monthlyMemberData = {
    labels: Object.keys(data?.monthly_members || {}),
    datasets: [
      {
        label: 'Anggota Baru',
        data: Object.values(data?.monthly_members || {}),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: 'rgb(168, 85, 247)',
        pointRadius: 4,
      },
    ],
  };

  // Garuda Chart Data (Doughnut Chart)
  const garudaChartData = {
    labels: ['Pending', 'Approved'],
    datasets: [
      {
        data: [data?.garuda?.pending ?? 0, data?.garuda?.approved ?? 0],
        backgroundColor: ['rgba(251, 146, 60, 0.8)', 'rgba(34, 197, 94, 0.8)'],
        borderColor: ['rgb(251, 146, 60)', 'rgb(34, 197, 94)'],
        borderWidth: 2,
      },
    ],
  };

  // User Chart Data (Doughnut Chart)
  const userChartData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [data?.user?.active ?? 0, data?.user?.inactive ?? 0],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
        borderWidth: 2,
      },
    ],
  };

  const stats = [
    {
      title: 'Total Anggota',
      value: isPending ? '-' : data?.total_member ?? '-',
      description: 'Anggota aktif',
      icon: Users,
      color: 'bg-blue-500',
    },
    ...(session?.user?.role === 'admin' || session?.user?.role === 'super_admin'
      ? [
          {
            title: 'Lembaga',
            value: isPending ? '-' : data?.total_institution ?? '-',
            description: 'Lembaga terdaftar',
            icon: Building2,
            color: 'bg-green-500',
          },
        ]
      : []),
    {
      title: 'TKU Completed',
      value: isPending ? '-' : data?.total_tku ?? '-',
      description: 'TKU yang telah diselesaikan',
      icon: Trophy,
      color: 'bg-yellow-500',
    },
    {
      title: 'TKK Completed',
      value: isPending ? '-' : data?.total_tkk ?? '-',
      description: 'TKK yang telah diselesaikan',
      icon: Award,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${session?.user?.role === 'admin' || session?.user?.role === 'super_admin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {stats.map((stat) => (
          <Card key={stat.title} className="border-l-4 border-l-primary-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Jumlah Anggota Setiap Bulan</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading chart...</div>
            </div>
          ) : hasChartData(monthlyMemberData) ? (
            <div className="h-64">
              <Line data={monthlyMemberData} options={lineChartOptions} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Data tidak ditemukan</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TKU Doughnut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Data TKU</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading chart...</div>
              </div>
            ) : hasChartData(tkuDoughnutData) ? (
              <div className="h-64">
                <Doughnut data={tkuDoughnutData} options={doughnutOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Data tidak ditemukan</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TKK Doughnut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Data TKK</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading chart...</div>
              </div>
            ) : hasChartData(tkkDoughnutData) ? (
              <div className="h-64">
                <Doughnut data={tkkDoughnutData} options={doughnutOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Data tidak ditemukan</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Garuda Doughnut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Status Garuda</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading chart...</div>
              </div>
            ) : hasChartData(garudaChartData) ? (
              <div className="h-64">
                <Doughnut data={garudaChartData} options={doughnutOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Data tidak ditemukan</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
