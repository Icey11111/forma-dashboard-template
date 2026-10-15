import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { Save, Trash2, LoaderCircle, Copy } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useWorkspace } from "@/lib/workspace";
import type { Entity, Records } from "@shared/schema";

export function Confirm({ open, onClose, title, description, onConfirm, label = "Confirm", destructive = false }: { open: boolean; onClose: () => void; title: string; description: string; onConfirm: () => Promise<boolean> | boolean | void; label?: string; destructive?: boolean }) {
  const { busy } = useWorkspace();
  return <Dialog open={open} onOpenChange={isOpen => { if (!isOpen && !busy) onClose(); }}><DialogContent className="confirm-dialog"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><div className="dialog-actions"><Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button><Button variant={destructive ? "destructive" : "default"} disabled={busy} onClick={async () => { const done = await onConfirm(); if (done !== false) onClose(); }}>{busy && <LoaderCircle className="animate-spin" />}{label}</Button></div></DialogContent></Dialog>;
}

export function RecordEditor<K extends Entity>({ entity, initial, title, description, children, onClose, extra, duplicate }: { entity: K; initial: Records[K]; title: string; description?: string; children: (draft: Records[K], setDraft: (data: Records[K]) => void) => ReactNode; onClose: () => void; extra?: ReactNode; duplicate?: () => void }) {
  const { data, save, remove, busy } = useWorkspace();
  const [draft, setDraft] = useState(initial), [deleteOpen, setDeleteOpen] = useState(false), [discardOpen, setDiscardOpen] = useState(false);
  const exists = data![entity].some(record => record.id === initial.id);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const block = (event: Event) => { if (!window.confirm("Discard unsaved changes to this record?")) event.preventDefault(); };
    window.addEventListener("beforeunload", warn); window.addEventListener("forma:navigate", block);
    return () => { window.removeEventListener("beforeunload", warn); window.removeEventListener("forma:navigate", block); };
  }, [dirty]);
  const close = () => { if (busy) return; if (dirty) setDiscardOpen(true); else onClose(); };
  async function submit(event: FormEvent) { event.preventDefault(); if (await save(entity, draft)) onClose(); }
  return <><Sheet open onOpenChange={open => { if (!open) close(); }}><SheetContent className="record-sheet"><SheetHeader><SheetTitle>{title}</SheetTitle><SheetDescription>{description || "Changes save only to this fictional local workspace."}</SheetDescription></SheetHeader><form onSubmit={submit} className="editor-form"><div className="editor-body"><FieldGroup>{children(draft, setDraft)}</FieldGroup>{extra}</div><footer className="editor-footer"><div>{exists && entity !== "settings" && <Button variant="ghost" size="icon" aria-label="Delete record" onClick={() => setDeleteOpen(true)} disabled={busy}><Trash2 /></Button>}{duplicate && <Button variant="ghost" size="icon" aria-label="Duplicate record" onClick={duplicate} disabled={busy}><Copy /></Button>}</div><div className="flex gap-2"><Button variant="outline" onClick={close} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy || (exists && !dirty)}>{busy ? <LoaderCircle className="animate-spin" /> : <Save size={15} />}Save changes</Button></div></footer></form></SheetContent></Sheet>
    <Confirm open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete this demo record?" description="This removes the record from your local database. Records referenced by an order cannot be deleted." label="Delete record" destructive onConfirm={async () => { if (await remove(entity, initial.id, initial.revision)) { onClose(); return true; } return false; }} />
    <Confirm open={discardOpen} onClose={() => setDiscardOpen(false)} title="Discard unsaved changes?" description="Your saved local record will stay as it is." label="Discard changes" onConfirm={onClose} />
  </>;
}
