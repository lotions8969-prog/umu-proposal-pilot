"use client";

import { useState, useEffect } from "react";
import { History, RotateCcw, Trash2, X } from "lucide-react";
import { getVersions, clearVersions, formatVersionTimestamp } from "@/lib/versions";
import type { VersionEntry } from "@/lib/versions";
import type { GeneratedProposal } from "@/types";

interface VersionHistoryProps {
  onRestore: (proposal: GeneratedProposal) => void;
  currentId?: string;
}

export default function VersionHistory({ onRestore, currentId }: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<VersionEntry[]>([]);

  useEffect(() => {
    setVersions(getVersions());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setVersions(getVersions());
    }
  }, [isOpen]);

  const handleRestore = (entry: VersionEntry) => {
    onRestore(entry.proposal);
    setIsOpen(false);
  };

  const handleClear = () => {
    clearVersions();
    setVersions([]);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 text-xs text-slate-400 hover:text-slate-200 transition-all"
      >
        <History size={13} />
        <span>履歴</span>
        {versions.length > 0 && (
          <span className="bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full text-xs">
            {getVersions().length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History size={16} className="text-blue-400" />
                <h3 className="font-semibold text-slate-200">バージョン履歴</h3>
              </div>
              <div className="flex items-center gap-2">
                {versions.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    全削除
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {versions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <History size={32} className="mx-auto mb-3 opacity-30" />
                  <p>履歴がありません</p>
                  <p className="text-xs mt-1">提案書を生成すると、ここに履歴が残ります</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {versions.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 hover:bg-slate-800/50 transition-colors ${
                        entry.id === currentId ? "bg-blue-500/10 border-l-2 border-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{entry.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatVersionTimestamp(entry.timestamp)}
                          </p>
                          {entry.command && (
                            <p className="text-xs text-blue-400 mt-1 truncate">
                              指示: {entry.command}
                            </p>
                          )}
                        </div>
                        {entry.id !== currentId && (
                          <button
                            onClick={() => handleRestore(entry)}
                            className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs transition-all"
                          >
                            <RotateCcw size={11} />
                            復元
                          </button>
                        )}
                        {entry.id === currentId && (
                          <span className="text-xs text-blue-400 flex-shrink-0">現在</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
