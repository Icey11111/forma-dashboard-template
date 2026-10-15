import { useId, type ReactNode, type InputHTMLAttributes } from "react";
import { Search, Inbox, ChevronDown, Package, ShoppingBag, BookOpen, Shirt, House } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { RollingNumber } from "@/components/ui/rolling-number";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import type { Product } from "@shared/schema";

export function Count({ value, format }: { value: number; format?: (value: number) => string }) {
  const reduced = useReducedMotion();
  return <span aria-label={format ? format(value) : String(value)}>{reduced ? (format ? format(value) : value.toLocaleString()) : <span aria-hidden="true"><RollingNumber value={value} format={format} precision={format ? 2 : 0} damping={25} stiffness={160} /></span>}</span>;
}
export function PageHeading({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div><div className="heading-actions">{children}</div></div>;
}
export function Panel({ title, description, action, children, className }: { title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={cn("panel", className)}><header className="panel-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</header>{children}</section>;
}
export function Status({ value }: { value: string }) {
  const tone = ["Paid", "Delivered", "Active", "Published", "Healthy"].includes(value) ? "success" : ["Pending", "Processing", "In review", "Low stock"].includes(value) ? "warning" : ["Shipped", "VIP", "Returning"].includes(value) ? "info" : ["Refunded", "Cancelled", "Expired", "Archived", "Inactive"].includes(value) ? "neutral" : "violet";
  return <span className={cn("status", `status-${tone}`)}><span aria-hidden="true" />{value}</span>;
}
export function Empty({ title = "No matching records", description = "Try a different search or filter.", action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div className="empty-state"><Inbox size={28} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{description}</p>{action}</div>;
}
export function SearchInput({ value, onChange, placeholder = "Search records…" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <InputGroup className="table-search"><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput aria-label={placeholder} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} /></InputGroup>;
}
export function TextField({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const autoId = useId(); const id = props.id ?? autoId;
  return <Field><FieldLabel htmlFor={id}>{label}</FieldLabel><Input {...props} id={id} />{hint && <FieldDescription>{hint}</FieldDescription>}</Field>;
}
export function SelectField({ label, value, options, onChange, disabled = false }: { label: string; value: string; options: (string | { value: string; label: string })[]; onChange: (value: string) => void; disabled?: boolean }) {
  const id = useId();
  return <Field><FieldLabel htmlFor={id}>{label}</FieldLabel><NativeSelect id={id} value={value} onChange={event => onChange(event.target.value)} disabled={disabled}>{options.map(option => <NativeSelectOption key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>{typeof option === "string" ? option : option.label}</NativeSelectOption>)}</NativeSelect></Field>;
}
export function NotesField({ label, value, onChange, rows = 4, placeholder }: { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  const id = useId(); return <Field><FieldLabel htmlFor={id}>{label}</FieldLabel><Textarea id={id} value={value} onChange={event => onChange(event.target.value)} rows={rows} placeholder={placeholder} maxLength={5000} /></Field>;
}
export function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return <span className={cn("avatar", small && "avatar-small")} aria-hidden="true">{name.split(" ").slice(0, 2).map(part => part[0]).join("")}</span>;
}
export function ProductThumb({ product, image, large = false }: { product: Product; image?: string; large?: boolean }) {
  const Icon = product.category === "Stationery" ? BookOpen : product.category === "Apparel" ? Shirt : product.category === "Accessories" ? ShoppingBag : product.category === "Home & living" ? House : Package;
  return <span className={cn("product-thumb", `swatch-${product.color}`, large && "product-thumb-large")}>{image ? <img src={image} alt={product.name} /> : <Icon size={large ? 46 : 19} strokeWidth={1.2} aria-label={product.category} />}</span>;
}
export function Period({ days, setDays }: { days: number; setDays: (days: number) => void }) {
  return <div className="period-control"><NativeSelect aria-label="Reporting period" value={String(days)} onChange={event => setDays(Number(event.target.value))}><NativeSelectOption value="7">Last 7 days</NativeSelectOption><NativeSelectOption value="30">Last 30 days</NativeSelectOption><NativeSelectOption value="90">Last 90 days</NativeSelectOption></NativeSelect><ChevronDown className="sr-only" /></div>;
}
export function newBase(prefix: string) { return { id: `${prefix}-${crypto.randomUUID()}`, revision: 0, updatedAt: "" }; }
