"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Heart, 
  Droplet, 
  Footprints, 
  Moon, 
  Smile, 
  Activity,
  Calendar,
  Save,
  TrendingUp,
  Clock,
  Thermometer,
  Weight
} from "lucide-react";

type Vital = {
    date: string;
    sleep: number;
    heartRate: number;
    steps: number;
    water: number;
    diet: string;
    mood: number;
    stress: number;
    notes?: string;
    systolic?: number;
    diastolic?: number;
    weight?: number;
    temperature?: number;
};

const dietOptions = [
    { value: "Balanced", label: "🥗 Balanced", description: "Mixed fruits, vegetables, proteins" },
    { value: "Vegetarian", label: "🥕 Vegetarian", description: "Plant-based diet" },
    { value: "Mediterranean", label: "🫒 Mediterranean", description: "Olive oil, fish, whole grains" },
    { value: "Keto", label: "🥑 Keto", description: "Low carb, high fat" },
    { value: "High Protein", label: "💪 High Protein", description: "Protein-rich foods" },
    { value: "Other", label: "🍽️ Other", description: "Custom diet plan" }
];

const moodEmojis = [
    { value: 1, emoji: "😢", label: "Very Sad", color: "text-red-500" },
    { value: 2, emoji: "😔", label: "Sad", color: "text-red-400" },
    { value: 3, emoji: "😐", label: "Neutral", color: "text-yellow-500" },
    { value: 4, emoji: "😊", label: "Good", color: "text-green-400" },
    { value: 5, emoji: "😄", label: "Very Happy", color: "text-green-600" }
];

const stressEmojis = [
    { value: 1, emoji: "😌", label: "Very Relaxed", color: "text-green-500" },
    { value: 2, emoji: "😊", label: "Relaxed", color: "text-green-400" },
    { value: 3, emoji: "😐", label: "Neutral", color: "text-yellow-500" },
    { value: 4, emoji: "😰", label: "Stressed", color: "text-orange-500" },
    { value: 5, emoji: "😱", label: "Very Stressed", color: "text-red-500" }
];

export default function VitalsPage() {
    const [form, setForm] = useState<Vital>({
        date: new Date().toISOString().slice(0, 10),
        sleep: 7,
        heartRate: 72,
        steps: 5000,
        water: 8,
        diet: "Balanced",
        mood: 3,
        stress: 3,
        notes: "",
        systolic: 120,
        diastolic: 80,
        weight: 70,
        temperature: 98.6,
    });
    const [submitting, setSubmitting] = useState(false);
    const [items, setItems] = useState<Vital[]>([]);
    const [selectedDiet, setSelectedDiet] = useState("Balanced");

    async function load() {
        const res = await fetch("/api/vitals", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setItems(data.items || []);
    }
    useEffect(() => {
        load();
    }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/vitals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Failed to save vitals");
            await load();
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <h1 className="text-3xl font-bold text-slate-900 mb-3">📊 Daily Health Vitals</h1>
                <p className="text-slate-600 text-lg">Track your health metrics and wellness journey</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Form */}
                <Card className="lg:col-span-2 rounded-xl shadow-lg border-0">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                            <Calendar className="h-6 w-6 text-blue-600" />
                            Log Your Vitals
                        </CardTitle>
                </CardHeader>
                    <CardContent className="pt-0">
                        <form className="space-y-6" onSubmit={onSubmit}>
                            {/* Date */}
                            <div className="grid gap-2">
                                <Label htmlFor="date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date
                                </Label>
                                <Input 
                                    id="date" 
                                    type="date" 
                                    value={form.date} 
                                    onChange={(e) => setForm({ ...form, date: e.target.value })} 
                                    className="text-lg"
                                />
                            </div>

                            {/* Sleep */}
                            <div className="grid gap-2">
                                <Label htmlFor="sleep" className="flex items-center gap-2">
                                    <Moon className="h-4 w-4 text-indigo-600" />
                                    Sleep Duration
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        id="sleep" 
                                        type="number" 
                                        min="0" 
                                        max="24" 
                                        step="0.5"
                                        value={form.sleep} 
                                        onChange={(e) => setForm({ ...form, sleep: Number(e.target.value) })} 
                                        className="text-lg"
                                    />
                                    <span className="text-slate-600">hours</span>
                                </div>
                            </div>

                            {/* Heart Rate */}
                            <div className="grid gap-2">
                                <Label htmlFor="hr" className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-red-600" />
                                    Heart Rate
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        id="hr" 
                                        type="number" 
                                        min="30" 
                                        max="200" 
                                        value={form.heartRate} 
                                        onChange={(e) => setForm({ ...form, heartRate: Number(e.target.value) })} 
                                        className="text-lg"
                                    />
                                    <span className="text-slate-600">bpm</span>
                                </div>
                            </div>

                            {/* Blood Pressure */}
                        <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-purple-600" />
                                    Blood Pressure
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="systolic" className="text-sm text-slate-600">Systolic</Label>
                                        <Input 
                                            id="systolic" 
                                            type="number" 
                                            min="70" 
                                            max="250" 
                                            value={form.systolic} 
                                            onChange={(e) => setForm({ ...form, systolic: Number(e.target.value) })} 
                                            placeholder="120"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="diastolic" className="text-sm text-slate-600">Diastolic</Label>
                                        <Input 
                                            id="diastolic" 
                                            type="number" 
                                            min="40" 
                                            max="150" 
                                            value={form.diastolic} 
                                            onChange={(e) => setForm({ ...form, diastolic: Number(e.target.value) })} 
                                            placeholder="80"
                                        />
                                    </div>
                                </div>
                        </div>

                            {/* Steps */}
                        <div className="grid gap-2">
                                <Label htmlFor="steps" className="flex items-center gap-2">
                                    <Footprints className="h-4 w-4 text-green-600" />
                                    Step Count
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        id="steps" 
                                        type="number" 
                                        min="0" 
                                        max="50000" 
                                        value={form.steps} 
                                        onChange={(e) => setForm({ ...form, steps: Number(e.target.value) })} 
                                        className="text-lg"
                                    />
                                    <span className="text-slate-600">steps</span>
                                </div>
                        </div>

                            {/* Water */}
                        <div className="grid gap-2">
                                <Label htmlFor="water" className="flex items-center gap-2">
                                    <Droplet className="h-4 w-4 text-blue-600" />
                                    Water Intake
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        id="water" 
                                        type="number" 
                                        min="0" 
                                        max="20" 
                                        value={form.water} 
                                        onChange={(e) => setForm({ ...form, water: Number(e.target.value) })} 
                                        className="text-lg"
                                    />
                                    <span className="text-slate-600">glasses</span>
                                </div>
                        </div>

                            {/* Weight */}
                        <div className="grid gap-2">
                                <Label htmlFor="weight" className="flex items-center gap-2">
                                    <Weight className="h-4 w-4 text-gray-600" />
                                    Weight
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        id="weight" 
                                        type="number" 
                                        min="20" 
                                        max="300" 
                                        step="0.1"
                                        value={form.weight} 
                                        onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} 
                                        className="text-lg"
                                    />
                                    <span className="text-slate-600">kg</span>
                                </div>
                        </div>

                            {/* Temperature */}
                        <div className="grid gap-2">
                                <Label htmlFor="temperature" className="flex items-center gap-2">
                                    <Thermometer className="h-4 w-4 text-orange-600" />
                                    Temperature
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        id="temperature" 
                                        type="number" 
                                        min="95" 
                                        max="105" 
                                        step="0.1"
                                        value={form.temperature} 
                                        onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })} 
                                        className="text-lg"
                                    />
                                    <span className="text-slate-600">°F</span>
                                </div>
                        </div>

                            {/* Diet Selection */}
                        <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    🍽️ Diet Pattern
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {dietOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                setSelectedDiet(option.value);
                                                setForm({ ...form, diet: option.value });
                                            }}
                                            className={`p-3 rounded-lg border text-left transition-colors ${
                                                selectedDiet === option.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-xs text-slate-600 mt-1">{option.description}</div>
                                        </button>
                                    ))}
                                </div>
                        </div>

                            {/* Mood */}
                        <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <Smile className="h-4 w-4 text-yellow-600" />
                                    Mood Level
                                </Label>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm text-slate-600">
                                        <span>How are you feeling today?</span>
                                        <span className="font-medium">{moodEmojis.find(m => m.value === form.mood)?.label}</span>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {moodEmojis.map((mood) => (
                                            <button
                                                key={mood.value}
                                                type="button"
                                                onClick={() => setForm({ ...form, mood: mood.value })}
                                                className={`p-2 rounded-lg border text-center transition-colors ${
                                                    form.mood === mood.value
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="text-2xl">{mood.emoji}</div>
                                                <div className="text-xs text-slate-600">{mood.value}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <Slider 
                                        max={5} 
                                        min={1}
                                        step={1}
                                        value={[form.mood]} 
                                        onValueChange={(v) => setForm({ ...form, mood: v[0] ?? 3 })} 
                                    />
                                </div>
                        </div>

                            {/* Stress */}
                        <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-red-600" />
                                    Stress Level
                                </Label>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm text-slate-600">
                                        <span>How stressed do you feel?</span>
                                        <span className="font-medium">{stressEmojis.find(s => s.value === form.stress)?.label}</span>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {stressEmojis.map((stress) => (
                                            <button
                                                key={stress.value}
                                                type="button"
                                                onClick={() => setForm({ ...form, stress: stress.value })}
                                                className={`p-2 rounded-lg border text-center transition-colors ${
                                                    form.stress === stress.value
                                                        ? 'border-red-500 bg-red-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="text-2xl">{stress.emoji}</div>
                                                <div className="text-xs text-slate-600">{stress.value}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <Slider 
                                        max={5} 
                                        min={1}
                                        step={1}
                                        value={[form.stress]} 
                                        onValueChange={(v) => setForm({ ...form, stress: v[0] ?? 3 })} 
                                    />
                                </div>
                        </div>

                            {/* Notes */}
                        <div className="grid gap-2">
                                <Label htmlFor="notes" className="flex items-center gap-2">
                                    📝 Notes
                                </Label>
                                <Input 
                                    id="notes" 
                                    value={form.notes} 
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                                    placeholder="Any additional notes about your health today..."
                                    className="text-lg"
                                />
                        </div>

                            {/* Submit Button */}
                            <Button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full text-lg py-6"
                                size="lg"
                            >
                                <Save className="h-5 w-5 mr-2" />
                                {submitting ? "Saving Your Vitals..." : " Save Vitals"}
                            </Button>
                    </form>
                </CardContent>
            </Card>

                {/* Recent Entries */}
                <Card className="lg:col-span-1 rounded-xl shadow-lg border-0">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                            Recent Entries
                        </CardTitle>
                </CardHeader>
                    <CardContent className="pt-0">
                    {items.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
                                <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                <p className="text-sm font-medium">No entries yet</p>
                                <p className="text-xs text-slate-400 mt-2">Start logging your health data!</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {items.slice(0, 10).map((it: any, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md bg-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-slate-900">
                                                {new Date(it.date).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </span>
                                            <div className="text-sm text-slate-600">
                                                Mood: {it.mood}/5 • Stress: {it.stress}/5
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                                <Moon className="h-3 w-3 text-indigo-500" />
                                                <span>{it.sleep}h</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                                <Heart className="h-3 w-3 text-red-500" />
                                                <span>{it.heartRate}</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                                <Footprints className="h-3 w-3 text-green-500" />
                                                <span>{it.steps?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                                <Droplet className="h-3 w-3 text-blue-500" />
                                                <span>{it.water} glasses</span>
                                            </div>
                                        </div>
                                        
                                        {it.diet && (
                                            <div className="mt-3 text-xs text-slate-500 bg-blue-50 p-2 rounded-lg">
                                                <span className="font-medium">Diet:</span> {it.diet}
                                            </div>
                                        )}
                                        
                                        {it.notes && (
                                            <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                                                <span className="font-medium">📝</span> {it.notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
            </div>
        </div>
    );
}


