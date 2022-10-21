import { LinkItem } from "./link-item";

export interface Account {
  id: string;
  user: string;
  employers: string[];
  link_item: string;
  data_partner: string;
  status: string;
  error_code: string | null;
  source: string;
  created_at: Date;
  updated_at: Date;
  connection: ConnectionStatus;
  pay_distribution: ConnectionStatus;
  availability: Availability;
  was_connected: boolean;
  link_item_details: LinkItem;
  color?: string;
}

export interface Availability {
  activities: StatusWithMeta;
  payouts: StatusWithMeta;
  documents: AvailabilityStatus;
  profiles: AvailabilityStatus;
  employments: AvailabilityStatus;
  finances: AvailabilityStatus;
  reputations: AvailabilityStatus;
  vehicles: AvailabilityStatus;
  pay_allocations: AvailabilityStatus;
  forms: AvailabilityStatus | null;
}

export interface StatusWithMeta {
  status: string;
  updated_at: Date;
  available_count: number;
  available_from: string;
  available_to: string;
}

export interface AvailabilityStatus {
  status: string;
  updated_at: Date;
}

export interface ConnectionStatus {
  status: string;
  error_code: string | null;
  error_message: string | null;
  updated_at: Date;
}
