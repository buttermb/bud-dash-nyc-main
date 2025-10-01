import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface StatusToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: LucideIcon;
  activeText: string;
  inactiveText: string;
}

export const StatusToggle = ({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  icon: Icon,
  activeText,
  inactiveText,
}: StatusToggleProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${checked ? "bg-green-100 dark:bg-green-950" : "bg-muted"}`}>
                <Icon className={`h-5 w-5 ${checked ? "text-green-600" : "text-muted-foreground"}`} />
              </div>
              <div>
                <Label htmlFor={id} className="text-base font-semibold cursor-pointer">
                  {label}
                </Label>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <Badge
              variant={checked ? "default" : "secondary"}
              className={checked ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {checked ? activeText : inactiveText}
            </Badge>
          </div>
          <Switch
            id={id}
            checked={checked}
            onCheckedChange={onCheckedChange}
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};
