'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangeEvent, FormEvent, useState } from "react";
import httpClient from "@/lib/httpClient";
import URLHelper from "@/lib/urlHelper";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [input, setInput] = useState({
    email: "",
  });
  const [isProgress, setIsProgress] = useState(false);

  const onInputChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsProgress(true);
    const json = await httpClient.post(URLHelper.forgotPassword, { email: input.email });
    setIsProgress(false);
    if (json.status == 'success') {
      toast.success(json.msg);
    } else {
      toast.error(json.msg || "Failed to send reset email");
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={onSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to receive a password reset link
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="m@example.com"
            onChange={onInputChanged}
            value={input.email}
            required />
        </div>
        <Button type="submit" className="w-full" disabled={isProgress}>
          {isProgress && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
          Send Reset Link
        </Button>
      </div>
      <div className="text-center text-sm">
        Remember your password?{" "}
        <Link href="/" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </form>
  )
}
