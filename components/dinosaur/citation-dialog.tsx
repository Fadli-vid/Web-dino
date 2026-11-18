'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Quote } from 'lucide-react';
import { Dinosaur } from '@/lib/types';
import { buildSpecimenCitations } from '@/lib/citations';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CitationDialogProps {
  dinosaur: Dinosaur;
}

export function CitationDialog({ dinosaur }: CitationDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'apa' | 'mla' | 'bibtex'>('apa');
  const [copied, setCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState(`/species/${dinosaur.id}`);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
    }
  }, [dinosaur.id]);

  const citations = useMemo(
    () => buildSpecimenCitations(dinosaur, pageUrl),
    [dinosaur, pageUrl]
  );

  const handleCopy = async () => {
    const value = citations[activeTab];
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl border-border/80 text-xs flex items-center gap-1.5 h-8 bg-card/60 hover:bg-card"
        >
          <Quote className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Cite</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl border-border/80 bg-card/95 backdrop-blur-xl rounded-2xl">
        <DialogHeader className="text-left border-b border-border/60 pb-3">
          <DialogTitle className="font-[var(--font-display)] text-lg flex items-center gap-2">
            <Quote className="w-4 h-4 text-primary" />
            Cite Specimen Dossier
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Generate a formatted academic citation for{' '}
            <span className="font-semibold text-foreground">{dinosaur.name}</span>{' '}
            (<span className="italic">{dinosaur.scientificName}</span>).
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as 'apa' | 'mla' | 'bibtex');
            setCopied(false);
          }}
          className="pt-2"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="apa" className="text-xs">APA 7th</TabsTrigger>
            <TabsTrigger value="mla" className="text-xs">MLA 9th</TabsTrigger>
            <TabsTrigger value="bibtex" className="text-xs">BibTeX</TabsTrigger>
          </TabsList>

          <TabsContent value="apa" className="mt-3">
            <div className="rounded-xl border border-border/70 bg-muted/35 p-4 text-xs leading-relaxed text-foreground select-all">
              {citations.apa}
            </div>
          </TabsContent>

          <TabsContent value="mla" className="mt-3">
            <div className="rounded-xl border border-border/70 bg-muted/35 p-4 text-xs leading-relaxed text-foreground select-all">
              {citations.mla}
            </div>
          </TabsContent>

          <TabsContent value="bibtex" className="mt-3">
            <pre className="rounded-xl border border-border/70 bg-muted/35 p-4 text-[11px] font-mono leading-relaxed text-foreground overflow-x-auto select-all">
              {citations.bibtex}
            </pre>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            size="sm"
            onClick={() => void handleCopy()}
            className="rounded-xl text-xs bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied {activeTab.toUpperCase()}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy {activeTab.toUpperCase()} Citation</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
