'use client';

import { Fragment, useMemo, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { GlossaryEntry, tokenizeGlossaryText } from '@/lib/paleo-glossary';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface GlossaryTextProps {
  text: string;
}

function GlossaryTermTrigger({
  label,
  entry,
}: {
  label: string;
  entry: GlossaryEntry;
}) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    clearCloseTimer();
    setOpen(true);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="inline cursor-help border-b border-dotted border-primary/70 text-foreground font-medium hover:text-primary hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
          aria-label={`Definition of ${entry.term}`}
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="w-72 rounded-xl border-border/80 bg-popover/95 backdrop-blur-xl p-3.5 shadow-lg space-y-1.5 z-50"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-[var(--font-display)] font-bold text-xs text-foreground flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
            {entry.term}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {entry.category}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {entry.definition}
        </p>
      </PopoverContent>
    </Popover>
  );
}

export function GlossaryText({ text }: GlossaryTextProps) {
  const tokens = useMemo(() => tokenizeGlossaryText(text), [text]);

  return (
    <>
      {tokens.map((token, idx) =>
        token.entry ? (
          <GlossaryTermTrigger
            key={`${token.entry.id}-${idx}`}
            label={token.text}
            entry={token.entry}
          />
        ) : (
          <Fragment key={idx}>{token.text}</Fragment>
        )
      )}
    </>
  );
}
