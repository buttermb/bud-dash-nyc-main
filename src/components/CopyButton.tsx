import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CopyButtonSize = "sm" | "md" | "lg" | "icon";
type CopyButtonVariant = "default" | "secondary" | "outline" | "ghost";

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: CopyButtonSize;
  variant?: CopyButtonVariant;
  showLabel?: boolean;
  className?: string;
}

export default function CopyButton({
  text,
  label = "Copy",
  size = "sm",
  variant = "outline",
  showLabel = true,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const iconSize = size === "lg" ? 18 : size === "icon" ? 18 : 16;

  return (
    <Button
      type="button"
      onClick={handleCopy}
      size={size === "md" ? "default" : (size as any)}
      variant={variant as any}
      className={className}
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check className="h-4 w-4" style={{ width: iconSize, height: iconSize }} /> : <Copy className="h-4 w-4" style={{ width: iconSize, height: iconSize }} />}
      {showLabel && <span className="ml-2">{label}</span>}
    </Button>
  );
}

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export function CopyButton({ 
  text, 
  label, 
  variant = "ghost", 
  size = "sm",
  className,
  showLabel = true 
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: label ? `${label} copied to clipboard` : "Copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("gap-2", className)}
      type="button"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {showLabel && (size !== "icon") && (
        <span>{copied ? "Copied!" : "Copy"}</span>
      )}
    </Button>
  );
}
