import * as React from "react";
import {
  createPartnerFollowup,
  createPartnerReclamation,
  fmtDinars,
  getPartnerKpis,
  getPartnerProfile,
  listPartnerFollowups,
  listPartnerReclamations,
  listPartners,
  updatePartnerFollowupStatus,
  updatePartnerReclamationStatus,
  upsertPartnerProfile,
} from "../api";
import { useToastStore } from "../api/toastStore";
import type {
  CreatePartnerReclamation,
  Partner,
  PartnerFollowUp,
  PartnerKpis,
  PartnerReclamation,
  UpsertPartnerProfile,
} from "../types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const emptyProfile = (partnerId: string): UpsertPartnerProfile => ({
  partner_id: partnerId,
  fiscal_address: "",
  commercial_contact: "",
  payment_model: "",
  shipping_address: "",
  currency_code: "TND",
  credit_control_enabled: false,
  loyalty_barcode: "",
  family_segment: "",
  milestone_tier: "",
  deferred_discount_rate: 0,
  global_discount_millimes: 0,
  allow_deferred_payment: false,
  deposit_balance: 0,
  last_visit_at: null,
  notes_ext: "",
});

export default function CrmPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = React.useState<string>("");
  const [profile, setProfile] = React.useState<UpsertPartnerProfile | null>(null);
  const [kpis, setKpis] = React.useState<PartnerKpis | null>(null);
  const [followups, setFollowups] = React.useState<PartnerFollowUp[]>([]);
  const [reclamations, setReclamations] = React.useState<PartnerReclamation[]>([]);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [followupForm, setFollowupForm] = React.useState({
    subject: "",
    due_date: "",
    priority: "1",
    notes: "",
  });
  const [reclamationForm, setReclamationForm] = React.useState<CreatePartnerReclamation>({
    partner_id: null,
    title: "",
    description: "",
    severity: "medium",
    source: "client",
  });

  React.useEffect(() => {
    void loadPartners();
  }, []);

  async function loadPartners() {
    try {
      const rows = await listPartners("client");
      setPartners(rows);
      if (rows.length > 0 && !selectedPartnerId) {
        void selectPartner(rows[0].id);
      }
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function selectPartner(partnerId: string) {
    setSelectedPartnerId(partnerId);
    try {
      const [profileRow, kpiRow, followupRows, reclamationRows] = await Promise.all([
        getPartnerProfile(partnerId),
        getPartnerKpis(partnerId),
        listPartnerFollowups(partnerId),
        listPartnerReclamations(partnerId),
      ]);
      setProfile({
        ...profileRow,
        last_visit_at: profileRow.last_visit_at ? profileRow.last_visit_at.slice(0, 10) : null,
      });
      setKpis(kpiRow);
      setFollowups(followupRows);
      setReclamations(reclamationRows);
      setReclamationForm((prev) => ({ ...prev, partner_id: partnerId }));
    } catch (e) {
      addToast(String(e), "error");
      setProfile(emptyProfile(partnerId));
      setKpis(null);
      setFollowups([]);
      setReclamations([]);
    }
  }

  async function saveProfile() {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const saved = await upsertPartnerProfile({
        ...profile,
        last_visit_at: profile.last_visit_at || null,
      });
      setProfile({
        ...saved,
        last_visit_at: saved.last_visit_at ? saved.last_visit_at.slice(0, 10) : null,
      });
      addToast("Profil client enregistre", "success");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function addFollowup() {
    if (!selectedPartnerId || !followupForm.subject.trim()) {
      addToast("Sujet de suivi requis", "error");
      return;
    }
    try {
      await createPartnerFollowup({
        partner_id: selectedPartnerId,
        subject: followupForm.subject.trim(),
        due_date: followupForm.due_date ? new Date(followupForm.due_date).toISOString() : null,
        priority: parseInt(followupForm.priority || "1", 10),
        notes: followupForm.notes,
      });
      setFollowupForm({ subject: "", due_date: "", priority: "1", notes: "" });
      setFollowups(await listPartnerFollowups(selectedPartnerId));
      setKpis(await getPartnerKpis(selectedPartnerId));
      addToast("Suivi ajoute", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function setFollowupStatus(id: string, status: "pending" | "done" | "cancelled") {
    if (!selectedPartnerId) return;
    try {
      await updatePartnerFollowupStatus({ id, status });
      setFollowups(await listPartnerFollowups(selectedPartnerId));
      setKpis(await getPartnerKpis(selectedPartnerId));
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function addReclamation() {
    if (!reclamationForm.title.trim()) {
      addToast("Titre de reclamation requis", "error");
      return;
    }
    try {
      await createPartnerReclamation(reclamationForm);
      const rows = await listPartnerReclamations(selectedPartnerId || undefined);
      setReclamations(rows);
      if (selectedPartnerId) setKpis(await getPartnerKpis(selectedPartnerId));
      setReclamationForm((prev) => ({ ...prev, title: "", description: "" }));
      addToast("Reclamation ajoutee", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function setReclamationStatus(id: string, status: "open" | "in_progress" | "resolved" | "closed") {
    try {
      await updatePartnerReclamationStatus({ id, status });
      setReclamations(await listPartnerReclamations(selectedPartnerId || undefined));
      if (selectedPartnerId) setKpis(await getPartnerKpis(selectedPartnerId));
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  return (
    <div className="h-full overflow-y-auto space-y-4">
      <PageHeader
        title="CRM et fidelite"
        description="Profil commercial client, suivis et reclamations"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Client</Label>
              <Select value={selectedPartnerId} onValueChange={(v) => void selectPartner(v)}>
                <SelectTrigger><SelectValue placeholder="Selectionner un client" /></SelectTrigger>
                <SelectContent>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Loyalty barcode</Label>
              <Input
                value={profile?.loyalty_barcode ?? ""}
                onChange={(e) => profile && setProfile({ ...profile, loyalty_barcode: e.target.value })}
                placeholder="Carte fidelite"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="CA Annee" value={`${fmtDinars(kpis.yearly_total_ttc)} D`} />
          <StatCard label="CA Mois" value={`${fmtDinars(kpis.monthly_total_ttc)} D`} />
          <StatCard label="Factures Annee" value={String(kpis.yearly_invoice_count)} />
          <StatCard label="Suivis en attente" value={String(kpis.pending_followups)} />
          <StatCard label="Reclamations ouvertes" value={String(kpis.open_reclamations)} />
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil client</TabsTrigger>
          <TabsTrigger value="followups">Suivis</TabsTrigger>
          <TabsTrigger value="reclamations">Reclamations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profil commercial et fidelite</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Contact commercial" value={profile.commercial_contact} onChange={(v) => setProfile({ ...profile, commercial_contact: v })} />
                    <Field label="Mode paiement" value={profile.payment_model} onChange={(v) => setProfile({ ...profile, payment_model: v })} />
                    <Field label="Devise" value={profile.currency_code} onChange={(v) => setProfile({ ...profile, currency_code: v })} />
                    <Field label="Segment famille" value={profile.family_segment} onChange={(v) => setProfile({ ...profile, family_segment: v })} />
                    <Field label="Palier fidelite" value={profile.milestone_tier} onChange={(v) => setProfile({ ...profile, milestone_tier: v })} />
                    <div className="space-y-1.5">
                      <Label>Derniere visite</Label>
                      <Input
                        type="date"
                        value={profile.last_visit_at ?? ""}
                        onChange={(e) => setProfile({ ...profile, last_visit_at: e.target.value || null })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Remise differee (%)</Label>
                      <Input
                        type="number"
                        step="1"
                        value={profile.deferred_discount_rate}
                        onChange={(e) => setProfile({ ...profile, deferred_discount_rate: parseInt(e.target.value || "0", 10) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Remise globale auto (D)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={profile.global_discount_millimes / 1000}
                        onChange={(e) => setProfile({ ...profile, global_discount_millimes: Math.round((parseFloat(e.target.value) || 0) * 1000) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Acompte / depot (D)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={profile.deposit_balance / 1000}
                        onChange={(e) => setProfile({ ...profile, deposit_balance: Math.round((parseFloat(e.target.value) || 0) * 1000) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Adresse fiscale</Label>
                      <Textarea value={profile.fiscal_address} onChange={(e) => setProfile({ ...profile, fiscal_address: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Adresse livraison</Label>
                      <Textarea value={profile.shipping_address} onChange={(e) => setProfile({ ...profile, shipping_address: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Notes CRM</Label>
                    <Textarea value={profile.notes_ext} onChange={(e) => setProfile({ ...profile, notes_ext: e.target.value })} />
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={profile.credit_control_enabled}
                        onCheckedChange={(checked) => setProfile({ ...profile, credit_control_enabled: checked })}
                      />
                      <span className="text-sm">Controle credit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={profile.allow_deferred_payment}
                        onCheckedChange={(checked) => setProfile({ ...profile, allow_deferred_payment: checked })}
                      />
                      <span className="text-sm">Autoriser paiement differe</span>
                    </div>
                  </div>

                  <Button onClick={() => void saveProfile()} disabled={savingProfile}>
                    {savingProfile ? "Enregistrement..." : "Enregistrer profil"}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Selectionnez un client.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followups">
          <Card>
            <CardHeader><CardTitle>Visites et suivis</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input placeholder="Sujet" value={followupForm.subject} onChange={(e) => setFollowupForm({ ...followupForm, subject: e.target.value })} />
                <Input type="date" value={followupForm.due_date} onChange={(e) => setFollowupForm({ ...followupForm, due_date: e.target.value })} />
                <Input type="number" min={1} max={3} value={followupForm.priority} onChange={(e) => setFollowupForm({ ...followupForm, priority: e.target.value })} />
                <Button onClick={() => void addFollowup()}>Ajouter suivi</Button>
              </div>
              <Textarea placeholder="Notes de suivi" value={followupForm.notes} onChange={(e) => setFollowupForm({ ...followupForm, notes: e.target.value })} />

              <div className="space-y-2">
                {followups.map((f) => (
                  <div key={f.id} className="rounded border p-2 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{f.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        Echeance: {f.due_date ? new Date(f.due_date).toLocaleDateString("fr-FR") : "-"} | Priorite: {f.priority}
                      </div>
                      {f.notes && <div className="text-sm mt-1">{f.notes}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={f.status === "done" ? "success" : f.status === "cancelled" ? "secondary" : "warning"}>{f.status}</Badge>
                      <Select value={f.status} onValueChange={(v) => void setFollowupStatus(f.id, v as "pending" | "done" | "cancelled")}>
                        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="done">done</SelectItem>
                          <SelectItem value="cancelled">cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                {followups.length === 0 && <div className="text-sm text-muted-foreground">Aucun suivi.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reclamations">
          <Card>
            <CardHeader><CardTitle>Reclamations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input placeholder="Titre reclamation" value={reclamationForm.title} onChange={(e) => setReclamationForm({ ...reclamationForm, title: e.target.value })} />
                <Select value={reclamationForm.severity} onValueChange={(v) => setReclamationForm({ ...reclamationForm, severity: v as CreatePartnerReclamation["severity"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">low</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="high">high</SelectItem>
                    <SelectItem value="critical">critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={reclamationForm.source} onValueChange={(v) => setReclamationForm({ ...reclamationForm, source: v as CreatePartnerReclamation["source"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">client</SelectItem>
                    <SelectItem value="supplier">supplier</SelectItem>
                    <SelectItem value="internal">internal</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => void addReclamation()}>Ajouter reclamation</Button>
              </div>
              <Textarea placeholder="Description" value={reclamationForm.description} onChange={(e) => setReclamationForm({ ...reclamationForm, description: e.target.value })} />

              <div className="space-y-2">
                {reclamations.map((r) => (
                  <div key={r.id} className="rounded border p-2 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">Severity: {r.severity} | Source: {r.source}</div>
                      {r.description && <div className="text-sm mt-1">{r.description}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.status === "resolved" || r.status === "closed" ? "success" : r.status === "in_progress" ? "warning" : "secondary"}>
                        {r.status}
                      </Badge>
                      <Select value={r.status} onValueChange={(v) => void setReclamationStatus(r.id, v as "open" | "in_progress" | "resolved" | "closed")}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">open</SelectItem>
                          <SelectItem value="in_progress">in_progress</SelectItem>
                          <SelectItem value="resolved">resolved</SelectItem>
                          <SelectItem value="closed">closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                {reclamations.length === 0 && <div className="text-sm text-muted-foreground">Aucune reclamation.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
