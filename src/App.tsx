import { useMemo, useState } from "react";
import {
  createBooking,
  loadData,
  login,
  logout,
  registerCustomer,
  resetDemo,
  updateBookingStatus,
} from "./store";
import type { Role } from "./types";

export default function App() {
  const [data, setData] = useState(loadData);
  const [notice, setNotice] = useState("");
  const [showRegister, setShowRegister] = useState(data.customers.length === 0);
  const [registerForm, setRegisterForm] = useState({
    name: "Test Customer Kavitha Flow",
    phone: "+91 90000 00002",
    email: "customer.kavitha.flow@zuno.example",
    locality: "Chromepet",
    apartment: "ZUNO Residency",
    block: "A",
    flat: "402",
  });

  const currentCustomer = useMemo(
    () => data.customers.find((c) => c.id === data.currentUserId),
    [data],
  );
  const currentHelper = useMemo(
    () => data.helpers.find((h) => h.id === data.currentUserId),
    [data],
  );

  const visibleBookings = useMemo(() => {
    if (data.currentRole === "customer") {
      return data.bookings.filter((b) => b.customerId === data.currentUserId);
    }
    if (data.currentRole === "helper") {
      return data.bookings.filter((b) => b.helperId === data.currentUserId);
    }
    return data.bookings;
  }, [data]);

  function run(action: () => typeof data) {
    try {
      setData(action());
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Operation failed.");
    }
  }

  function register() {
    run(() => registerCustomer(registerForm));
    setShowRegister(false);
  }

  function createTestBooking() {
    if (!currentCustomer) {
      setNotice("Register or sign in as a customer first.");
      return;
    }
    const kavitha = data.helpers.find((h) => h.id === "hlp_kavitha");
    if (!kavitha) {
      setNotice("Kavitha helper record is missing.");
      return;
    }
    run(() =>
      createBooking({
        customerId: currentCustomer.id,
        helperId: kavitha.id,
        service: "Cleaning",
        task: "Kitchen Cleaning",
        date: "2026-10-12",
        startTime: "10:00",
        durationHours: 2,
        locality: currentCustomer.locality,
        apartment: currentCustomer.apartment,
        block: currentCustomer.block,
        flat: currentCustomer.flat,
        price: 900,
        status: "requested",
      }),
    );
  }

  const selectedBooking = visibleBookings[0];
  const selectedHelper = selectedBooking
    ? data.helpers.find((h) => h.id === selectedBooking.helperId)
    : undefined;
  const selectedCustomer = selectedBooking
    ? data.customers.find((c) => c.id === selectedBooking.customerId)
    : undefined;

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">ZUNO</span>
          <h1>Permanent Prototype</h1>
          <p>React application with persistent relational booking data.</p>
        </div>
        <div className="actions">
          {data.currentUserId ? (
            <button onClick={() => setData(logout())}>Sign out</button>
          ) : null}
          <button className="secondary" onClick={() => setData(resetDemo())}>
            Reset local prototype
          </button>
        </div>
      </header>

      <section className="rolebar">
        {(["customer", "helper", "admin"] as Role[]).map((role) => (
          <button
            key={role}
            className={data.currentRole === role ? "active" : ""}
            onClick={() => {
              if (role === "admin") run(() => login("admin", "admin"));
              else if (role === "helper") run(() => login("helper", "hlp_kavitha"));
              else if (currentCustomer) run(() => login("customer", currentCustomer.id));
              else setShowRegister(true);
            }}
          >
            {role}
          </button>
        ))}
      </section>

      {notice ? <div className="notice error">{notice}</div> : null}

      {showRegister ? (
        <section className="card auth">
          <div>
            <span className="eyebrow">CUSTOMER REGISTRATION</span>
            <h2>Create a real customer identity</h2>
            <p>This record gets a permanent ID in the prototype database.</p>
          </div>
          <div className="grid">
            {Object.entries(registerForm).map(([key, value]) => (
              <label key={key}>
                {key}
                <input
                  value={value}
                  onChange={(e) =>
                    setRegisterForm((current) => ({ ...current, [key]: e.target.value }))
                  }
                />
              </label>
            ))}
          </div>
          <button className="primary" onClick={register}>Register customer</button>
        </section>
      ) : (
        <section className="dashboard">
          <div className="card identity">
            <span className="eyebrow">CURRENT SESSION</span>
            <h2>{data.currentRole}</h2>
            <code>{data.currentUserId || "no authenticated user"}</code>
            <p>
              {currentCustomer?.name || currentHelper?.name || (data.currentRole === "admin" ? "ZUNO Administrator" : "Signed out")}
            </p>
          </div>

          <div className="card">
            <div className="section-head">
              <div>
                <span className="eyebrow">BOOKINGS</span>
                <h2>{visibleBookings.length} visible booking(s)</h2>
              </div>
              {data.currentRole === "customer" && currentCustomer ? (
                <button className="primary" onClick={createTestBooking}>Create test booking</button>
              ) : null}
            </div>

            {visibleBookings.length === 0 ? (
              <div className="empty">No bookings are visible for this authenticated identity.</div>
            ) : (
              visibleBookings.map((booking) => {
                const helper = data.helpers.find((h) => h.id === booking.helperId);
                const customer = data.customers.find((c) => c.id === booking.customerId);
                return (
                  <article className="booking" key={booking.id}>
                    <div className="booking-main">
                      <strong>{booking.service} · {booking.task}</strong>
                      <span>{booking.date} at {booking.startTime} · {booking.durationHours}h</span>
                      <span>{booking.locality} · {booking.apartment} · {booking.block}-{booking.flat}</span>
                    </div>
                    <div className="relationship">
                      <span>Booking ID <code>{booking.id}</code></span>
                      <span>Customer <b>{customer?.name ?? "Unknown"}</b> <code>{booking.customerId}</code></span>
                      <span>Helper <b>{helper?.name ?? "Unknown"}</b> <code>{booking.helperId}</code></span>
                      <span className="status">{booking.status.replaceAll("_", " ")}</span>
                    </div>
                    <div className="booking-actions">
                      {data.currentRole === "helper" ? (
                        <>
                          <button onClick={() => run(() => updateBookingStatus(booking.id, "accepted"))}>Accept</button>
                          <button onClick={() => run(() => updateBookingStatus(booking.id, "on_the_way"))}>On the way</button>
                          <button onClick={() => run(() => updateBookingStatus(booking.id, "completed"))}>Complete</button>
                        </>
                      ) : null}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {selectedBooking ? (
            <div className="card verification">
              <span className="eyebrow">RELATIONSHIP CHECK</span>
              <h2>Truth-mode verification</h2>
              <ul>
                <li>booking.id: <code>{selectedBooking.id}</code></li>
                <li>booking.customerId: <code>{selectedBooking.customerId}</code> → {selectedCustomer?.name}</li>
                <li>booking.helperId: <code>{selectedBooking.helperId}</code> → {selectedHelper?.name}</li>
                <li>Current role: <code>{data.currentRole}</code></li>
                <li>Visible because identity matches the booking foreign key.</li>
              </ul>
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}