import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, Shield, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

export default function VerifyID() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    idType: "",
    idNumber: "",
  });
  const [files, setFiles] = useState<{
    idFront: File | null;
    idBack: File | null;
    selfie: File | null;
  }>({
    idFront: null,
    idBack: null,
    selfie: null,
  });

  const handleFileChange = (fileType: 'idFront' | 'idBack' | 'selfie') => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed");
        return;
      }
      
      setFiles(prev => ({ ...prev, [fileType]: file }));
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('id-documents')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('id-documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!files.idFront || !files.idBack || !files.selfie) {
      toast.error("Please upload all required documents");
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to verify your ID");
        navigate("/");
        return;
      }

      // Upload files
      toast.loading("Uploading documents...");
      
      const [idFrontUrl, idBackUrl, selfieUrl] = await Promise.all([
        uploadFile(files.idFront, `${user.id}/id-front`),
        uploadFile(files.idBack, `${user.id}/id-back`),
        uploadFile(files.selfie, `${user.id}/selfie`),
      ]);

      toast.dismiss();

      // Create verification record
      const { error: insertError } = await supabase
        .from('age_verifications')
        .insert({
          user_id: user.id,
          date_of_birth: formData.dateOfBirth,
          verification_type: 'manual',
          verification_method: 'document_upload',
          id_type: formData.idType,
          id_number: formData.idNumber,
          id_front_url: idFrontUrl,
          id_back_url: idBackUrl,
          selfie_url: selfieUrl,
          verified: false,
        });

      if (insertError) throw insertError;

      toast.success("✓ Documents submitted successfully! We'll review them within 24 hours.");
      setTimeout(() => navigate("/account"), 2000);

    } catch (error: any) {
      console.error("Error submitting verification:", error);
      toast.error("Failed to submit verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isOver21 = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) >= 21 : true;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Verify Your ID - NYM NYC"
        description="Complete your identity verification to unlock full access to NYM NYC delivery services."
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-20 md:py-24 max-w-4xl">
        <div className="mb-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-black mb-4">Verify Your Identity</h1>
          <p className="text-lg text-muted-foreground">
            Complete verification to increase your trust score and unlock higher spending limits
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of 3</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 3) * 100)}%</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  You must be 21+ years old to use our service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split('T')[0]}
                    required
                    className="mt-1.5"
                  />
                  {formData.dateOfBirth && !isOver21 && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You must be 21 years or older to use our service
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div>
                  <Label htmlFor="idType">ID Type *</Label>
                  <Select value={formData.idType} onValueChange={(value) => setFormData({ ...formData, idType: value })} required>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="state_id">State ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="military_id">Military ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="idNumber">ID Number (Last 4 digits) *</Label>
                  <Input
                    id="idNumber"
                    type="text"
                    placeholder="XXXX"
                    maxLength={4}
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value.replace(/[^0-9]/g, '') })}
                    required
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For verification purposes only
                  </p>
                </div>

                <Button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  className="w-full"
                  disabled={!formData.dateOfBirth || !formData.idType || !formData.idNumber || !isOver21}
                >
                  Continue to Document Upload
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Document Upload */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Clear photos of your government-issued ID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ID Front */}
                <div>
                  <Label>ID Front Side *</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange('idFront')}
                      className="hidden"
                      id="idFront"
                    />
                    <label htmlFor="idFront" className="cursor-pointer">
                      {files.idFront ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">{files.idFront.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload front of ID</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* ID Back */}
                <div>
                  <Label>ID Back Side *</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange('idBack')}
                      className="hidden"
                      id="idBack"
                    />
                    <label htmlFor="idBack" className="cursor-pointer">
                      {files.idBack ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">{files.idBack.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload back of ID</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Make sure all text is clearly visible and not blurry. Photos must show all four corners of your ID.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep(3)} 
                    className="flex-1"
                    disabled={!files.idFront || !files.idBack}
                  >
                    Continue to Selfie
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Selfie */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Take a Selfie</CardTitle>
                <CardDescription>
                  Hold your ID next to your face for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Selfie with ID *</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileChange('selfie')}
                      className="hidden"
                      id="selfie"
                    />
                    <label htmlFor="selfie" className="cursor-pointer">
                      {files.selfie ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">{files.selfie.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to take or upload selfie</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="space-y-2">
                    <p className="font-semibold">Selfie Requirements:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Hold your ID next to your face</li>
                      <li>• Make sure your face is clearly visible</li>
                      <li>• ID should be readable in the photo</li>
                      <li>• Good lighting, no filters</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Alert variant="default" className="bg-blue-500/10 border-blue-500/20">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    <strong>Privacy & Security:</strong> Your documents are encrypted and securely stored. 
                    They're only used for age verification and will be reviewed by our compliance team within 24 hours.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={!files.selfie || loading}
                  >
                    {loading ? "Submitting..." : "Submit Verification"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>• Verification typically takes 24 hours</p>
            <p>• Accepted IDs: Driver's License, State ID, Passport, Military ID</p>
            <p>• All information is kept confidential and secure</p>
            <p>• Contact support if you have questions: support@nymnyc.com</p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
