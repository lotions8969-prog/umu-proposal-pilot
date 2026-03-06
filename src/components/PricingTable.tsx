"use client";

import { useState } from "react";
import { Package, Tag, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import type { PricingDetail } from "@/types";
import {
  formatCurrency,
  PRICING_CONFIG,
  calculatePricing,
  getDefaultOptions,
} from "@/lib/pricing";

interface PricingTableProps {
  pricing: PricingDetail;
  planColor: string;
  onUpdate?: (updatedPricing: PricingDetail) => void;
}

export default function PricingTable({ pricing, planColor, onUpdate }: PricingTableProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [editableIDCount, setEditableIDCount] = useState(pricing.idCount);
  const [editableMonths, setEditableMonths] = useState(pricing.contractMonths);
  const [editableOptions, setEditableOptions] = useState<string[]>(pricing.selectedOptions);

  const textColor = { purple: "text-purple-400", blue: "text-blue-400", green: "text-green-400" }[planColor] || "text-blue-400";
  const borderColor = { purple: "border-purple-500/30", blue: "border-blue-500/30", green: "border-green-500/30" }[planColor] || "border-blue-500/30";
  const bgColor = { purple: "bg-purple-500/10", blue: "bg-blue-500/10", green: "bg-green-500/10" }[planColor] || "bg-blue-500/10";

  const recalculate = (idCount: number, months: number, options: string[]) => {
    const result = calculatePricing({
      planType: pricing.planType,
      idCount,
      contractMonths: months,
      selectedOptions: options,
    });
    if (onUpdate) {
      onUpdate({
        ...pricing,
        idCount,
        contractMonths: months,
        selectedOptions: options,
        ...result,
      });
    }
  };

  const handleIDCountChange = (val: number) => {
    setEditableIDCount(val);
    recalculate(val, editableMonths, editableOptions);
  };

  const handleMonthsChange = (val: number) => {
    setEditableMonths(val);
    recalculate(editableIDCount, val, editableOptions);
  };

  const toggleOption = (key: string) => {
    const newOptions = editableOptions.includes(key)
      ? editableOptions.filter((o) => o !== key)
      : [...editableOptions, key];
    setEditableOptions(newOptions);
    recalculate(editableIDCount, editableMonths, newOptions);
  };

  // Use editable values for display
  const displayPricing = calculatePricing({
    planType: pricing.planType,
    idCount: editableIDCount,
    contractMonths: editableMonths,
    selectedOptions: editableOptions,
  });

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Calculator size={14} className={textColor} />
        見積もり（リアルタイム計算）
      </h3>

      {/* Main price highlight */}
      <div className={`rounded-xl p-4 border ${borderColor} ${bgColor}`}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">月額費用（税抜）</p>
            <p className={`text-3xl font-black ${textColor}`}>
              {formatCurrency(displayPricing.monthlyTotal)}
            </p>
            <p className="text-xs text-slate-500 mt-1">/ 月</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">初期費用</p>
            <p className="text-sm font-bold text-slate-300">{formatCurrency(displayPricing.initialFee)}</p>
            <p className="text-xs text-slate-500 mt-1">{editableIDCount} ID × {formatCurrency(displayPricing.discountedUnitPrice)}</p>
          </div>
        </div>

        {displayPricing.totalDiscountRate > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Tag size={12} className="text-yellow-400" />
            <span className="text-xs text-yellow-300 font-semibold">
              合計 {Math.round(displayPricing.totalDiscountRate * 100)}% OFF 適用中
              {displayPricing.volumeDiscountRate > 0 && ` (ボリューム ${Math.round(displayPricing.volumeDiscountRate * 100)}%`}
              {displayPricing.contractDiscountRate > 0 && ` + 長期 ${Math.round(displayPricing.contractDiscountRate * 100)}%)`}
              {displayPricing.volumeDiscountRate > 0 && displayPricing.contractDiscountRate === 0 && ")"}
            </span>
          </div>
        )}
      </div>

      {/* Adjustable controls */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-dark p-3">
          <label className="label-dark">ID数</label>
          <input
            type="number"
            className="input-dark text-center font-bold"
            value={editableIDCount}
            min={1}
            onChange={(e) => handleIDCountChange(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="card-dark p-3">
          <label className="label-dark">契約期間（月）</label>
          <select
            className="input-dark"
            value={editableMonths}
            onChange={(e) => handleMonthsChange(parseInt(e.target.value))}
          >
            <option value={12}>12ヶ月</option>
            <option value={24}>24ヶ月</option>
            <option value={36}>36ヶ月</option>
          </select>
        </div>
      </div>

      {/* Options */}
      <div className="card-dark p-3">
        <p className="label-dark mb-2">オプション選択</p>
        <div className="grid grid-cols-1 gap-1">
          {Object.entries(PRICING_CONFIG.options).map(([key, opt]) => {
            const isSelected = editableOptions.includes(key);
            const price = opt.pricePerID > 0
              ? `+${formatCurrency(opt.pricePerID)}/ID`
              : `+${formatCurrency(opt.flatPrice)}`;
            return (
              <label
                key={key}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all
                  ${isSelected ? `${bgColor} ${borderColor} border` : "border border-transparent hover:border-slate-700"}`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOption(key)}
                    className="w-3 h-3"
                  />
                  <span className="text-xs text-slate-300">{opt.name}</span>
                </div>
                <span className={`text-xs font-semibold ${isSelected ? textColor : "text-slate-600"}`}>
                  {price}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Totals */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
      >
        <span>費用明細を{showDetails ? "閉じる" : "見る"}</span>
        {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {showDetails && (
        <div className="card-dark p-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>基本単価</span><span>{formatCurrency(displayPricing.baseUnitPrice)}/ID</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>割引後単価</span><span>{formatCurrency(displayPricing.discountedUnitPrice)}/ID</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>月額基本料（{editableIDCount} ID）</span><span>{formatCurrency(displayPricing.monthlyBase)}</span>
          </div>
          {displayPricing.optionsMonthlyCost > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>オプション月額</span><span>{formatCurrency(displayPricing.optionsMonthlyCost)}</span>
            </div>
          )}
          <div className="border-t border-slate-700 pt-2 flex justify-between text-slate-300 font-semibold">
            <span>月額合計</span><span>{formatCurrency(displayPricing.monthlyTotal)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>初期費用</span><span>{formatCurrency(displayPricing.initialFee)}</span>
          </div>
          <div className="flex justify-between text-slate-300 font-semibold">
            <span>年間総額</span><span>{formatCurrency(displayPricing.annualTotal)}</span>
          </div>
          <div className={`border-t border-slate-700 pt-2 flex justify-between font-black ${textColor}`}>
            <span>{editableMonths}ヶ月 契約総額</span>
            <span>{formatCurrency(displayPricing.totalContractValue)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
