(() => {
  "use strict";

  const BANK = [
    ["Apr 2", "Razorpay Settlement", 15000, "Rental Revenue"],
    ["Apr 2", "UPI – Rahul Sharma", 10000, "Deposit"],
    ["Apr 3", "Vendor Laptop Repair", -2500, "Expense"],
    ["Apr 4", "BillDesk Settlement", 5000, "Rental Revenue"],
    ["Apr 5", "Bank Charges", -295, "Expense"],
    ["Apr 6", "UPI – Unknown", 3000, "Suspense"],
    ["Apr 7", "Order Refund – Rahul Sharma", -2000, "Rental Refund"],
    ["Apr 8", "Office Rent", -15000, "Expense"],
    ["Apr 9", "Razorpay Settlement", 15000, "Rental Revenue"],
    ["Apr 10", "ATM Withdrawal", -5000, "Petty Cash"],
    ["Apr 12", "Deposit Refund – Priya Mehta", -10000, "Deposit Refund"],
    ["Apr 13", "Vendor Accessories", -3200, "Expense"],
    ["Apr 14", "UPI – Karan Singh", 10000, "Deposit"],
    ["Apr 15", "BillDesk Settlement", 5000, "Rental Revenue"],
    ["Apr 16", "UPI – Unknown", 7500, "Suspense"],
    ["Apr 18", "Order Refund – Aman Gupta", -3000, "Rental Refund"],
    ["Apr 20", "Internet Bill", -1200, "Expense"],
    ["Apr 22", "Razorpay Settlement", 15000, "Rental Revenue"],
    ["Apr 24", "Deposit Refund – Karan Singh", -10000, "Deposit Refund"],
    ["Apr 25", "UPI – Unknown", 2500, "Suspense"],
    ["Apr 26", "Salary", -25000, "Expense"],
    ["Apr 27", "Bank Charges", -350, "Expense"],
    ["Apr 28", "UPI – Sneha Jain", 2000, "Rental Revenue"],
    ["Apr 29", "Order Refund – Sneha Jain", -2000, "Rental Refund"],
  ].map(([date, desc, amt, cls]) => ({ date, desc, amt, cls }));

  const inr = (n) => Math.abs(Math.round(n)).toLocaleString("en-IN");
  const signed = (n) => (n > 0 ? "+" : "−") + inr(n);
  const total = (classes) => BANK.filter((r) => classes.includes(r.cls)).reduce((s, r) => s + r.amt, 0);

  const pct = (a, b) => Math.round((a / b) * 100) + "%";
  const by = (re) => Math.abs(BANK.filter((r) => re.test(r.desc)).reduce((s, r) => s + r.amt, 0));
  const REV = total(["Rental Revenue"]);
  const RREF = -total(["Rental Refund"]);
  const DREF = -total(["Deposit Refund"]);
  const DEP = total(["Deposit"]);
  const EXP = -total(["Expense"]);
  const NET = REV - RREF;
  const IN = BANK.filter((r) => r.amt > 0).reduce((s, r) => s + r.amt, 0);

  const METRICS = [
    { label: "Total Revenue", value: REV, formula: '=SUMIF(D2:D25,"Rental Revenue",C2:C25)',
      parts: [["Razorpay", by(/Razorpay/)], ["BillDesk", by(/BillDesk/)], ["Direct UPI", 2000]],
      insights: [
        `Razorpay brings in ${pct(by(/Razorpay/), REV)} of revenue, in three equal ₹15,000 settlements.`,
        "BillDesk adds ₹10,000 across two ₹5,000 settlements.",
        "The only direct UPI rent (Sneha, ₹2,000) was refunded in full the next day.",
        "Settlements arrive net of gateway fees and GST, so gross revenue is higher. The gateway reports give the true figure.",
      ] },
    { label: "Net Revenue", value: NET, formula: "=H9-H18",
      parts: [["Total revenue", REV], ["Rental refunds", -RREF]],
      insights: [
        `${pct(RREF, REV)} of rent was refunded (₹${inr(RREF)} across Rahul, Aman and Sneha).`,
        "Aman's ₹3,000 refund has no matching receipt in April, so it relates to an earlier month.",
        "₹13,000 of unidentified UPI receipts sits in suspense. If it traces back to rent, net revenue rises to ₹63,000.",
      ] },
    { label: "Total Deposits", value: DEP, formula: '=SUMIF(D2:D25,"Deposit",C2:C25)',
      parts: [["Rahul Sharma", 10000], ["Karan Singh", 10000]],
      insights: [
        "Deposits are a liability, money owed back to customers, so they stay out of revenue.",
        `₹${inr(DREF)} was refunded in the same month (Priya, Karan), so the net movement is nil.`,
        "Karan's deposit went back within 10 days of being received.",
        "₹10,000 is still held at month end (Rahul).",
      ] },
    { label: "Total Expenses", value: EXP, formula: '=ABS(SUMIF(D2:D25,"Expense",C2:C25))',
      parts: [["Salary", 25000], ["Office rent", 15000], ["Accessories", 3200], ["Laptop repair", 2500], ["Internet", 1200], ["Bank charges", 645]],
      insights: [
        `Salary and rent make up ${pct(40000, EXP)} of spending.`,
        `Expenses take ${pct(EXP, NET)} of net revenue, leaving a thin margin.`,
        "Repairs and accessories (₹5,700) are the cost of keeping laptops rentable.",
        "The ₹5,000 ATM withdrawal isn't counted here. It stays in petty cash until bills come in.",
      ] },
    { label: "Total Refunds", value: RREF + DREF, formula: "=H18+H21",
      parts: [["Deposit refunds", DREF], ["Rental refunds", RREF]],
      insights: [
        `${pct(RREF + DREF, IN)} of all money received in April went back out as refunds.`,
        `Deposit refunds are ${pct(DREF, RREF + DREF)} of the total and reduce the liability, not revenue.`,
        "Priya's deposit refund and Aman's order refund have no matching April receipt.",
      ] },
  ];

  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  /* ----- Scroll-driven opening ----- */
  const hero = document.querySelector(".hero");
  const stage = document.querySelector(".hero-stage");
  const screen = document.getElementById("screen");
  const dl = document.getElementById("download");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v) => Math.min(1, Math.max(0, v));

  function frame() {
    const r = hero.getBoundingClientRect();
    const p = reduce ? 1 : clamp(-r.top / (r.height - innerHeight));
    const t = clamp(p / 0.75);
    const o = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const d = clamp((p - 0.7) / 0.15);
    const s = hero.style;
    s.setProperty("--p", p.toFixed(3));
    s.setProperty("--lid", (-87.5 + o * 107.5).toFixed(2) + "deg");
    s.setProperty("--tilt", (-58 + o * 40).toFixed(2) + "deg");
    s.setProperty("--ty", (-46 + o * 30).toFixed(2) + "%");
    s.setProperty("--zoom", (0.8 + o * 0.2).toFixed(3));
    s.setProperty("--d", d.toFixed(3));
    dl.classList.toggle("on", d > 0.5);
    dl.tabIndex = d > 0.5 ? 0 : -1;
    // centre the (flat) download link on the laptop screen
    const sr = screen.getBoundingClientRect();
    const st = stage.getBoundingClientRect();
    dl.style.left = sr.left + sr.width / 2 - st.left + "px";
    dl.style.top = sr.top + sr.height / 2 - st.top + "px";
  }
  let busy = false;
  addEventListener("scroll", () => { if (!busy) { busy = true; requestAnimationFrame(() => { frame(); busy = false; }); } }, { passive: true });
  addEventListener("resize", frame);
  frame();

  /* ----- Dashboard ----- */
  const panel = document.getElementById("insight");
  const kpis = document.getElementById("kpis");
  let active = null;
  const buttons = METRICS.map((m) => {
    const b = el("button", "kpi");
    b.setAttribute("aria-pressed", "false");
    b.append(el("span", "", m.label), el("b", "", "₹" + inr(m.value)));
    b.addEventListener("click", (e) => { e.stopPropagation(); active = active === m ? null : m; paint(); });
    kpis.append(b);
    return b;
  });

  function paint() {
    buttons.forEach((b, i) => b.setAttribute("aria-pressed", String(METRICS[i] === active)));
    panel.replaceChildren();
    panel.classList.toggle("open", !!active);
    if (!active) { panel.append(el("p", "hint", "Tap a number to see what's behind it.")); return; }
    const m = active;
    const head = el("div", "i-head");
    head.append(el("h3", "", m.label), el("code", "", m.formula));
    const max = Math.max(...m.parts.map((p) => Math.abs(p[1])));
    const bars = el("div", "parts");
    m.parts.forEach(([label, v]) => {
      const row = el("div", "part" + (v < 0 ? " neg" : ""));
      const track = el("div", "track"); const fill = el("i"); track.append(fill);
      row.append(el("span", "", label), track, el("span", "v", (v < 0 ? "−" : "") + inr(v)));
      bars.append(row);
      requestAnimationFrame(() => { fill.style.width = (Math.abs(v) / max) * 100 + "%"; });
    });
    const list = el("ul", "insights");
    m.insights.forEach((t) => list.append(el("li", "", t)));
    panel.append(head, bars, list);
  }
  panel.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", () => { if (active) { active = null; paint(); } });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && active) { active = null; paint(); } });
  paint();
})();
