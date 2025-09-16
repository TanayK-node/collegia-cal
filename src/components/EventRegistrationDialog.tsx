import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EventRegistrationDialogProps {
  event: {
    id: string;
    title: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EventRegistrationDialog = ({ 
  event, 
  isOpen, 
  onClose, 
  onSuccess 
}: EventRegistrationDialogProps) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  if (!event) return null;

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          phoneNumber: phoneNumber,
          eventId: event.id,
        },
      });

      if (error) throw error;

      if (data.success) {
        setOtpSent(true);
        setStep('otp');
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code.",
        });
      } else {
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          phoneNumber: phoneNumber,
          otpCode: otpCode,
          eventId: event.id,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Registration Successful!",
          description: `You are now registered for ${event.title}. Your ticket number is: ${data.ticketNumber}`,
        });
        onSuccess();
        handleClose();
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid or expired OTP.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtpCode('');
    setOtpSent(false);
    setIsLoading(false);
    onClose();
  };

  const handleResendOTP = () => {
    setOtpCode('');
    handleSendOTP();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Register for {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'phone' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Please enter your phone number to receive a verification code.
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="pl-10"
                    maxLength={10}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  We'll send you a 6-digit verification code via SMS.
                </div>
              </div>

              <Button 
                onClick={handleSendOTP}
                disabled={isLoading || phoneNumber.length !== 10}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="mr-2 h-4 w-4" />
                )}
                Send Verification Code
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Enter the 6-digit verification code sent to +91 {phoneNumber}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Resend Code
                </Button>
                <Button 
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otpCode.length !== 6}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="mr-2 h-4 w-4" />
                  )}
                  Verify & Register
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="w-full text-sm"
              >
                Change Phone Number
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};