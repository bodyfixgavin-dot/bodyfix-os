export const PULSE_CLIENT_SELECT = "id, display_name, nickname, client_name, contact_method, line_id, ig_id, phone, main_issue, last_visit_date, status";

export type PulseClient = {
  id: string;
  display_name: string;
  nickname?: string | null;
  client_name?: string | null;
  contact_method?: string | null;
  line_id?: string | null;
  ig_id?: string | null;
  phone?: string | null;
  main_issue?: string | null;
  last_visit_date?: string | null;
  status?: string | null;
};

export function pulseClientLabel(client: Pick<PulseClient, "display_name" | "nickname">) {
  return client.nickname ? `${client.nickname} / ${client.display_name}` : client.display_name;
}
