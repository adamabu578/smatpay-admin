'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangeEvent, FormEvent, useState } from "react";
import httpClient from "@/lib/httpClient";
import URLHelper from "@/lib/urlHelper";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [input, setInput] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isProgress, setIsProgress] = useState(false);

  const onInputChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (input.password !== input.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    setIsProgress(true);
    const json = await httpClient.post(URLHelper.resetPassword, { password: input.password, token });
    setIsProgress(false);
    
    if (json.status == 'success') {
      toast.success(json.msg || "Password reset successful");
      router.push("/");
    } else {
      toast.error(json.msg || "Failed to reset password");
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={onSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your new password below
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            onChange={onInputChanged}
            value={input.password}
            required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            onChange={onInputChanged}
            value={input.confirmPassword}
            required />
        </div>
        <Button type="submit" className="w-full" disabled={isProgress}>
          {isProgress && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
          Reset Password
        </Button>
      </div>
    </form>
  )
}
