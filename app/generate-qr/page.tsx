"use client";

import { QrCode } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { colorWarning, isHexColor } from "./colors";
import { ContentForm } from "./components/ContentForm";
import { LogoOptions } from "./components/LogoOptions";
import { QrPreview } from "./components/QrPreview";
import { StyleOptions } from "./components/StyleOptions";
import { qrFilename } from "./download";
import { buildPayload, emptyInput, type QrInput } from "./payload";
import { DEFAULT_OPTIONS, type QrOptions } from "./render";
import { useQrRender } from "./useQrRender";

export default function GenerateQrPage() {
  const [input, setInput] = useState<QrInput>(() => emptyInput("url"));
  const [options, setOptions] = useState<QrOptions>(DEFAULT_OPTIONS);
  const [logo, setLogo] = useState<string | null>(null);

  // Keep half-typed colours in the form, but only render with valid ones.
  const renderOptions: QrOptions = {
    ...options,
    fg: isHexColor(options.fg) ? options.fg : DEFAULT_OPTIONS.fg,
    bg: isHexColor(options.bg) ? options.bg : DEFAULT_OPTIONS.bg,
  };
  const result = useQrRender(buildPayload(input), renderOptions, logo);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:py-16">
      <header className="mb-8 flex items-center gap-3">
        <QrCode className="size-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">QR Code Generator</h1>
          <p className="text-sm text-muted-foreground">Runs entirely in your browser — nothing is uploaded.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>What the code should open or contain.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentForm value={input} onChange={setInput} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Style</CardTitle>
            </CardHeader>
            <CardContent>
              <StyleOptions value={options} onChange={setOptions} eccLocked={logo !== null} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>Optional image in the centre of the code.</CardDescription>
            </CardHeader>
            <CardContent>
              <LogoOptions logo={logo} onLogo={setLogo} value={options} onChange={setOptions} />
            </CardContent>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-6 lg:self-start">
          <CardContent className="pt-6">
            <QrPreview
              result={result}
              // Transparent codes are assumed to sit on a light surface.
              warning={colorWarning(options.fg, options.transparent ? "#ffffff" : options.bg)}
              transparent={options.transparent}
              filenameFor={(ext) => qrFilename(input, ext)}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
