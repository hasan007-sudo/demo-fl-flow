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

interface InterviewScores {
  communication: number;
  technical: number;
  problemSolving: number;
  confidence: number;
  contentDepth: number;
  structure: number;
}

interface InterviewRadarChartProps {
  scores: InterviewScores;
  overallScore: number;
  performanceLevel: string;
  insights?: string[];
}

const CHART_COLOR = "#14b8a6"; // teal-500 - consistent color for all charts

const PERFORMANCE_LEVELS = ["Needs Improvement", "Developing", "Competent", "Proficient", "Expert"];

const PERFORMANCE_DESCRIPTIONS = {
  "Needs Improvement": "Requires substantial practice",
  "Developing": "Basic skills, needs refinement",
  "Competent": "Solid performance",
  "Proficient": "Strong interviewing skills",
  "Expert": "Exceptional performance",
};

export function InterviewRadarChart({
  scores,
  overallScore,
  performanceLevel,
  insights = [],
}: InterviewRadarChartProps) {
  // Transform scores for radar chart
  const data = [
    {
      skill: "Communication",
      value: scores.communication,
      fullMark: 100,
    },
    {
      skill: "Technical",
      value: scores.technical,
      fullMark: 100,
    },
    {
      skill: "Problem Solving",
      value: scores.problemSolving,
      fullMark: 100,
    },
    {
      skill: "Confidence",
      value: scores.confidence,
      fullMark: 100,
    },
    {
      skill: "Content Depth",
      value: scores.contentDepth,
      fullMark: 100,
    },
    {
      skill: "Structure",
      value: scores.structure,
      fullMark: 100,
    },
  ];

  const levelDescription = PERFORMANCE_DESCRIPTIONS[performanceLevel as keyof typeof PERFORMANCE_DESCRIPTIONS] || "Unknown";

  return (
    <div className="w-full space-y-6 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 rounded-2xl p-8 shadow-2xl">
      {/* Performance Level Scale at Top */}
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        {PERFORMANCE_LEVELS.map((level) => (
          <div
            key={level}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              level === performanceLevel
                ? "scale-110 shadow-lg ring-2 ring-white/30"
                : "opacity-40 scale-95"
            }`}
            style={{
              backgroundColor: level === performanceLevel ? CHART_COLOR : '#1f2937',
              color: "white",
            }}
          >
            {level}
          </div>
        ))}
      </div>

      {/* Overall Score and Level */}
      <div className="text-center space-y-3">
        <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
          <span className="text-sm text-blue-300">Interview Performance</span>
          <span className="mx-2 text-white/50">•</span>
          <span className="text-2xl font-bold" style={{ color: CHART_COLOR }}>
            {performanceLevel}
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
              tick={{ fill: "#9ca3af", fontSize: 12 }}
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            Areas for Improvement
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
