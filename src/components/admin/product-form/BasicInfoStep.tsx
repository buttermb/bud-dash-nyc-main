import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface BasicInfoStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function BasicInfoStep({ formData, updateFormData }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
        <p className="text-muted-foreground">
          Enter the essential details about your product
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Example: Purple Haze THCA Flower"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Example: "Purple Haze THCA Flower"
          </p>
        </div>

        <div>
          <Label htmlFor="strain">Strain Name *</Label>
          <Input
            id="strain"
            value={formData.strain_type || ""}
            onChange={(e) => updateFormData({ strain_type: e.target.value })}
            placeholder="Example: Purple Haze"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Category *</Label>
          <RadioGroup
            value={formData.category || ""}
            onValueChange={(value) => updateFormData({ category: value })}
            className="mt-3 space-y-2"
          >
            {["flower", "pre-rolls", "edibles", "vapes", "concentrates", "tinctures", "topicals"].map(
              (cat) => (
                <div key={cat} className="flex items-center space-x-2">
                  <RadioGroupItem value={cat} id={cat} />
                  <Label htmlFor={cat} className="font-normal capitalize cursor-pointer">
                    {cat}
                  </Label>
                </div>
              )
            )}
          </RadioGroup>
        </div>

        <div>
          <Label>Strain Type</Label>
          <RadioGroup
            value={formData.strain_info?.type || ""}
            onValueChange={(value) =>
              updateFormData({ strain_info: { ...formData.strain_info, type: value } })
            }
            className="mt-3 flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="indica" id="indica" />
              <Label htmlFor="indica" className="font-normal cursor-pointer">Indica</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sativa" id="sativa" />
              <Label htmlFor="sativa" className="font-normal cursor-pointer">Sativa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hybrid" id="hybrid" />
              <Label htmlFor="hybrid" className="font-normal cursor-pointer">Hybrid</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="thca">THCA Percentage *</Label>
            <div className="flex items-center mt-1.5">
              <Input
                id="thca"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.thca_percentage || ""}
                onChange={(e) =>
                  updateFormData({ thca_percentage: e.target.value === "" ? "" : parseFloat(e.target.value) })
                }
                placeholder="24.5"
              />
              <span className="ml-2">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="cbd">CBD Percentage (Optional)</Label>
            <div className="flex items-center mt-1.5">
              <Input
                id="cbd"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.cbd_content || ""}
                onChange={(e) =>
                  updateFormData({ cbd_content: e.target.value === "" ? "" : parseFloat(e.target.value) })
                }
                placeholder="0.5"
              />
              <span className="ml-2">%</span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="weight">Weight/Size *</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={formData.weight_grams || ""}
              onChange={(e) =>
                updateFormData({ weight_grams: e.target.value === "" ? "" : parseFloat(e.target.value) })
              }
              placeholder="3.5"
              className="flex-1"
            />
            <select
              className="border rounded-md px-3"
              value="grams"
              disabled
            >
              <option value="grams">grams</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="vendor">Vendor Name (Optional)</Label>
          <Input
            id="vendor"
            value={formData.vendor_name || ""}
            onChange={(e) => updateFormData({ vendor_name: e.target.value })}
            placeholder="Vendor/Brand name"
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}
