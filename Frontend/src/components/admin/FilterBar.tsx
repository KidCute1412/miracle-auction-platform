import { useEffect, useRef, useState, useMemo } from "react";
import { Filter, RotateCcw, Search, Trash2, ChevronDown, Check, Calendar, Plus, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type StatusOption = {
  value: string;
  label: string;
};

type BulkActionOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  icon?: React.ReactNode;
};

function FilterSelect({ value, onChange, options, placeholder, icon }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const isFiltered = value && value !== "" && value !== "all";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 flex items-center gap-2 px-3.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border select-none ${
          isFiltered
            ? "bg-accent/10 border-accent/40 text-accent font-semibold shadow-xs"
            : "bg-muted/30 border-border/80 text-foreground hover:bg-muted/70 hover:border-border"
        }`}
      >
        {icon && <span className="opacity-70">{icon}</span>}
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className="h-3.5 w-3.5 opacity-60 transition-transform duration-200 ml-1"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 min-w-[170px] overflow-hidden rounded-xl border border-border bg-popover shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40">
            Select {placeholder}
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-sm text-left transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-accent/15 text-accent font-medium"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-accent shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
}

function formatDateString(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  const d = parseDateString(dateStr);
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type CustomDatePickerProps = {
  value: string;
  onChange: (dateStr: string) => void;
  placeholder: string;
};

function CustomDatePicker({ value, onChange, placeholder }: CustomDatePickerProps) {
  const dateValue = useMemo(() => parseDateString(value), [value]);

  return (
    <div className="relative inline-block">
      <DatePicker
        selected={dateValue}
        onChange={(d: Date | null) => {
          onChange(formatDateString(d));
        }}
        dateFormat="MMM d, yyyy"
        placeholderText={placeholder}
        customInput={
          <button
            type="button"
            className={`h-10 flex items-center gap-2 px-3 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer select-none ${
              value
                ? "bg-accent/10 border-accent/40 text-accent font-semibold shadow-xs"
                : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 opacity-70 shrink-0" />
            <span>{value ? formatDisplayDate(value) : placeholder}</span>
            {value && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="hover:bg-accent/20 rounded-md p-0.5 ml-0.5 transition-colors"
                title="Clear date"
              >
                <X className="w-3 h-3" />
              </span>
            )}
          </button>
        }
        popperClassName="z-[10000]"
        popperPlacement="bottom-start"
      />
    </div>
  );
}

function BulkSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-full flex items-center justify-between gap-2 px-3.5 text-sm text-foreground bg-transparent outline-none border-none cursor-pointer select-none font-medium"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 shrink-0"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-[150px] overflow-hidden rounded-xl border border-border bg-popover shadow-xl py-1 animate-in fade-in duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-muted text-foreground transition-colors duration-150 cursor-pointer"
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check className="h-4 w-4 text-accent shrink-0 ml-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type Props = {
  showStatusFilter?: boolean;
  statusFilter?: string;
  setStatusFilter?: (v: string) => void;
  statusOptions?: StatusOption[];

  // Creator identity filtering properties
  creatorFilter?: string;
  setCreatorFilter?: (v: string) => void;
  creatorOptions?: string[];

  // Date filtering constraints
  dateFrom?: string;
  setDateFrom?: (v: string) => void;
  dateTo?: string;
  setDateTo?: (v: string) => void;

  // Search input and handlers
  search?: string;
  setSearch?: (v: string) => void;
  onSearchSubmit?: () => void;

  // Form controls and submit actions
  onResetFilters?: () => void;

  bulkActionOptions?: BulkActionOption[];
  onApplyBulkAction?: (action: string) => void;

  onCreateNew?: () => void;
  createLabel?: string;

  onTrashClick?: () => void;
  trashLabel?: string;
};

export default function FilterBar({
  showStatusFilter = true,
  statusFilter,
  setStatusFilter,
  statusOptions,

  creatorFilter,
  setCreatorFilter,
  creatorOptions = [],

  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,

  search,
  setSearch,
  onSearchSubmit,

  onResetFilters,
  bulkActionOptions,
  onApplyBulkAction,

  onCreateNew,
  createLabel = "Create New",

  onTrashClick,
  trashLabel = "Trash Bin",
}: Props) {
  // Setup active status filters
  const effectiveStatusOptions: StatusOption[] = statusOptions ?? [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Setup bulk data modify options
  const effectiveBulkActions: BulkActionOption[] = bulkActionOptions ?? [
    { value: "hide", label: "Hide Selected" },
    { value: "delete", label: "Delete Selected" },
  ];

  const hasStatusFilter =
    showStatusFilter && statusFilter !== undefined && !!setStatusFilter;

  const hasCreatorFilter =
    creatorFilter !== undefined &&
    !!setCreatorFilter &&
    creatorOptions.length > 0;

  const hasDateFilter =
    dateFrom !== undefined &&
    dateTo !== undefined &&
    !!setDateFrom &&
    !!setDateTo;

  const hasResetButton = !!onResetFilters;

  const hasTopFilters =
    hasStatusFilter || hasCreatorFilter || hasDateFilter || hasResetButton;

  const hasSearch = search !== undefined && !!setSearch;

  const hasBulkAction = !!onApplyBulkAction && !!effectiveBulkActions.length;

  const [selectedAction, setSelectedAction] = useState<string>("");
  const [isComposing, setIsComposing] = useState(false);

  const handleApplyClick = () => {
    if (!onApplyBulkAction) return;
    if (!selectedAction) return;
    onApplyBulkAction(selectedAction);
  };

  const creatorOptionsList = useMemo(() => {
    return creatorOptions.map((c) => ({ value: c, label: c }));
  }, [creatorOptions]);

  const isFilterActive =
    (statusFilter && statusFilter !== "all" && statusFilter !== "") ||
    (creatorFilter && creatorFilter !== "") ||
    (dateFrom && dateFrom !== "") ||
    (dateTo && dateTo !== "");

  return (
    <div className="space-y-4 text-foreground">
      {/* Top Filter Bar Row */}
      {hasTopFilters && (
        <div className="flex flex-wrap items-center gap-2.5 bg-card/80 border border-border/80 p-2.5 rounded-2xl shadow-xs transition-colors duration-300">
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-r border-border/60">
            <Filter className="w-3.5 h-3.5 text-accent" />
            <span>Catalog Filters</span>
          </div>

          {/* Status selector filter */}
          {hasStatusFilter && (
            <FilterSelect
              value={statusFilter!}
              onChange={setStatusFilter!}
              options={effectiveStatusOptions}
              placeholder="Status"
            />
          )}

          {/* Creator selector filter */}
          {hasCreatorFilter && (
            <FilterSelect
              value={creatorFilter!}
              onChange={setCreatorFilter!}
              options={[{ value: "", label: "All Creators" }, ...creatorOptionsList]}
              placeholder="Creator"
            />
          )}

          {/* Custom Date Range Filter Selectors */}
          {hasDateFilter && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-muted/20 border border-border/60 rounded-xl">
              <CustomDatePicker
                value={dateFrom || ""}
                onChange={(val) => setDateFrom!(val)}
                placeholder="From Date"
              />
              <span className="text-xs text-muted-foreground font-medium">to</span>
              <CustomDatePicker
                value={dateTo || ""}
                onChange={(val) => setDateTo!(val)}
                placeholder="To Date"
              />
            </div>
          )}

          {/* Reset filter configurations */}
          {hasResetButton && isFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 h-10 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 transition-all cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom Control Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Global search entry textfield */}
          {hasSearch && (
            <div className="relative flex items-center h-11 min-w-[280px] max-w-[440px] flex-1 rounded-xl border border-border/80 bg-card px-3.5 shadow-xs focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent/50 transition-all">
              <Search className="w-4 h-4 text-muted-foreground mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Search catalog entries..."
                className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                value={search}
                onChange={(e) => {
                  if (!isComposing) {
                    setSearch!(e.target.value);
                  }
                }}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(e) => {
                  setIsComposing(false);
                  setSearch!((e.target as HTMLInputElement).value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isComposing && onSearchSubmit) {
                    onSearchSubmit();
                  }
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch!("");
                    if (onSearchSubmit) onSearchSubmit();
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/60 rounded-md">
                ↵
              </kbd>
            </div>
          )}

          {/* Bulk Action selector */}
          {hasBulkAction && (
            <div className="flex h-11 rounded-xl bg-card border border-border/80 shadow-xs overflow-hidden transition-colors">
              <BulkSelect
                value={selectedAction}
                onChange={setSelectedAction}
                options={effectiveBulkActions}
                placeholder="Bulk Actions"
              />

              <button
                type="button"
                className="cursor-pointer h-full px-4 text-xs font-semibold text-primary hover:bg-primary/10 border-l border-border/80 transition-colors"
                onClick={handleApplyClick}
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Action Triggers (Create / Trash) */}
        <div className="flex items-center gap-2.5">
          {/* Trash drawer selector trigger */}
          {onTrashClick && (
            <button
              type="button"
              className="h-11 px-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-semibold hover:bg-destructive/20 transition-all cursor-pointer flex items-center gap-2"
              onClick={onTrashClick}
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">{trashLabel}</span>
            </button>
          )}

          {/* Standard create new trigger */}
          {onCreateNew && (
            <button
              type="button"
              className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-xs cursor-pointer flex items-center gap-2"
              onClick={onCreateNew}
            >
              <Plus size={16} />
              <span>{createLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
