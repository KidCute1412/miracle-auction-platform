import { useNavigate } from "react-router-dom";
import { categoryService } from "@/services/category.service";
import TinyMCEEditor from "@/components/editor/TinyMCEEditor";
import JustValidate from "just-validate";
import { useEffect, useMemo, useRef, useState } from "react";
import { slugify } from "@/utils/make_slug";
import { useBuildTree } from "@/hooks/useCategory";
import { toast } from "sonner";
import { ChevronDown, Check } from "lucide-react";

type FlatOption = {
  id: number;
  label: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (val: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
  name: string;
};

function CustomSelect({ value, onChange, options, placeholder, name }: CustomSelectProps) {
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

  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-foreground shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200 cursor-pointer h-10"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-lg py-1">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-muted text-foreground transition-colors duration-150 cursor-pointer"
            >
              <span className="truncate pr-4">{opt.label}</span>
              {value === opt.id && <Check className="h-4 w-4 text-accent shrink-0" />}
            </button>
          ))}
        </div>
      )}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

export default function CategoryCreate() {
  const editorRef = useRef(null);
  const { tree } = useBuildTree();
  const navigate = useNavigate();
  const [parentVal, setParentVal] = useState<string>("none");
  const [statusVal, setStatusVal] = useState<string>("active");

  const options: FlatOption[] = useMemo(() => {
    if (!tree) return [];
    // Only show top-level categories as parents
    return tree.map((node: any) => ({ id: node.id, label: node.name }));
  }, [tree]);

  const selectOptions = useMemo(() => {
    const list = options.map(opt => ({ id: opt.id.toString(), label: opt.label }));
    return [{ id: "none", label: "None" }, ...list];
  }, [options]);

  const statusOptions = [
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
  ];

  useEffect(() => {
    const validate = new JustValidate("#CategoryCreateForm");
    validate
      .addField(
        "#name",
        [{ rule: "required", errorMessage: "Please enter a category name!" }],
        { errorContainer: "#nameError" }
      )
      .onSuccess((event: any) => {
        const name = event.target.name.value;
        const status = event.target.status.value;
        const parentValue = event.target.parent.value as string;
        const parent_id = parentValue === "" || parentValue === "none" ? null : Number(parentValue);
        let description;
        if (editorRef.current) {
          description = (editorRef.current as any).getContent();
        }

        const slug = slugify(name);
        const dataFinal = {
          name: name,
          status: status,
          description: description,
          parent_id: parent_id,
          slug: slug,
        };

        // Submit request to create a new category
        categoryService
          .create(dataFinal)
          .then((data) => {
            if (data.code === "error") {
              toast.error(data.message);
            }
            if (data.code === "success") {
              toast.success(data.message);
              navigate(`/${import.meta.env.VITE_PATH_ADMIN}/category/list`);
            }
          })
          .catch((error) => {
            toast.error(error.message || "Failed to create category");
          });
      });
  }, [navigate]);

  const value = "";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 text-foreground">
      <form
        id="CategoryCreateForm"
        className="w-full max-w-5xl mx-auto space-y-4"
      >
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Create Category</h2>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-colors duration-300">
          <div className="space-y-4">
            {/* Category Name & Parent selection inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <label
                  htmlFor="name"
                  className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Category Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200"
                  placeholder="Enter category name"
                />
                <div
                  id="nameError"
                  className="text-xs text-destructive mt-0.5 min-h-[16px] font-medium"
                ></div>
              </div>

              <div className="w-full">
                <label
                  htmlFor="parent"
                  className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Parent Category
                </label>
                <CustomSelect
                  name="parent"
                  value={parentVal}
                  onChange={setParentVal}
                  options={selectOptions}
                  placeholder="-- Select parent category --"
                />
              </div>
            </div>

            {/* Status configuration select */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <label
                  htmlFor="status"
                  className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Status
                </label>
                <CustomSelect
                  name="status"
                  value={statusVal}
                  onChange={setStatusVal}
                  options={statusOptions}
                  placeholder="Select status"
                />
              </div>
            </div>

            {/* Description Editor area */}
            <div className="w-full">
              <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Description
              </label>
              <div className="w-full">
                <TinyMCEEditor editorRef={editorRef} value={value} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="submit"
                className="cursor-pointer w-full sm:w-auto rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
              >
                Create Category
              </button>

              <button
                type="button"
                className="cursor-pointer w-full sm:w-auto text-sm font-semibold text-accent hover:underline transition-colors py-2"
                onClick={() => {
                  navigate(`/${import.meta.env.VITE_PATH_ADMIN}/category/list`);
                }}
              >
                Back to list
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
