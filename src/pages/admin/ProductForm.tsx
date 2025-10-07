import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BasicInfoStep } from "@/components/admin/product-form/BasicInfoStep";
import { ImagesStep } from "@/components/admin/product-form/ImagesStep";
import { DetailsStep } from "@/components/admin/product-form/DetailsStep";
import { PricingStep } from "@/components/admin/product-form/PricingStep";
import { ComplianceStep } from "@/components/admin/product-form/ComplianceStep";
import { ReviewStep } from "@/components/admin/product-form/ReviewStep";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { id: 1, name: "Basic Info", component: BasicInfoStep },
  { id: 2, name: "Images", component: ImagesStep },
  { id: 3, name: "Details", component: DetailsStep },
  { id: 4, name: "Pricing", component: PricingStep },
  { id: 5, name: "Compliance", component: ComplianceStep },
  { id: 6, name: "Review", component: ReviewStep },
];

export default function ProductForm() {
  const { id, action } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Get storage key for this specific form instance
  const storageKey = `product-form-${action || 'new'}-${id || 'draft'}`;
  
  // Initialize form data from localStorage or defaults
  const [formData, setFormData] = useState<any>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
    return {
      name: "",
      category: "",
      strain_type: "",
      thca_percentage: "",
      cbd_content: "",
      description: "",
      price: "",
      prices: {},
      in_stock: true,
      image_url: "",
      images: [],
      coa_url: "",
      effects: [],
      flavors: [],
      terpenes: [],
    };
  });

  const isEdit = action === "edit";
  const isDuplicate = action === "duplicate";
  const mode = isEdit ? "edit" : isDuplicate ? "duplicate" : "new";

  // Auto-save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData, storageKey]);

  // Load existing product data
  const { isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id || mode === "new") return null;
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) {
        console.error("Error loading product:", error);
        throw error;
      }
      
      if (!data) {
        toast({
          title: "Product not found",
          description: "The product you're trying to edit doesn't exist",
          variant: "destructive",
        });
        navigate("/admin/products");
        return null;
      }
      
      // Parse strain_info if it's a string
      let parsedStrainInfo: any = data.strain_info;
      if (typeof data.strain_info === 'string') {
        try {
          parsedStrainInfo = JSON.parse(data.strain_info);
        } catch (e) {
          parsedStrainInfo = { description: data.strain_info };
        }
      } else if (!parsedStrainInfo) {
        parsedStrainInfo = {};
      }
      
      const loadedData = {
        ...data,
        strain_info: parsedStrainInfo,
        effects: Array.isArray(data.effects) ? data.effects : [],
        images: Array.isArray(data.images) ? data.images : [],
        prices: data.prices || {},
        flavors: [], // Not in DB, keeping for UI state
      };
      
      if (isDuplicate) {
        setFormData({ ...loadedData, name: `${loadedData.name} (Copy)`, id: undefined });
      } else {
        setFormData(loadedData);
      }
      
      return data;
    },
    enabled: !!id && mode !== "new",
  });

  const saveProduct = useMutation({
    mutationFn: async (data: any) => {
      console.log("Saving product with data:", data);
      
      // Sanitize and format data before saving
      const sanitizedData: any = {
        name: data.name?.trim() || "",
        category: data.category || "",
        thca_percentage: data.thca_percentage ? parseFloat(data.thca_percentage) : 0,
        price: data.price ? parseFloat(data.price) : 0,
        in_stock: data.in_stock !== undefined ? data.in_stock : true,
      };

      // Optional fields
      if (data.strain_type) sanitizedData.strain_type = data.strain_type.trim();
      if (data.cbd_content) sanitizedData.cbd_content = parseFloat(data.cbd_content);
      if (data.description) sanitizedData.description = data.description.trim();
      if (data.weight_grams) sanitizedData.weight_grams = parseFloat(data.weight_grams);
      if (data.vendor_name) sanitizedData.vendor_name = data.vendor_name.trim();
      if (data.image_url) sanitizedData.image_url = data.image_url.trim();
      if (data.coa_url) sanitizedData.coa_url = data.coa_url.trim();
      if (data.usage_tips) sanitizedData.usage_tips = data.usage_tips.trim();
      if (data.lab_name) sanitizedData.lab_name = data.lab_name.trim();
      if (data.batch_number) sanitizedData.batch_number = data.batch_number.trim();
      if (data.test_date) sanitizedData.test_date = data.test_date;
      if (data.sale_price) sanitizedData.sale_price = parseFloat(data.sale_price);
      if (data.cost_per_unit) sanitizedData.cost_per_unit = parseFloat(data.cost_per_unit);
      if (data.stock_quantity) sanitizedData.stock_quantity = parseInt(data.stock_quantity);
      
      // Arrays
      if (Array.isArray(data.images) && data.images.length > 0) {
        sanitizedData.images = data.images;
      }
      if (Array.isArray(data.effects) && data.effects.length > 0) {
        sanitizedData.effects = data.effects;
      }
      
      // JSONB fields
      if (data.prices && typeof data.prices === 'object' && Object.keys(data.prices).length > 0) {
        sanitizedData.prices = data.prices;
      }
      
      // Convert strain_info to string if it's an object
      if (data.strain_info) {
        if (typeof data.strain_info === 'object') {
          sanitizedData.strain_info = JSON.stringify(data.strain_info);
        } else {
          sanitizedData.strain_info = data.strain_info;
        }
      }

      console.log("Sanitized data:", sanitizedData);

      if (isEdit && id) {
        const { data: result, error } = await supabase
          .from("products")
          .update(sanitizedData)
          .eq("id", id)
          .select()
          .single();
        
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        return result;
      } else {
        const { data: result, error } = await supabase
          .from("products")
          .insert([sanitizedData])
          .select()
          .single();
        
        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        return result;
      }
    },
    onSuccess: () => {
      // Clear the saved form data after successful save
      localStorage.removeItem(storageKey);
      
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({
        title: isEdit ? "Product updated" : "Product created",
        description: "Your changes have been saved successfully",
      });
      navigate("/admin/products");
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      
      let errorMessage = "Please check all required fields and try again";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.code === "23502") {
        errorMessage = "Missing required fields. Please fill in Product Name, Category, THCA %, and Price.";
      }
      
      toast({
        title: "Error saving product",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    // Validate at least name is present for draft
    if (!formData.name) {
      toast({
        title: "Product name required",
        description: "Please enter a product name before saving",
        variant: "destructive",
      });
      return;
    }
    
    saveProduct.mutate({ ...formData, in_stock: false });
  };

  const handlePublish = () => {
    // Validate required fields
    if (!formData.name?.trim()) {
      toast({
        title: "Product name required",
        description: "Please enter a product name",
        variant: "destructive",
      });
      setCurrentStep(1);
      return;
    }
    
    if (!formData.category) {
      toast({
        title: "Category required",
        description: "Please select a product category",
        variant: "destructive",
      });
      setCurrentStep(1);
      return;
    }
    
    if (!formData.thca_percentage || parseFloat(formData.thca_percentage) === 0) {
      toast({
        title: "THCA percentage required",
        description: "Please enter the THCA percentage",
        variant: "destructive",
      });
      setCurrentStep(1);
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) === 0) {
      toast({
        title: "Price required",
        description: "Please enter a product price",
        variant: "destructive",
      });
      setCurrentStep(4);
      return;
    }
    
    saveProduct.mutate({ ...formData, in_stock: true });
  };

  const updateFormData = (updates: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev, ...updates };
      return newData;
    });
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/products")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Product" : isDuplicate ? "Duplicate Product" : "Add New Product"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSaveDraft} 
          variant="outline"
          disabled={saveProduct.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          {saveProduct.isPending ? "Saving..." : "Save Draft"}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`hover:text-foreground ${
                currentStep === step.id ? "font-semibold text-foreground" : ""
              }`}
            >
              {step.name}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card className="p-6">
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
        />
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          disabled={currentStep === 1 || saveProduct.isPending}
        >
          ← Back
        </Button>
        <div className="flex gap-2">
          {currentStep === STEPS.length ? (
            <>
              <Button 
                onClick={handleSaveDraft} 
                variant="outline"
                disabled={saveProduct.isPending}
              >
                {saveProduct.isPending ? "Saving..." : "Save as Draft"}
              </Button>
              <Button 
                onClick={handlePublish}
                disabled={saveProduct.isPending}
              >
                {saveProduct.isPending ? "Publishing..." : "Publish Product"}
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={saveProduct.isPending}
            >
              Next: {STEPS[currentStep]?.name} →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
