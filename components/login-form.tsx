'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangeEvent, FormEvent, useState } from "react";
import httpClient from "@/lib/httpClient";
import URLHelper from "@/lib/urlHelper";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [isProgress, setIsProgress] = useState(false);

  const onInputChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setInput({ ...input, [name]: value });
  };

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProgress(true);
    const json = await httpClient.post(URLHelper.login, { email: input.email, password: input.password });
    setIsProgress(false);
    if (json.status == 'success') {
      router.push('/home');
    } else {
      // toast(json.msg);
      // Promise(executor: (resolve: (value: unknown) => void, reject: (reason?: any) => void) => void)

      toast.promise(new Promise((resolve, reject) => reject()), {
        // loading: `Processing...`,
        // success: "Done",
        error: json.msg,
      });
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={onLogin}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
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
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            onChange={onInputChanged}
            value={input.password}
            required />
        </div>
        <Button type="submit" className="w-full" disabled={isProgress}>
          {isProgress && <Loader2 className="animate-spin" />}
          Login
        </Button>
      </div>
    </form>
  )
}
