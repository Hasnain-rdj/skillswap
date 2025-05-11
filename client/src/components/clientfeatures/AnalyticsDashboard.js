import React, { useEffect, useState } from 'react';
import { getAuth } from '../auth';
import NavigationBar from '../NavigationBar';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import {
    ChartBarIcon,
    CalendarIcon,
    DocumentArrowDownIcon,
    ClipboardDocumentCheckIcon,
    DocumentChartBarIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyticsDashboard = () => {
    const { token } = getAuth();
    const [data, setData] = useState({ total: 0, active: 0, completed: 0 });
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [start, end]);

    const fetchAnalytics = async () => {
        setLoading(true);
        let url = 'http://localhost:5000/api/analytics/client';
        const params = [];
        if (start) params.push(`start=${start}`);
        if (end) params.push(`end=${end}`);
        if (params.length) url += '?' + params.join('&');
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const d = await res.json();
        setData(d);
        setLoading(false);
    };

    const exportCSV = () => {
        window.open('http://localhost:5000/api/analytics/client/export/csv', '_blank');
    };

    const exportPDF = () => {
        window.open('http://localhost:5000/api/analytics/client/export/pdf', '_blank');
    };

    const chartData = {
        labels: ['Total Projects', 'Active', 'Completed'],
        datasets: [
            {
                label: 'Projects',
                data: [data.total, data.active, data.completed],
                backgroundColor: ['#2563eb', '#facc15', '#22c55e'],
                borderWidth: 1,
                borderColor: ['#1e40af', '#ca8a04', '#16a34a'],
                borderRadius: 6
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(37, 99, 235, 0.8)',
                padding: 10,
                bodyFont: {
                    size: 14
                },
                titleFont: {
                    size: 16
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            <NavigationBar />
            <div className="p-4 sm:p-8">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-t-8 border-blue-600">
                    <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
                        <ChartBarIcon className="h-6 w-6 mr-2" />
                        Analytics Dashboard
                    </h2>

                    <div className="flex flex-wrap gap-3 mb-6">
                        <div className="relative flex-1 min-w-[120px]">
                            <label className="block mb-1 text-sm font-medium text-gray-700 flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" /> From
                            </label>
                            <input
                                type="date"
                                value={start}
                                onChange={e => setStart(e.target.value)}
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            />
                        </div>

                        <div className="relative flex-1 min-w-[120px]">
                            <label className="block mb-1 text-sm font-medium text-gray-700 flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" /> To
                            </label>
                            <input
                                type="date"
                                value={end}
                                onChange={e => setEnd(e.target.value)}
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            />
                        </div>

                        <div className="flex space-x-2 items-end">
                            <button
                                onClick={exportCSV}
                                className="bg-blue-600 text-white px-3 py-2 rounded font-bold hover:bg-blue-700 transition-all duration-300 flex items-center"
                            >
                                <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                                <span className="hidden sm:inline">Export</span> CSV
                            </button>

                            <button
                                onClick={exportPDF}
                                className="bg-blue-600 text-white px-3 py-2 rounded font-bold hover:bg-blue-700 transition-all duration-300 flex items-center"
                            >
                                <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                                <span className="hidden sm:inline">Export</span> PDF
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center text-blue-600 p-12 flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading analytics...
                        </div>
                    ) : (
                        <>
                            <div className="h-64 sm:h-80 mb-6">
                                <Bar data={chartData} options={chartOptions} />
                            </div>

                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                                    <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                                    Project Summary
                                </h3>

                                <div className="grid sm:grid-cols-3 gap-4 text-center">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
                                        <div className="text-xl font-bold text-blue-700">{data.total}</div>
                                        <div className="text-gray-500 flex items-center justify-center">
                                            <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
                                            Total Projects
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
                                        <div className="text-xl font-bold text-yellow-500">{data.active}</div>
                                        <div className="text-gray-500 flex items-center justify-center">
                                            <DocumentChartBarIcon className="h-4 w-4 mr-1" />
                                            Active
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
                                        <div className="text-xl font-bold text-green-500">{data.completed}</div>
                                        <div className="text-gray-500 flex items-center justify-center">
                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                            Completed
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
