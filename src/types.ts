export type Role = "customer" | "helper" | "admin";

export type BookingStatus =
  | "requested"
  | "helper_assigned"
  | "accepted"
  | "on_the_way"
  | "completed"
  | "cancelled";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  locality: string;
  apartment: string;
  block: string;
  flat: string;
}

export interface Helper {
  id: string;
  name: string;
  phone: string;
  locality: string;
  services: string[];
  available: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  helperId: string;
  service: string;
  task: string;
  date: string;
  startTime: string;
  durationHours: number;
  locality: string;
  apartment: string;
  block: string;
  flat: string;
  price: number;
  status: BookingStatus;
  createdAt: string;
}

export interface ZunoData {
  customers: Customer[];
  helpers: Helper[];
  bookings: Booking[];
  currentRole: Role;
  currentUserId: string;
}

export const emptyData: ZunoData = {
  customers: [],
  helpers: [],
  bookings: [],
  currentRole: "customer",
  currentUserId: "",
};