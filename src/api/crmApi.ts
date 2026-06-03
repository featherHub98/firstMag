import { invoke } from "@tauri-apps/api/core";
import type {
  CreatePartnerFollowUp,
  CreatePartnerReclamation,
  PartnerFollowUp,
  PartnerKpis,
  PartnerProfile,
  PartnerReclamation,
  UpdatePartnerFollowUpStatus,
  UpdatePartnerReclamationStatus,
  UpsertPartnerProfile,
} from "../types";

export async function getPartnerProfile(partnerId: string): Promise<PartnerProfile> {
  return invoke("get_partner_profile", { partnerId });
}

export async function upsertPartnerProfile(cmd: UpsertPartnerProfile): Promise<PartnerProfile> {
  return invoke("upsert_partner_profile", { cmd });
}

export async function getPartnerKpis(partnerId: string): Promise<PartnerKpis> {
  return invoke("get_partner_kpis", { partnerId });
}

export async function listPartnerFollowups(partnerId: string): Promise<PartnerFollowUp[]> {
  return invoke("list_partner_followups", { partnerId });
}

export async function createPartnerFollowup(cmd: CreatePartnerFollowUp): Promise<PartnerFollowUp> {
  return invoke("create_partner_followup", { cmd });
}

export async function updatePartnerFollowupStatus(
  cmd: UpdatePartnerFollowUpStatus,
): Promise<PartnerFollowUp> {
  return invoke("update_partner_followup_status", { cmd });
}

export async function listPartnerReclamations(partnerId?: string): Promise<PartnerReclamation[]> {
  return invoke("list_partner_reclamations", { partnerId });
}

export async function createPartnerReclamation(
  cmd: CreatePartnerReclamation,
): Promise<PartnerReclamation> {
  return invoke("create_partner_reclamation", { cmd });
}

export async function updatePartnerReclamationStatus(
  cmd: UpdatePartnerReclamationStatus,
): Promise<PartnerReclamation> {
  return invoke("update_partner_reclamation_status", { cmd });
}
