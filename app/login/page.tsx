"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid username or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 font-sans">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Secure access to your vault</p>
        </div>

        <Card className="p-6 bg-card border-border/50 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive text-center font-bold">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                className="bg-secondary/30 border-border/40 h-10 text-sm focus:ring-1 focus:ring-primary/30"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-secondary/30 border-border/40 h-10 text-sm focus:ring-1 focus:ring-primary/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all text-xs"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/20 text-center">
            <p className="text-xs text-muted-foreground">
              New here?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>
        </Card>
        
        <p className="text-center text-[10px] uppercase tracking-widest font-bold text-muted-foreground/30">
          Things &copy; 2026
        </p>
      </div>
    </div>
  );
}
