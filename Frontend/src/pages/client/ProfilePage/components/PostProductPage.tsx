import React, { useState, useRef, useEffect } from "react";
import TinyMCEEditor from "@/components/editor/TinyMCEEditor";
import JustValidate from "just-validate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Clock, Calendar, ImageIcon } from "lucide-react";
import UploadImage from "@/components/common/UploadImage";
import SelectMenu from "@/components/common/Select";
import { usePreventBodyLock } from "@/hooks/usePreventBodyLock";
import formatToUTC from "@/utils/format_time";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { settingService } from "@/services/setting.service.ts";
import { categoryService } from "@/services/category.service.ts";
import { productService } from "@/services/product.service.ts";

type CatType = {
  id: number;
  name: string;
};

type ExtendSettingType = {
  extend_time_minutes: number;
  threshold_minutes: number;
};

function PostProductPage() {
  usePreventBodyLock();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [selectedCat1, setSelectedCat1] = useState<number>(0);
  const [selectedCat2, setSelectedCat2] = useState<number>(0);

  const [catlv1, setCatlv1] = useState<CatType[]>();
  const [catlv2, setCatlv2] = useState<CatType[]>();
  const [extendTime, setExtendTime] = useState<ExtendSettingType>();

  useEffect(() => {
    categoryService.getLevel1()
      .then((data) => {
        setCatlv1(data.data);
      });
  }, []);

  useEffect(() => {
    if (selectedCat1) {
      categoryService.getLevel2NoSlug({ cat_id: selectedCat1 })
        .then((data) => {
          setCatlv2(data.data);
        });
    } else {
      setCatlv2([]);
    }
  }, [selectedCat1]);

  useEffect(() => {
    settingService.getAutoExtendTime()
      .then((data) => {
        if (data.status === "success" && data.data) {
          setExtendTime(data.data);
        } else {
          toast.error("Failed to fetch auto-extension settings!");
        }
      });
  }, []);

  useEffect(() => {
    const cat1Input = document.getElementById("cat1_id") as HTMLInputElement;
    const cat2Input = document.getElementById("cat2_id") as HTMLInputElement;
    if (cat1Input) cat1Input.value = selectedCat1.toString();
    if (cat2Input) cat2Input.value = selectedCat2.toString();
  }, [selectedCat1, selectedCat2]);

  useEffect(() => {
    const validate = new JustValidate("#PostProductForm");
    validate.addField("#product_name", [
      {
        rule: "required",
        errorMessage: "Please enter the product name!"
      }
    ]);
    validate.addField("#start_price", [
      {
        rule: "required",
        errorMessage: "Please enter the starting price!"
      }
    ]);
    validate.addField("#step_price", [
      {
        rule: "required",
        errorMessage: "Please enter the step price!"
      }
    ]);
    validate.addField(`[name="cat1_id"]`, [
      {
        validator: () => {
          const cat1Input = document.getElementById("cat1_id") as HTMLInputElement;
          return Number(cat1Input.value) > 0;
        },
        errorMessage: "Please select a main category!"
      }
    ]);
    validate.addField(`[name="cat2_id"]`, [
      {
        validator: () => {
          const cat2Input = document.getElementById("cat2_id") as HTMLInputElement;
          return Number(cat2Input.value) > 0;
        },
        errorMessage: "Please select a subcategory!"
      }
    ]);
    validate.addField("#start_time", [
      {
        rule: "required",
        errorMessage: "Please select a start time!"
      }
    ]);
    validate.addField("#end_time", [
      {
        rule: "required",   
        errorMessage: "Please select an end time!"
      }
    ]);
    validate.addField("#product_images", [
      {
        validator: () => {
          const inputElement = document.getElementById("product_images") as HTMLInputElement;
          return inputElement.files && inputElement.files.length >= 1;
        },
        errorMessage: "Please select at least 1 image!"
      },
      {
        validator: () => {
          const inputElement = document.getElementById("product_images") as HTMLInputElement;
          return inputElement.files && inputElement.files.length >= 3;
        },
        errorMessage: "We recommend adding at least 3 images to attract buyers!"
      }
    ]);
    validate.addField("#description", [
      {
        rule: "required",
        errorMessage: "Please enter the product description!"
      }
    ])
    .onSuccess((event: any) => {
      event.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);

      const formPayLoad = new FormData();
      const form = event.target as HTMLFormElement;
      
      formPayLoad.append("product_name", form.product_name.value);
      formPayLoad.append("cat2_id", form.cat2_id.value);
      formPayLoad.append("start_price", (form.start_price.value.split(".").join("")));
      formPayLoad.append("step_price", form.step_price.value.split(".").join(""));
      formPayLoad.append("buy_now_price", form.buy_now_price.value.split(".").join(""));
      formPayLoad.append("start_time",  form.start_time.value ? formatToUTC(form.start_time.value, "datetime") : "");
      formPayLoad.append("end_time", form.end_time.value ? formatToUTC(form.end_time.value, "datetime") : "");
      formPayLoad.append("description", form.description.value);
      formPayLoad.append("auto_extended", form.auto_extended.checked ? "true" : "false");
      if (form.product_images.files) {
        for (let i = 0; i < form.product_images.files.length; i++) {
          formPayLoad.append("product_images", form.product_images.files[i]);
        }
      }

      productService.postProduct(formPayLoad)
      .then(data => {
        setIsSubmitting(false);
        if (data.status === "success") {
          toast.success("Product posted successfully!");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          toast.error(data.message || "Failed to post product!");
        }
      })
      .catch(err => {
        setIsSubmitting(false);
        console.error("Error submitting product:", err);
        toast.error("An error occurred. Please try again later.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
    });
  }, [isSubmitting]);

  const editorRef = useRef<any>(null);

  const handleStartTimeChange = (date: Date | null) => {
    setStartTime(date);
    if (date && !endTime) {
      const autoEndTime = new Date(date);
      autoEndTime.setDate(autoEndTime.getDate() + 7);
      setEndTime(autoEndTime);
    }
  };

  const handleEndTimeChange = (date: Date | null) => {
    setEndTime(date);
  };

  const handleCat1Change = (value: any) => {
    const catId = Number(value);
    setSelectedCat1(catId);
    setSelectedCat2(0);
    
    const cat1Input = document.getElementById("cat1_id") as HTMLInputElement;
    const cat2Input = document.getElementById("cat2_id") as HTMLInputElement;
    if (cat1Input) cat1Input.value = catId.toString();
    if (cat2Input) cat2Input.value = "0";
  };

  const handleCat2Change = (value: any) => {
    const catId = Number(value);
    setSelectedCat2(catId);
    
    const cat2Input = document.getElementById("cat2_id") as HTMLInputElement;
    if (cat2Input) cat2Input.value = catId.toString();
  };

  const handleEditorChange = (content: string) => {
    const description = document.getElementById("description") as HTMLInputElement;
    description.value = content;
  };

  const handleUploadImageChange = (images: File[]) => {
    setProductImages(images);
    const imageInput = document.getElementById("product_images") as HTMLInputElement;
    const dt = new DataTransfer();
    images.forEach(image => {
      dt.items.add(image);
    });
    imageInput.files = dt.files;
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <h1 className="text-3xl font-heading font-extrabold text-foreground mb-8 text-center">Post Auction Product</h1>
          
          <form className="space-y-6" id="PostProductForm">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="product_name"
                id="product_name"
                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Enter product name..."
                required
              />
            </div>

            {/* Product Images */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-3 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-accent" />
                Product Images <span className="text-red-500 ml-1">*</span>
              </label>
              <p className="text-sm text-muted-foreground mb-4">
                Add images to attract buyers. The first image will be used as the thumbnail.
              </p>
              <UploadImage
                images={productImages}
                onImagesChange={handleUploadImageChange}
                maxFiles={10}
              />
              <input type="file" id="product_images" name="product_images" className="hidden" />
            </div>
            
            {/* Price Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Starting Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <NumericFormat
                    thousandSeparator=","
                    decimalSeparator="."
                    name="start_price"
                    id="start_price"
                    className="w-full px-4 py-2 pr-12 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">VND</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Step Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <NumericFormat
                    thousandSeparator=","
                    decimalSeparator="."
                    name="step_price"
                    id="step_price"
                    className="w-full px-4 py-2 pr-12 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">VND</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Buy Now Price (Optional)
                </label>
                <div className="relative">
                  <NumericFormat
                    thousandSeparator=","
                    decimalSeparator="."
                    name="buy_now_price"
                    id="buy_now_price"
                    className="w-full px-4 py-2 pr-12 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">VND</span>
                </div>
              </div>
            </div>

            {/* Time Settings */}
            <div className="mb-2">
              <p className="text-sm text-muted-foreground flex items-center">
                <Clock className="w-4 h-4 mr-1 text-accent" />
                Select date and time for the auction. End time will auto-set to 7 days if left blank.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4 mr-1 text-accent" />
                  Start Time <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <DatePicker
                    id="start_time"
                    name="start_time"
                    selected={startTime}
                    onChange={handleStartTimeChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Hour"
                    dateFormat="dd/MM/yyyy HH:mm"
                    placeholderText="Select start date and time"
                    className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                    minDate={new Date()}
                    required
                    withPortal
                    portalId="start-time-portal"
                    popperProps={{
                      strategy: "fixed",
                      placement: "bottom-start"
                    }}
                    popperClassName="z-[10000]"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-100 text-muted-foreground/50" />
                </div>
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4 mr-1 text-accent" />
                  End Time <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <DatePicker
                    id="end_time"
                    name="end_time"
                    selected={endTime}
                    onChange={handleEndTimeChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Hour"
                    dateFormat="dd/MM/yyyy HH:mm"
                    placeholderText="Select end date and time"
                    className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                    minDate={startTime || new Date()}
                    required
                    withPortal
                    portalId="end-time-portal"
                    popperProps={{
                      strategy: "fixed",
                      placement: "bottom-start"
                    }}
                    popperClassName="z-[10000]"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Main Category <span className="text-red-500">*</span>
                </label>
                <SelectMenu
                  value={selectedCat1}
                  setState={handleCat1Change}
                  items={catlv1?.map(cat => ({ value: cat.id, content: cat.name })) || []}
                  placeholder="Select main category"
                />
                <input type="hidden" name="cat1_id" id="cat1_id" value={selectedCat1} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <SelectMenu
                  value={selectedCat2}
                  setState={handleCat2Change}
                  items={catlv2?.map(cat => ({ value: cat.id, content: cat.name })) || []}
                  placeholder={selectedCat1 ? "Select subcategory" : "Select main category first"}
                  disabled={!selectedCat1}
                />
                <input type="hidden" name="cat2_id" id="cat2_id" value={selectedCat2} />
              </div>
            </div>

            {/* Description */}
            <div className="text-xl font-bold text-foreground">Product Description <span className="text-red-500">*</span></div>
            <TinyMCEEditor editorRef={editorRef} onEditChange={handleEditorChange} />
            <input type="hidden" name="description" id="description" />

            {/* Auto Extend Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="auto_extended"
                className="w-4 h-4 text-accent bg-card border-border rounded focus:ring-accent"
                id="autoExtend"
              />
              <label htmlFor="autoExtend" className="ml-2 text-sm font-medium text-muted-foreground">
                Auto extend auction by <span className="font-bold underline text-foreground">{extendTime?.extend_time_minutes}</span> minutes when a bid is placed in the final <span className="font-bold underline text-foreground">{extendTime?.threshold_minutes}</span> minutes
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className={`bg-accent hover:bg-accent/90 transition-all duration-300 text-white font-semibold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer ${isSubmitting ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
              >
                Post Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostProductPage;
