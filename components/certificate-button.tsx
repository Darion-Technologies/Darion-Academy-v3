"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CertificateButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  async function download() {
    setLoading(true);
    try {
      const response = await fetch(`/api/certificates/${id}`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not generate certificate.");
    } finally {
      setLoading(false);
    }
  }
  return <Button onClick={download} disabled={loading}><Download className="size-4" />{loading ? "Generating..." : "Download PDF"}</Button>;
}
