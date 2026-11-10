"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-x py-20">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        The page hit an unexpected problem. Your figures were not saved or sent anywhere. Please try again.
      </p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
