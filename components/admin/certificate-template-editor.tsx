"use client";

import { useActionState, useState } from "react";
import { saveCertificateTemplateAction } from "@/app/actions/certificates";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export type TemplateEditorValue = {
  id?: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  headingFontFamily: string;
  borderStyle: string;
  borderWidth: number;
  textAlign: string;
  title: string;
  presentationText: string;
  completionText: string;
  showScore: boolean;
  showCompletionDate: boolean;
  showCertificateId: boolean;
  showQrCode: boolean;
  signerName: string | null;
  signerTitle: string | null;
};

export function CertificateTemplateEditor({ initial }: { initial: TemplateEditorValue }) {
  const [state, action] = useActionState(saveCertificateTemplateAction, {});
  const [value, setValue] = useState(initial);
  function update(key: keyof TemplateEditorValue, next: string | number | boolean) {
    setValue((current) => ({ ...current, [key]: next }));
  }
  const alignItems = value.textAlign === "LEFT" ? "items-start text-left" : value.textAlign === "RIGHT" ? "items-end text-right" : "items-center text-center";
  const borderStyle = value.borderStyle === "NONE" ? "none" : value.borderStyle === "SINGLE" ? "solid" : "double";
  return <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
    <form action={action} className="grid gap-4 border bg-card p-5 md:grid-cols-2" encType="multipart/form-data">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="md:col-span-2"><Label>Template name</Label><Input name="name" value={value.name} onChange={(event)=>update("name",event.target.value)} required /></div>
      {(["primaryColor","accentColor","backgroundColor","textColor"] as const).map((key)=><div key={key}><Label>{key.replace("Color"," color")}</Label><div className="flex"><Input className="w-14 p-1" type="color" value={value[key]} onChange={(event)=>update(key,event.target.value)} /><Input name={key} value={value[key]} onChange={(event)=>update(key,event.target.value)} /></div></div>)}
      <div><Label>Body font</Label><Select name="fontFamily" value={value.fontFamily} onChange={(event)=>update("fontFamily",event.target.value)}>{["Arial","Georgia","Helvetica","Times New Roman","Verdana"].map((font)=><option key={font}>{font}</option>)}</Select></div>
      <div><Label>Heading font</Label><Select name="headingFontFamily" value={value.headingFontFamily} onChange={(event)=>update("headingFontFamily",event.target.value)}>{["Arial","Georgia","Helvetica","Times New Roman","Verdana"].map((font)=><option key={font}>{font}</option>)}</Select></div>
      <div><Label>Border</Label><Select name="borderStyle" value={value.borderStyle} onChange={(event)=>update("borderStyle",event.target.value)}><option value="DOUBLE">Double</option><option value="SINGLE">Single</option><option value="NONE">None</option></Select></div>
      <div><Label>Border width</Label><Input name="borderWidth" type="number" min={0} max={8} value={value.borderWidth} onChange={(event)=>update("borderWidth",Number(event.target.value))} /></div>
      <div><Label>Alignment</Label><Select name="textAlign" value={value.textAlign} onChange={(event)=>update("textAlign",event.target.value)}><option value="LEFT">Left</option><option value="CENTER">Center</option><option value="RIGHT">Right</option></Select></div>
      <div className="md:col-span-2"><Label>Certificate title</Label><Input name="title" value={value.title} onChange={(event)=>update("title",event.target.value)} /></div>
      <div className="md:col-span-2"><Label>Presentation text</Label><Input name="presentationText" value={value.presentationText} onChange={(event)=>update("presentationText",event.target.value)} /></div>
      <div className="md:col-span-2"><Label>Completion text</Label><Input name="completionText" value={value.completionText} onChange={(event)=>update("completionText",event.target.value)} /></div>
      <div><Label>Signer name</Label><Input name="signerName" value={value.signerName ?? ""} onChange={(event)=>update("signerName",event.target.value)} /></div>
      <div><Label>Signer title</Label><Input name="signerTitle" value={value.signerTitle ?? ""} onChange={(event)=>update("signerTitle",event.target.value)} /></div>
      <div><Label>Logo</Label><Input name="logo" type="file" accept="image/*" /></div>
      <div><Label>Signature</Label><Input name="signature" type="file" accept="image/*" /></div>
      <div className="md:col-span-2"><Label>Background image</Label><Input name="background" type="file" accept="image/*" /></div>
      <div className="md:col-span-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {([["showScore","Score"],["showCompletionDate","Completion date"],["showCertificateId","Certificate ID"],["showQrCode","QR code"]] as const).map(([key,label])=><label key={key} className="flex items-center gap-2"><input name={key} type="checkbox" checked={value[key]} onChange={(event)=>update(key,event.target.checked)} />{label}</label>)}
      </div>
      {state.error && <p className="text-sm text-red-600 md:col-span-2">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600 md:col-span-2">{state.success}</p>}
      <div className="flex gap-3 md:col-span-2"><SubmitButton pendingText="Saving template...">Save template</SubmitButton>{initial.id && <Button variant="outline" asChild><a href={`/api/admin/certificate-templates/${initial.id}/preview`} target="_blank">PDF preview</a></Button>}</div>
    </form>
    <div className="sticky top-20 self-start"><p className="mb-2 text-sm font-semibold text-muted-foreground">Live preview</p><div className="aspect-[1.414/1] bg-card p-5 shadow-sm" style={{ backgroundColor: value.backgroundColor, color: value.textColor }}>
      <div className={`flex size-full flex-col justify-center p-8 ${alignItems}`} style={{ border: `${value.borderWidth}px ${borderStyle} ${value.primaryColor}`, fontFamily: value.fontFamily }}>
        <div className="grid size-10 place-items-center text-white" style={{ backgroundColor: value.accentColor }}>D</div><p className="mt-2 text-[9px] font-bold uppercase tracking-[.25em]">Darion Technologies</p>
        <h2 className="my-3 text-2xl" style={{ fontFamily: value.headingFontFamily }}>{value.title}</h2><p className="text-xs opacity-70">{value.presentationText}</p>
        <p className="my-3 border-b px-5 pb-1 text-xl" style={{ color: value.accentColor, borderColor: value.primaryColor, fontFamily: value.headingFontFamily }}>Alex Morgan</p>
        <p className="text-xs opacity-70">{value.completionText}</p><p className="mt-2 font-bold">Secure Web Application Foundations</p>
        <div className="mt-5 flex gap-5 text-[8px]">{value.showCompletionDate && <span>June 6, 2026<br/>Completion date</span>}{value.showScore && <span>92%<br/>Final score</span>}{value.showCertificateId && <span>DA-2026-DEMO<br/>Certificate ID</span>}{value.showQrCode && <span className="grid size-9 place-items-center border">QR</span>}</div>
      </div>
    </div>
    </div>
  </div>;
}
