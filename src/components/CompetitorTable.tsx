"use client";

import { Shield, CheckCircle, XCircle } from "lucide-react";
import type { CompetitorRow } from "@/types";

interface CompetitorTableProps {
  rows: CompetitorRow[];
  planColor: string;
}

export default function CompetitorTable({ rows, planColor }: CompetitorTableProps) {
  if (!rows || rows.length === 0) return null;

  const headerBg = {
    purple: "bg-purple-600",
    blue: "bg-blue-600",
    green: "bg-green-600",
  }[planColor] || "bg-blue-600";

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Shield size={14} className="text-yellow-400" />
        競合比較表
      </h3>

      <div className="overflow-hidden rounded-xl border border-slate-700">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-800">
              <th className="px-3 py-2 text-left text-slate-400 font-semibold w-1/3">比較項目</th>
              <th className={`px-3 py-2 text-center text-white font-bold ${headerBg} w-1/3`}>
                UMU
              </th>
              <th className="px-3 py-2 text-center text-slate-400 font-semibold w-1/3">他社ツール</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-t border-slate-800 ${i % 2 === 0 ? "bg-slate-900/30" : "bg-slate-900/60"}`}
              >
                <td className="px-3 py-2.5 text-slate-300 font-medium">{row.feature}</td>
                <td className="px-3 py-2.5 text-center">
                  <div className="flex items-start gap-1.5 justify-center">
                    {row.umuAdvantage && (
                      <CheckCircle size={12} className="text-green-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-green-300">{row.umu}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <div className="flex items-start gap-1.5 justify-center">
                    {row.umuAdvantage && (
                      <XCircle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-red-300/80">{row.competitor}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
