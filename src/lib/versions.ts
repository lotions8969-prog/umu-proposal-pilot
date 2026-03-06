/**
 * Version管理モジュール
 * 修正履歴を管理し、前の案に戻す機能を提供
 */

import type { GeneratedProposal } from "@/types";

const STORAGE_KEY = "umu_proposal_versions";
const MAX_VERSIONS = 20;

export interface VersionEntry {
  id: string;
  timestamp: string;
  label: string;
  proposal: GeneratedProposal;
  command?: string;
}

export function saveVersion(proposal: GeneratedProposal, command?: string): void {
  if (typeof window === "undefined") return;

  const versions = getVersions();
  const label = command
    ? `修正: ${command.slice(0, 30)}${command.length > 30 ? "..." : ""}`
    : `初回生成: ${proposal.hearingData.companyName}`;

  const entry: VersionEntry = {
    id: proposal.id,
    timestamp: proposal.timestamp,
    label,
    proposal,
    command,
  };

  versions.unshift(entry);

  // Keep only last MAX_VERSIONS
  if (versions.length > MAX_VERSIONS) {
    versions.splice(MAX_VERSIONS);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
}

export function getVersions(): VersionEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getVersion(id: string): VersionEntry | undefined {
  return getVersions().find((v) => v.id === id);
}

export function clearVersions(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function formatVersionTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
