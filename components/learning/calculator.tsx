"use client";

import { useState } from "react";
import { CalculatorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CalculatorWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleClick = (val: string) => {
    if (val === "=") {
      try {
        // eslint-disable-next-line no-eval
        setInput(String(eval(input)));
      } catch {
        setInput("Error");
      }
    } else if (val === "C") {
      setInput("");
    } else {
      setInput((prev) => (prev === "Error" ? val : prev + val));
    }
  };

  const buttons = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "C", "0", "=", "+"];

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-2">
        <CalculatorIcon className="size-4" /> Calculator
      </Button>
      {open && (
        <Card className="absolute right-0 top-full mt-2 w-56 z-50 shadow-xl">
          <CardContent className="p-3">
            <div className="mb-3 rounded bg-muted p-2 text-right font-mono text-lg font-semibold tracking-wider text-foreground break-all min-h-[40px]">
              {input || "0"}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {buttons.map((btn) => (
                <Button key={btn} variant={btn === "=" ? "default" : "secondary"} size="sm" onClick={() => handleClick(btn)}>
                  {btn}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
