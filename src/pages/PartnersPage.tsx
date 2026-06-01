import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Users, Building2, Truck } from "lucide-react";
import { listPartners, createPartner, fmtDinars } from "../api";
import { useToastStore } from "../api/toastStore";
import type { Partner, CreatePartner } from "../types";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PartnersPage() {
  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [filterType, setFilterType] = React.useState<"all" | "client" | "supplier">("all");
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState<CreatePartner>({
    partner_type: "client", code: "", name: "",
    address: "", phone: "", email: "", tax_id: "", credit_limit: 0, notes: "",
  });
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => { load(); }, [filterType]);

  async function load() {
    try {
      const data = await listPartners(filterType === "all" ? undefined : filterType);
      setPartners(data);
    } catch (e) { addToast(String(e), "error"); }
  }

  function openNew() {
    setForm({ partner_type: "client", code: "", name: "", address: "", phone: "", email: "", tax_id: "", credit_limit: 0, notes: "" });
    setShowForm(true);
  }

  async function save() {
    if (!form.code || !form.name) {
      addToast("Code et nom requis", "error");
      return;
    }
    try {
      await createPartner(form);
      addToast("Tiers créé", "success");
      setShowForm(false);
      load();
    } catch (e) { addToast(String(e), "error"); }
  }

  const columns: ColumnDef<Partner>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          {row.original.email && (
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
      cell: ({ row }) =>
        row.original.phone ? (
          <span className="font-mono text-sm">{row.original.phone}</span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        ),
    },
    {
      accessorKey: "partner_type",
      header: "Type",
      cell: ({ row }) =>
        row.original.partner_type === "client" ? (
          <Badge variant="info" className="gap-1">
            <Building2 className="size-3" /> Client
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <Truck className="size-3" /> Fournisseur
          </Badge>
        ),
    },
    {
      accessorKey: "balance",
      header: "Solde",
      cell: ({ row }) => (
        <span className="tabular-nums">{fmtDinars(row.original.balance)} D</span>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <PageHeader
        title="Tiers"
        description="Clients et fournisseurs"
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Nouveau tiers
          </Button>
        }
      />

      <Tabs value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="client">Clients</TabsTrigger>
          <TabsTrigger value="supplier">Fournisseurs</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={partners}
        searchColumn="search"
        searchPlaceholder="Rechercher par nom, code, téléphone..."
        emptyState={
          <EmptyState
            icon={<Users className="size-6" />}
            title="Aucun tiers"
            description="Créez votre premier client ou fournisseur."
            action={<Button onClick={openNew}><Plus className="size-4" /> Nouveau tiers</Button>}
          />
        }
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau tiers</DialogTitle>
            <DialogDescription>Renseignez les informations du client ou fournisseur.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.partner_type} onValueChange={(v) => setForm({ ...form, partner_type: v as "client" | "supplier" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="supplier">Fournisseur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="code">Code</Label>
                <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tax_id">Matricule fiscal</Label>
                <Input id="tax_id" value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="credit">Plafond crédit (D)</Label>
                <Input id="credit" type="number" step="0.001" value={form.credit_limit / 1000} onChange={(e) => setForm({ ...form, credit_limit: Math.round((parseFloat(e.target.value) || 0) * 1000) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={save}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
