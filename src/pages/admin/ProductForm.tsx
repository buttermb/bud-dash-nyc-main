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
  useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id || mode === "new") return null;
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      if (isDuplicate) {
        setFormData({ ...data, name: `${data.name} (Copy)`, id: undefined });
      } else {
        setFormData(data);
      }
      
      return data;
    },
    enabled: !!id && mode !== "new",
  });

  const saveProduct = useMutation({
    mutationFn: async (data: any) => {
      // Sanitize and format data before saving
      const sanitizedData = {
        name: data.name || "",
        category: data.category || "",
        strain_type: data.strain_type || null,
        thca_percentage: parseFloat(data.thca_percentage) || 0,
        cbd_content: data.cbd_content ? parseFloat(data.cbd_content) : null,
        description: data.description || null,
        price: parseFloat(data.price) || 0,
        sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
        weight_grams: data.weight_grams ? parseFloat(data.weight_grams) : null,
        vendor_name: data.vendor_name || null,
        in_stock: data.in_stock !== undefined ? data.in_stock : true,
        stock_quantity: data.stock_quantity ? parseInt(data.stock_quantity) : 0,
        image_url: data.image_url || null,
        images: Array.isArray(data.images) ? data.images : [],
        coa_url: data.coa_url || null,
        effects: Array.isArray(data.effects) ? data.effects : [],
        flavors: Array.isArray(data.flavors) ? data.flavors : [],
        prices: data.prices && typeof data.prices === 'object' ? data.prices : {},
        strain_info: data.strain_info || null,
        usage_tips: data.usage_tips || null,
        lab_name: data.lab_name || null,
        test_date: data.test_date || null,
        batch_number: data.batch_number || null,
        cost_per_unit: data.cost_per_unit ? parseFloat(data.cost_per_unit) : 0,
      };

      // Remove any undefined values
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined) {
          delete sanitizedData[key];
        }
      });

      if (isEdit && id) {
        const { error } = await supabase
          .from("products")
          .update(sanitizedData)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert([sanitizedData]);
        if (error) throw error;
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
    onError: (error) => {
      console.error("Save error:", error);
      toast({
        title: "Error saving product",
        description: error.message || "Please check all required fields and try again",
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
    if (!formData.name || !formData.category || !formData.thca_percentage) {
      toast({
        title: "Missing required fields",
        description: "Please fill in Product Name, Category, and THCA Percentage",
        variant: "destructive",
      });
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
