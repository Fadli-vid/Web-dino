'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { Check, Copy, Quote } from 'lucide-react';
import { Dinosaur } from '@/lib/types';
import { buildSpecimenCitations } from '@/lib/paleo/citations';
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

const emptySubscribe = () => () => {};

export function CitationDialog({ dinosaur }: CitationDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'apa' | 'mla' | 'bibtex'>('apa');
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => ''
  );
  const pageUrl = origin ? `${origin}/species/${dinosaur.id}` : `/species/${dinosaur.id}`;

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

      <DialogContent className="w-[calc(100vw-1rem)] sm:w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[92vh] overflow-y-auto border-border/80 bg-card/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-7 min-w-0">
        <DialogHeader className="text-left border-b border-border/60 pb-3.5 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-foreground">
                Cite Specimen Dossier
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Generate a formatted academic citation for{' '}
                <span className="font-semibold text-foreground">{dinosaur.name}</span>{' '}
                (<span className="italic font-serif">{dinosaur.scientificName}</span>).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as 'apa' | 'mla' | 'bibtex');
            setCopied(false);
          }}
          className="pt-2 min-w-0 w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <TabsList className="grid grid-cols-3 w-full sm:w-80 h-9">
              <TabsTrigger value="apa" className="text-xs">APA 7th</TabsTrigger>
              <TabsTrigger value="mla" className="text-xs">MLA 9th</TabsTrigger>
              <TabsTrigger value="bibtex" className="text-xs">BibTeX</TabsTrigger>
            </TabsList>
            <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline-block">
              Click text or button to copy citation
            </span>
          </div>

          <TabsContent value="apa" className="mt-3.5 min-w-0 w-full">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-foreground select-all break-words font-sans">
              {citations.apa}
            </div>
          </TabsContent>

          <TabsContent value="mla" className="mt-3.5 min-w-0 w-full">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-foreground select-all break-words font-sans">
              {citations.mla}
            </div>
          </TabsContent>

          <TabsContent value="bibtex" className="mt-3.5 min-w-0 w-full">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 sm:p-5 min-w-0 w-full overflow-hidden">
              <pre className="text-xs sm:text-sm font-mono leading-relaxed text-foreground whitespace-pre-wrap break-words break-all sm:break-normal overflow-x-auto select-all">
                {citations.bibtex}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <span className="text-[11px] font-mono text-muted-foreground">
            Format: {activeTab === 'bibtex' ? 'BibTeX (LaTeX)' : activeTab.toUpperCase()}
          </span>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleCopy()}
            className="rounded-xl text-xs sm:text-sm h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
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
