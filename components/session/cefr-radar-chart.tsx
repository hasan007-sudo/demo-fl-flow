"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CEFRScores {
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  fluency: number;
  comprehension: number;
}

interface CEFRRadarChartProps {
  scores: CEFRScores;
  overallScore: number;
  cefrLevel: string;
  insights?: string[];
}

const CHART_COLOR = "#14b8a6"; // teal-500 - consistent color for all charts

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const CEFR_DESCRIPTIONS = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Proficient",
};

export function CEFRRadarChart({
  scores,
  overallScore,
  cefrLevel,
  insights = [],
}: CEFRRadarChartProps) {
  // Transform scores for radar chart
  const data = [
    {
      skill: "Pronunciation",
      value: scores.pronunciation,
      fullMark: 100,
    },
    {
      skill: "Grammar",
      value: scores.grammar,
      fullMark: 100,
    },
    {
      skill: "Vocabulary",
      value: scores.vocabulary,
      fullMark: 100,
    },
    {
      skill: "Fluency",
      value: scores.fluency,
      fullMark: 100,
    },
    {
      skill: "Comprehension",
      value: scores.comprehension,
      fullMark: 100,
    },
  ];

  const levelDescription = CEFR_DESCRIPTIONS[cefrLevel as keyof typeof CEFR_DESCRIPTIONS] || "Unknown";

  return (
    <div className="w-full space-y-6 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl p-8 shadow-2xl">
      {/* CEFR Level Scale at Top */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {CEFR_LEVELS.map((level) => (
          <div
            key={level}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              level === cefrLevel
                ? "scale-110 shadow-lg ring-2 ring-white/30"
                : "opacity-40 scale-95"
            }`}
            style={{
              backgroundColor: level === cefrLevel ? CHART_COLOR : '#1f2937',
              color: "white",
            }}
          >
            {level}
          </div>
        ))}
      </div>

      {/* Overall Score and Level */}
      <div className="text-center space-y-3">
        <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30">
          <span className="text-sm text-purple-300">Proficient</span>
          <span className="mx-2 text-white/50">•</span>
          <span className="text-2xl font-bold" style={{ color: CHART_COLOR }}>
            {cefrLevel}
          </span>
        </div>
        <div className="text-lg text-white/80">{levelDescription}</div>
      </div>

      {/* Radar Chart */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid
              gridType="polygon"
              radialLines={true}
              stroke="#374151"
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "#9ca3af", fontSize: 13 }}
              className="font-medium"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={6}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              stroke="#374151"
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke={CHART_COLOR}
              fill={CHART_COLOR}
              fillOpacity={0.25}
              strokeWidth={2.5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-800 p-3 shadow-xl rounded-lg border border-white/20 backdrop-blur-sm">
                      <p className="font-medium text-white">{payload[0].payload.skill}</p>
                      <p className="text-sm font-bold" style={{ color: CHART_COLOR }}>
                        {payload[0].value}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Overall Score in Center */}
        <div className="text-center mt-8">
          <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-slate-700/80 to-slate-800/80 border-2 border-white/20 shadow-lg">
            <span className="text-3xl font-bold text-white">{overallScore}%</span>
            <span className="text-xs text-white/60">Overall</span>
          </div>
        </div>
      </div>

      {/* Skill Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(scores).map(([skill, score]) => (
          <div
            key={skill}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-4 text-center border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
          >
            <div className="text-xs text-white/50 capitalize mb-2 font-medium">
              {skill.replace(/([A-Z])/g, " $1").trim()}
            </div>
            <div className="text-2xl font-bold text-white mb-2">{score}%</div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${score}%`,
                  background: `linear-gradient(90deg, ${CHART_COLOR}CC, ${CHART_COLOR})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-5 border border-blue-500/20 backdrop-blur-sm">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-blue-400">💡</span>
            Key Insights
          </h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-white/80"
              >
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
