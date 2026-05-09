"use client";

import type { ResourceStatus, StationStatus, ZoneStatus } from "@/types";

type AnyStatus = ResourceStatus | StationStatus | ZoneStatus | string;

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  STABLE: {
    label: "STABLE",
    classes: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
  },
  WARNING: {
    label: "WARNING",
    classes: "bg-amber-500/10 text-amber-300 border border-amber-500/30"
  },
  CRITICAL: {
    label: "CRITICAL",
    classes: "bg-alert-500/10 text-alert-400 border border-alert-500/30"
  },
  OFFLINE: {
    label: "OFFLINE",
    classes: "bg-slate-500/10 text-slate-300 border border-slate-500/30"
  },
  IN_TRANSIT: {
    label: "IN TRANSIT",
    classes: "bg-brand-blue/10 text-brand-blue border border-brand-blue/30"
  },
  DELIVERED: {
    label: "DELIVERED",
    classes: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
  },
  PENDING: {
    label: "PENDING",
    classes: "bg-amber-500/10 text-amber-300 border border-amber-500/30"
  },
  CANCELLED: {
    label: "CANCELLED",
    classes: "bg-slate-500/10 text-slate-300 border border-slate-500/30"
  }
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    classes: "bg-slate-500/10 text-slate-200 border border-slate-500/30"
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] tracking-widest font-semibold ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}

