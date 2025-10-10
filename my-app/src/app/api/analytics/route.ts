import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyJwt } from "@/lib/auth";

function getUserIdFromReq(req: NextRequest): string | null {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    const p = verifyJwt<{ sub: string }>(token);
    return p?.sub ?? null;
}

export async function GET(req: NextRequest) {
    const userId = getUserIdFromReq(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "30"; // days
    const periodDays = parseInt(period);

    try {
        const db = await getDb();
        const vitals = db.collection("vitals");

        // Get vitals data for the specified period
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        const vitalsData = await vitals
            .find({ 
                userId,
                date: { $gte: startDate }
            })
            .sort({ date: 1 })
            .toArray();

        if (vitalsData.length === 0) {
            return NextResponse.json({
                analytics: {
                    period: periodDays,
                    totalEntries: 0,
                    averages: {},
                    trends: {},
                    insights: [],
                    charts: {
                        daily: [],
                        weekly: [],
                        monthly: []
                    }
                }
            });
        }

        // Calculate analytics
        const analytics = calculateAnalytics(vitalsData, periodDays);

        return NextResponse.json({ analytics });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function calculateAnalytics(vitalsData: any[], periodDays: number) {
    const totalEntries = vitalsData.length;
    
    // Calculate averages
    const averages = {
        sleep: vitalsData.reduce((sum, item) => sum + (item.sleep || 0), 0) / totalEntries,
        heartRate: vitalsData.reduce((sum, item) => sum + (item.heartRate || 0), 0) / totalEntries,
        steps: vitalsData.reduce((sum, item) => sum + (item.steps || 0), 0) / totalEntries,
        water: vitalsData.reduce((sum, item) => sum + (item.water || 0), 0) / totalEntries,
        mood: vitalsData.reduce((sum, item) => sum + (item.mood || 0), 0) / totalEntries,
        stress: vitalsData.reduce((sum, item) => sum + (item.stress || 0), 0) / totalEntries,
        systolic: vitalsData.reduce((sum, item) => sum + (item.systolic || 0), 0) / totalEntries,
        diastolic: vitalsData.reduce((sum, item) => sum + (item.diastolic || 0), 0) / totalEntries,
    };

    // Calculate trends (comparing first half vs second half)
    const midPoint = Math.floor(totalEntries / 2);
    const firstHalf = vitalsData.slice(0, midPoint);
    const secondHalf = vitalsData.slice(midPoint);

    const trends = {
        sleep: calculateTrend(firstHalf, secondHalf, 'sleep'),
        heartRate: calculateTrend(firstHalf, secondHalf, 'heartRate'),
        steps: calculateTrend(firstHalf, secondHalf, 'steps'),
        water: calculateTrend(firstHalf, secondHalf, 'water'),
        mood: calculateTrend(firstHalf, secondHalf, 'mood'),
        stress: calculateTrend(firstHalf, secondHalf, 'stress'),
    };

    // Generate insights
    const insights = generateInsights(averages, trends, vitalsData);

    // Prepare chart data
    const charts = {
        daily: prepareDailyChartData(vitalsData),
        weekly: prepareWeeklyChartData(vitalsData),
        monthly: prepareMonthlyChartData(vitalsData)
    };

    return {
        period: periodDays,
        totalEntries,
        averages: Object.fromEntries(
            Object.entries(averages).map(([key, value]) => [key, Math.round(value * 100) / 100])
        ),
        trends,
        insights,
        charts
    };
}

function calculateTrend(firstHalf: any[], secondHalf: any[], field: string) {
    if (firstHalf.length === 0 || secondHalf.length === 0) return 'stable';
    
    const firstAvg = firstHalf.reduce((sum, item) => sum + (item[field] || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + (item[field] || 0), 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
}

function generateInsights(averages: any, trends: any, vitalsData: any[]) {
    const insights = [];

    // Sleep insights
    if (averages.sleep < 6) {
        insights.push({
            type: 'warning',
            category: 'sleep',
            message: 'Your average sleep duration is below recommended levels (6-8 hours).',
            recommendation: 'Try to maintain a consistent sleep schedule and aim for 7-8 hours nightly.'
        });
    } else if (averages.sleep > 9) {
        insights.push({
            type: 'info',
            category: 'sleep',
            message: 'Your sleep duration is above average. Ensure quality sleep.',
            recommendation: 'Focus on sleep quality and consider if oversleeping affects your energy levels.'
        });
    }

    // Heart rate insights
    if (averages.heartRate > 100) {
        insights.push({
            type: 'warning',
            category: 'heart',
            message: 'Your average heart rate is elevated.',
            recommendation: 'Consider consulting a healthcare provider and monitor stress levels.'
        });
    } else if (averages.heartRate < 60) {
        insights.push({
            type: 'info',
            category: 'heart',
            message: 'Your heart rate is on the lower side, which can be normal for active individuals.',
            recommendation: 'Continue monitoring and consult a doctor if you experience symptoms.'
        });
    }

    // Steps insights
    if (averages.steps < 5000) {
        insights.push({
            type: 'warning',
            category: 'activity',
            message: 'Your daily step count is below recommended levels.',
            recommendation: 'Aim for at least 10,000 steps daily for better health.'
        });
    } else if (averages.steps > 15000) {
        insights.push({
            type: 'success',
            category: 'activity',
            message: 'Excellent! You\'re maintaining high activity levels.',
            recommendation: 'Keep up the great work and ensure proper rest and recovery.'
        });
    }

    // Mood and stress insights
    if (averages.mood < 4) {
        insights.push({
            type: 'warning',
            category: 'mental',
            message: 'Your mood levels have been low recently.',
            recommendation: 'Consider activities that boost mood and consider speaking with a mental health professional.'
        });
    }

    if (averages.stress > 7) {
        insights.push({
            type: 'warning',
            category: 'mental',
            message: 'Your stress levels are consistently high.',
            recommendation: 'Practice stress management techniques like meditation, exercise, or deep breathing.'
        });
    }

    // Trend-based insights
    if (trends.sleep === 'decreasing') {
        insights.push({
            type: 'warning',
            category: 'trend',
            message: 'Your sleep duration has been decreasing over time.',
            recommendation: 'Review your bedtime routine and consider lifestyle changes to improve sleep.'
        });
    }

    if (trends.stress === 'increasing') {
        insights.push({
            type: 'warning',
            category: 'trend',
            message: 'Your stress levels are trending upward.',
            recommendation: 'Identify stress sources and implement coping strategies.'
        });
    }

    return insights;
}

function prepareDailyChartData(vitalsData: any[]) {
    return vitalsData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sleep: item.sleep || 0,
        heartRate: item.heartRate || 0,
        steps: item.steps || 0,
        water: item.water || 0,
        mood: item.mood || 0,
        stress: item.stress || 0,
        systolic: item.systolic || 0,
        diastolic: item.diastolic || 0
    }));
}

function prepareWeeklyChartData(vitalsData: any[]) {
    // Group data by week
    const weeklyData: { [key: string]: any } = {};
    
    vitalsData.forEach(item => {
        const date = new Date(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
                week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                sleep: 0,
                heartRate: 0,
                steps: 0,
                water: 0,
                mood: 0,
                stress: 0,
                count: 0
            };
        }
        
        const week = weeklyData[weekKey];
        week.sleep += item.sleep || 0;
        week.heartRate += item.heartRate || 0;
        week.steps += item.steps || 0;
        week.water += item.water || 0;
        week.mood += item.mood || 0;
        week.stress += item.stress || 0;
        week.count += 1;
    });
    
    // Calculate averages
    return Object.values(weeklyData).map((week: any) => ({
        week: week.week,
        sleep: Math.round((week.sleep / week.count) * 100) / 100,
        heartRate: Math.round((week.heartRate / week.count) * 100) / 100,
        steps: Math.round((week.steps / week.count) * 100) / 100,
        water: Math.round((week.water / week.count) * 100) / 100,
        mood: Math.round((week.mood / week.count) * 100) / 100,
        stress: Math.round((week.stress / week.count) * 100) / 100
    }));
}

function prepareMonthlyChartData(vitalsData: any[]) {
    // Group data by month
    const monthlyData: { [key: string]: any } = {};
    
    vitalsData.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                sleep: 0,
                heartRate: 0,
                steps: 0,
                water: 0,
                mood: 0,
                stress: 0,
                count: 0
            };
        }
        
        const month = monthlyData[monthKey];
        month.sleep += item.sleep || 0;
        month.heartRate += item.heartRate || 0;
        month.steps += item.steps || 0;
        month.water += item.water || 0;
        month.mood += item.mood || 0;
        month.stress += item.stress || 0;
        month.count += 1;
    });
    
    // Calculate averages
    return Object.values(monthlyData).map((month: any) => ({
        month: month.month,
        sleep: Math.round((month.sleep / month.count) * 100) / 100,
        heartRate: Math.round((month.heartRate / month.count) * 100) / 100,
        steps: Math.round((month.steps / month.count) * 100) / 100,
        water: Math.round((month.water / month.count) * 100) / 100,
        mood: Math.round((month.mood / month.count) * 100) / 100,
        stress: Math.round((month.stress / month.count) * 100) / 100
    }));
}