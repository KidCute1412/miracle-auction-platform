import { useEffect, useRef, useState, useMemo } from "react";
import { Filter, RotateCcw, Search, Trash2, ChevronDown, Check } from "lucide-react";

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
};

function FilterSelect({ value, onChange, options, placeholder }: FilterSelectProps) {
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
    <div className="relative h-full flex items-center border-r border-border" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full flex items-center gap-2 px-4 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors cursor-pointer outline-none border-none select-none"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[150px] overflow-y-auto rounded-lg border border-border bg-card shadow-lg py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-muted text-foreground transition-colors duration-150 cursor-pointer"
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
    <div className="relative h-full flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full flex items-center justify-between gap-4 px-3 text-sm text-foreground bg-transparent outline-none border-none cursor-pointer select-none"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-1 min-w-[150px] overflow-y-auto rounded-lg border border-border bg-card shadow-lg py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-muted text-foreground transition-colors duration-150 cursor-pointer"
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
  createLabel = "+ Create New",

  onTrashClick,
  trashLabel = "Trash",
}: Props) {
  // Setup active status filters
  const effectiveStatusOptions: StatusOption[] = statusOptions ?? [
    { value: "all", label: "Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Setup bulk data modify options
  const effectiveBulkActions: BulkActionOption[] = bulkActionOptions ?? [
    { value: "hide", label: "Hide" },
    { value: "delete", label: "Delete" },
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
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom || "");
  const [localDateTo, setLocalDateTo] = useState(dateTo || "");

  useEffect(() => {
    setLocalDateFrom(dateFrom || "");
  }, [dateFrom]);

  useEffect(() => {
    setLocalDateTo(dateTo || "");
  }, [dateTo]);

  const handleApplyClick = () => {
    if (!onApplyBulkAction) return;
    if (!selectedAction) return;
    onApplyBulkAction(selectedAction);
  };

  const creatorOptionsList = useMemo(() => {
    return creatorOptions.map((c) => ({ value: c, label: c }));
  }, [creatorOptions]);

  return (
    <div className="mb-7 space-y-6 text-foreground">
      {/* Top section holding all structured filters */}
      {hasTopFilters && (
        <div className="flex h-14 items-stretch rounded-xl border border-border bg-card shadow-sm text-sm w-fit transition-colors duration-300">
          {/* Section banner */}
          <div className="flex h-full items-center gap-2 px-4 border-r border-border font-medium text-foreground rounded-l-xl">
            <Filter className="w-4 h-4 text-accent" />
            <span>Filters</span>
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
              options={[{ value: "", label: "Creator" }, ...creatorOptionsList]}
              placeholder="Creator"
            />
          )}

          {/* Date range filter component */}
          {hasDateFilter && (
            <div className="flex h-full items-center gap-3 px-4 border-r border-border">
              <input
                type="date"
                className="h-8 rounded-lg px-2 text-sm border border-border bg-muted/30 text-foreground outline-none"
                value={localDateFrom}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalDateFrom(val);
                  if (val.length === 10 || val === "") {
                    setDateFrom!(val);
                  }
                }}
                onBlur={() => {
                  if (localDateFrom !== dateFrom) {
                    setDateFrom!(localDateFrom);
                  }
                }}
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="date"
                className="h-8 rounded-lg px-2 text-sm border border-border bg-muted/30 text-foreground outline-none"
                value={localDateTo}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalDateTo(val);
                  if (val.length === 10 || val === "") {
                    setDateTo!(val);
                  }
                }}
                onBlur={() => {
                  if (localDateTo !== dateTo) {
                    setDateTo!(localDateTo);
                  }
                }}
              />
            </div>
          )}

          {/* Reset filter configurations */}
          {hasResetButton && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-2 px-4 h-full text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom control row holding bulk action inputs and creation links */}
      <div className="flex h-12 items-stretch gap-3">
        {/* Bulk Action selector */}
        {hasBulkAction && (
          <div className="flex rounded-xl bg-card border border-border shadow-sm transition-colors duration-300">
            <BulkSelect
              value={selectedAction}
              onChange={setSelectedAction}
              options={effectiveBulkActions}
              placeholder="-- Actions --"
            />

            <button
              type="button"
              className="cursor-pointer h-full px-4 text-sm font-semibold text-destructive hover:bg-muted/30 border-l border-border transition-colors"
              onClick={handleApplyClick}
            >
              Apply
            </button>
          </div>
        )}

        {/* Global search entry textfield */}
        {hasSearch && (
          <div className="flex items-center space-x-2 h-full w-[400px] rounded-xl border border-border bg-card px-4 shadow-sm transition-colors duration-300">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search (press Enter to apply)"
              className="flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
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
          </div>
        )}

        {/* Standard create new trigger */}
        {onCreateNew && (
          <button
            type="button"
            className="h-full px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-sm cursor-pointer"
            onClick={onCreateNew}
          >
            {createLabel}
          </button>
        )}

        {/* Trash drawer selector trigger */}
        {onTrashClick && (
          <button
            type="button"
            className="h-full px-4 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-sm cursor-pointer flex items-center gap-2"
            onClick={onTrashClick}
          >
            <Trash2 size={15} />
            <span className="hidden sm:inline">{trashLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
