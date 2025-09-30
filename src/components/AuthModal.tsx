import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
}

const AuthModal = ({ open, onOpenChange, mode, onModeChange }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (mode === "signup") {
      // Confirm password
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      // Phone validation (optional but if provided should be valid)
      if (phone) {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
          newErrors.phone = "Phone must be 10 digits";
        }
      }

      // Age confirmation
      if (!ageConfirmed) {
        newErrors.ageConfirmed = "You must confirm you are 21 or older";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { phone },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;
        toast.success("Account created successfully!");
        onOpenChange(false);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPhone("");
        setAgeConfirmed(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Signed in successfully!");
        onOpenChange(false);
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? "Sign in to your account to start ordering"
              : "Create an account to order THCA products"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: "" });
              }}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="1234567890"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors({ ...errors, phone: "" });
                }}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "" });
                }}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({ ...errors, confirmPassword: "" });
                }}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {mode === "signup" && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="age"
                  checked={ageConfirmed}
                  onCheckedChange={(checked) => {
                    setAgeConfirmed(checked as boolean);
                    setErrors({ ...errors, ageConfirmed: "" });
                  }}
                />
                <Label htmlFor="age" className="text-sm font-normal cursor-pointer">
                  I confirm I am 21 years or older
                </Label>
              </div>
              {errors.ageConfirmed && (
                <p className="text-sm text-destructive">{errors.ageConfirmed}</p>
              )}
            </div>
          )}

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>

          <div className="text-center text-sm">
            {mode === "signin" ? (
              <span>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => onModeChange("signup")}
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => onModeChange("signin")}
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
