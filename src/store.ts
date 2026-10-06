import type { Booking, Customer, Helper, Role, ZunoData } from "./types";
import { emptyData } from "./types";

const STORAGE_KEY = "zuno.permanent.v1";

const starterHelpers: Helper[] = [
  {
    id: "hlp_kavitha",
    name: "Kavitha Murugesan",
    phone: "+91 90000 10001",
    locality: "Chromepet",
    services: ["Cleaning"],
    available: true,
  },
  {
    id: "hlp_lakshmi",
    name: "Lakshmi Devi",
    phone: "+91 90000 10002",
    locality: "Chromepet",
    services: ["Cleaning"],
    available: true,
  },
];

function read(): ZunoData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...emptyData, helpers: starterHelpers };
  try {
    return JSON.parse(raw) as ZunoData;
  } catch {
    return { ...emptyData, helpers: starterHelpers };
  }
}

function write(data: ZunoData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadData() {
  return read();
}

export function resetDemo() {
  const next = { ...emptyData, helpers: starterHelpers };
  write(next);
  return next;
}

export function registerCustomer(input: Omit<Customer, "id">) {
  const data = read();
  if (data.customers.some((c) => c.phone === input.phone)) {
    throw new Error("A customer with this phone number already exists.");
  }
  const customer: Customer = { ...input, id: `cust_${crypto.randomUUID()}` };
  const next = { ...data, customers: [...data.customers, customer], currentRole: "customer" as Role, currentUserId: customer.id };
  write(next);
  return next;
}

export function login(role: Role, userId: string) {
  const data = read();
  if (role === "customer" && !data.customers.some((c) => c.id === userId)) throw new Error("Customer not found.");
  if (role === "helper" && !data.helpers.some((h) => h.id === userId)) throw new Error("Helper not found.");
  if (role === "admin") userId = "admin";
  const next = { ...data, currentRole: role, currentUserId: userId };
  write(next);
  return next;
}

export function logout() {
  const data = read();
  const next = { ...data, currentRole: "customer" as Role, currentUserId: "" };
  write(next);
  return next;
}

export function createBooking(input: Omit<Booking, "id" | "createdAt">) {
  const data = read();
  const customer = data.customers.find((c) => c.id === input.customerId);
  const helper = data.helpers.find((h) => h.id === input.helperId);
  if (!customer) throw new Error("Booking rejected: customer ID does not exist.");
  if (!helper) throw new Error("Booking rejected: helper ID does not exist.");
  if (data.currentRole !== "customer" || data.currentUserId !== customer.id) {
    throw new Error("Booking rejected: authenticated customer does not match booking.customerId.");
  }

  const booking: Booking = {
    ...input,
    id: `book_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
  };
  const next = { ...data, bookings: [...data.bookings, booking] };
  write(next);
  return next;
}

export function updateBookingStatus(bookingId: string, status: Booking["status"]) {
  const data = read();
  const booking = data.bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error("Booking not found.");

  if (data.currentRole === "helper" && booking.helperId !== data.currentUserId) {
    throw new Error("Helper is not authorized for this booking.");
  }
  if (data.currentRole === "customer" && booking.customerId !== data.currentUserId) {
    throw new Error("Customer is not authorized for this booking.");
  }

  const bookings = data.bookings.map((b) => b.id === bookingId ? { ...b, status } : b);
  const next = { ...data, bookings };
  write(next);
  return next;
}

export function deleteAllLocalData() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...emptyData, helpers: starterHelpers };
}