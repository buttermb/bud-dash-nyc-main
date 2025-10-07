import { useState } from "react";
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
  const [formData, setFormData] = useState<any>({
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
  });

  const isEdit = action === "edit";
  const isDuplicate = action === "duplicate";
  const mode = isEdit ? "edit" : isDuplicate ? "duplicate" : "new";

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
      if (isEdit && id) {
        const { error } = await supabase
          .from("products")
          .update(data)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({
        title: isEdit ? "Product updated" : "Product created",
        description: "Your changes have been saved successfully",
      });
      navigate("/admin/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
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
    saveProduct.mutate({ ...formData, in_stock: false });
  };

  const handlePublish = () => {
    saveProduct.mutate({ ...formData, in_stock: true });
  };

  const updateFormData = (updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
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
        <Button onClick={handleSaveDraft} variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save Draft
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
          disabled={currentStep === 1}
        >
          ← Back
        </Button>
        <div className="flex gap-2">
          {currentStep === STEPS.length ? (
            <>
              <Button onClick={handleSaveDraft} variant="outline">
                Save as Draft
              </Button>
              <Button onClick={handlePublish}>
                Publish Product
              </Button>
            </>
          ) : (
            <Button onClick={handleNext}>
              Next: {STEPS[currentStep]?.name} →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
