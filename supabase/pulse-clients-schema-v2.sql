-- Align Pulse pages with the current clients schema.
-- Income/appointment rows store the stable client id and a display-name snapshot.

alter table pulse_income_entries add column if not exists client_id uuid references clients(id) on delete set null;
alter table pulse_income_entries add column if not exists client_name_snapshot text;

update pulse_income_entries
set client_name_snapshot = coalesce(client_name_snapshot, client_name)
where client_name_snapshot is null and client_name is not null;

alter table pulse_appointments add column if not exists client_id uuid references clients(id) on delete set null;
alter table pulse_appointments add column if not exists client_name_snapshot text;

update pulse_appointments
set client_name_snapshot = coalesce(client_name_snapshot, client_name)
where client_name_snapshot is null and client_name is not null;

create index if not exists pulse_income_entries_client_id_idx on pulse_income_entries(client_id);
create index if not exists pulse_appointments_client_id_idx on pulse_appointments(client_id);
