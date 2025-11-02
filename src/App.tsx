import { SignUpPasswordInput } from "@/components/signup-password-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, type FormEvent } from "react";
import { Link } from "wouter";

export function App() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signUp" | "signIn">("signIn");
  const [error, setError] = useState<Error | null>(null);
  const isError = error !== null;

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("here");
    const formData = new FormData(e.currentTarget);
    console.log(formData);
    try {
      await signIn("password", formData);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      }
    }
  }
  return (
    <div className="h-full flex justify-center items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Zarathustra</CardTitle>
          <CardDescription>
            {step === "signIn" && "Log in to your account"}
            {step === "signUp" && "Create new account"}
          </CardDescription>
          <CardAction className="self-center">
            <Button
              onClick={() =>
                setStep((prev) => (prev === "signIn" ? "signUp" : "signIn"))
              }
              variant="link"
            >
              {step === "signIn" ? "Sign Up" : "Sign In"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form
            onBlur={() => {
              setError(null);
            }}
            onInput={() => {
              setError(null);
            }}
            id="login"
            onSubmit={handleFormSubmit}
          >
            <input name="flow" type="hidden" value={step} />
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label
                  className={cn(isError && "text-destructive")}
                  htmlFor="email"
                >
                  Email
                </Label>
                <Input
                  aria-invalid={isError}
                  id="email"
                  name="email"
                  type="email"
                  required
                />
              </div>
              {step === "signUp" ? (
                <SignUpPasswordInput isError={isError} />
              ) : (
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label
                      className={cn(isError && "text-destructive")}
                      htmlFor="password"
                    >
                      Password
                    </Label>
                    {step === "signIn" && (
                      <Link
                        href="/signup"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    )}
                  </div>
                  <Input
                    aria-invalid={isError}
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                  {isError && (
                    <div className="text-destructive text-sm">
                      Invalid Email or Password
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button form="login" type="submit" className="w-full">
            {step === "signIn" && "Login"}
            {step === "signUp" && "Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
