import { useState, useMemo, type ReactNode } from "react";
import { ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty } from "./common";

export type Column<T> = { key: string; label: string; render: (row: T) => ReactNode; value?: (row: T) => string | number; align?: "right" };
export function DataTable<T extends { id: string }>({ rows, columns, onOpen, selected, onSelect, limit = 8, emptyAction }: { rows: T[]; columns: Column<T>[]; onOpen?: (row: T) => void; selected?: Set<string>; onSelect?: (ids: Set<string>) => void; limit?: number; emptyAction?: ReactNode }) {
  const [page, setPage] = useState(0), [sort, setSort] = useState<{ key: string; ascending: boolean } | null>(null);
  const sorted = useMemo(() => {
    const col = columns.find(column => column.key === sort?.key);
    if (!sort || !col?.value) return rows;
    return [...rows].sort((a, b) => { const av = col.value!(a), bv = col.value!(b); const result = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv)); return result * (sort.ascending ? 1 : -1); });
  }, [rows, columns, sort]);
  const maxPage = Math.max(0, Math.ceil(rows.length / limit) - 1), safePage = Math.min(page, maxPage);
  const visible = sorted.slice(safePage * limit, (safePage + 1) * limit);
  const allSelected = !!visible.length && visible.every(row => selected?.has(row.id));
  function toggle(id: string) { const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id); onSelect?.(next); }
  function togglePage() { const next = new Set(selected); visible.forEach(row => allSelected ? next.delete(row.id) : next.add(row.id)); onSelect?.(next); }
  if (!rows.length) return <Empty action={emptyAction} />;
  return <><Table className="records-table"><TableHeader><TableRow>{onSelect && <TableHead className="selection-cell"><Checkbox aria-label="Select this page" checked={allSelected} onCheckedChange={togglePage} /></TableHead>}{columns.map(column => <TableHead key={column.key} className={column.align === "right" ? "text-right" : undefined} aria-sort={sort?.key === column.key ? sort.ascending ? "ascending" : "descending" : undefined}>{column.value ? <button className="sort-control" onClick={() => { setSort({ key: column.key, ascending: sort?.key === column.key ? !sort.ascending : true }); setPage(0); }}>{column.label}<ArrowDownUp size={12} aria-hidden="true" /></button> : column.label}</TableHead>)}{onOpen && <TableHead className="action-cell"><span className="sr-only">Open record</span></TableHead>}</TableRow></TableHeader><TableBody>{visible.map(row => <TableRow key={row.id}>{onSelect && <TableCell><Checkbox aria-label={`Select ${row.id}`} checked={selected?.has(row.id) || false} onCheckedChange={() => toggle(row.id)} /></TableCell>}{columns.map((column, index) => <TableCell key={column.key} className={column.align === "right" ? "text-right" : undefined}>{index === 0 && onOpen ? <button className="record-link" onClick={() => onOpen(row)}>{column.render(row)}</button> : column.render(row)}</TableCell>)}{onOpen && <TableCell><Button variant="ghost" size="icon-sm" aria-label={`Open ${row.id}`} onClick={() => onOpen(row)}><ChevronRight size={16} /></Button></TableCell>}</TableRow>)}</TableBody></Table>
    <footer className="table-footer"><span>Showing {safePage * limit + 1}–{Math.min((safePage + 1) * limit, rows.length)} of {rows.length}</span><div><Button variant="outline" size="icon-sm" aria-label="Previous page" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}><ChevronLeft /></Button><span>{safePage + 1} / {maxPage + 1}</span><Button variant="outline" size="icon-sm" aria-label="Next page" disabled={safePage === maxPage} onClick={() => setPage(safePage + 1)}><ChevronRight /></Button></div></footer></>;
}
