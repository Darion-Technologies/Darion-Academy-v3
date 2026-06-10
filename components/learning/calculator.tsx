"use client";

import { useState } from "react";
import { CalculatorIcon, FlaskConical, Calculator as BasicCalcIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const basicButtons = [
  "C", "DEL", "(", ")",
  "7", "8", "9", "/",
  "4", "5", "6", "*",
  "1", "2", "3", "-",
  "0", ".", "=", "+"
];

const scientificButtons = [
  "sin(", "cos(", "tan(", "C", "DEL",
  "ln(", "log(", "sqrt(", "(", ")",
  "π", "7", "8", "9", "/",
  "e", "4", "5", "6", "*",
  "^", "1", "2", "3", "-",
  ".", "0", "=", "+", ""
];

export function CalculatorWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isScientific, setIsScientific] = useState(false);

  const handleClick = (val: string) => {
    if (val === "=") {
      if (!input) return;
      try {
        const parsed = input
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/\^/g, '**');

        const result = new Function(`return ${parsed}`)();
        if (!isFinite(result) || isNaN(result)) {
           setInput("Error");
        } else {
           // Round to 8 decimal places to avoid JS floating point issues
           setInput(String(Math.round(result * 100000000) / 100000000));
        }
      } catch {
        setInput("Error");
      }
    } else if (val === "C") {
      setInput("");
    } else if (val === "DEL") {
      setInput((prev) => prev === "Error" ? "" : prev.slice(0, -1));
    } else {
      setInput((prev) => (prev === "Error" ? val : prev + val));
    }
  };

  const currentButtons = isScientific ? scientificButtons : basicButtons;

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-2 rounded-none">
        <CalculatorIcon className="size-4" /> Calculator
      </Button>
      {open && (
        <Card className={cn("absolute right-0 top-full mt-2 z-50 shadow-xl rounded-none", isScientific ? "w-80" : "w-56")}>
          <CardContent className="p-3">
            <div className="mb-3 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsScientific(!isScientific)}
                className="h-6 px-2 text-xs rounded-none text-muted-foreground hover:text-foreground"
              >
                {isScientific ? <><BasicCalcIcon className="mr-1 size-3" /> Basic</> : <><FlaskConical className="mr-1 size-3" /> Scientific</>}
              </Button>
            </div>
            <div className="mb-3 rounded-none bg-muted p-2 text-right font-mono text-lg font-semibold tracking-wider text-foreground break-all min-h-[40px]">
              {input || "0"}
            </div>
            <div className={cn("grid gap-1.5", isScientific ? "grid-cols-5" : "grid-cols-4")}>
              {currentButtons.map((btn, i) => {
                if (!btn) return <div key={i} />;
                const isOp = ["/", "*", "-", "+"].includes(btn);
                const isSpecial = ["C", "DEL"].includes(btn);
                const isFunc = ["sin(", "cos(", "tan(", "ln(", "log(", "sqrt(", "^", "π", "e", "(", ")"].includes(btn);

                return (
                  <Button 
                    key={i} 
                    variant={btn === "=" ? "default" : isSpecial ? "destructive" : isOp ? "secondary" : isFunc ? "outline" : "outline"} 
                    size="sm" 
                    className={cn(
                      "h-9 px-0 rounded-none text-sm", 
                      !isOp && !isSpecial && !isFunc && btn !== "=" && "bg-background hover:bg-muted"
                    )}
                    onClick={() => handleClick(btn)}
                  >
                    {btn}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
