(function () {
  "use strict";

  var STORAGE_KEY = "umoja-demo-gifts-v1";
  var STARTING_GIVERS = 1284;
  var VOUCHER_VALUE = 10;
  var FOOD_SHARE = 0.85;

  var SEED_TRANSACTIONS = [
    { date: "2026-11-12", label: "Monthly payroll gifts", detail: "1,284 givers · Stripe, PayPal, SoFi", kind: "in", cat: "inflow", amount: 9000 },
    { date: "2026-11-12", label: "Payment processing", detail: "Card, bank and payroll fees", kind: "out", cat: "fees", amount: -450 },
    { date: "2026-11-11", label: "Twin Cities African Market", detail: "480 vouchers · Minneapolis, MN", kind: "out", cat: "food", amount: -2400 },
    { date: "2026-11-10", label: "Houston Afro Foods", detail: "390 vouchers · Houston, TX", kind: "out", cat: "food", amount: -1950 },
    { date: "2026-11-08", label: "Atlanta Little Africa", detail: "360 vouchers · Atlanta, GA", kind: "out", cat: "food", amount: -1800 },
    { date: "2026-11-05", label: "Bronx Market Row", detail: "300 vouchers · Bronx, NY", kind: "out", cat: "food", amount: -1500 },
    { date: "2026-11-04", label: "Caseworker time and translation", detail: "Family verification and store support", kind: "out", cat: "ops", amount: -420 },
    { date: "2026-11-03", label: "Insurance and accounting", detail: "Monthly policy and bookkeeping", kind: "out", cat: "ops", amount: -210 }
  ];

  var METHOD_NAMES = {
    sofi: "SoFi payroll",
    stripe: "Stripe card",
    paypal: "PayPal"
  };

  var METHOD_NOTES = {
    sofi: "SoFi payroll gifts carry no card fee. Connect your employer account on the next step.",
    stripe: "Stripe adds 2.9% + 30¢ per gift. The ledger shows the fee separately.",
    paypal: "PayPal adds 2.9% + 30¢ per gift. The ledger shows the fee separately."
  };

  var CAPTIONS = {
    instagram: "What if $5 bought someone a week of groceries? I give $5 a month to Umoja. The pool becomes $10 food vouchers at African-owned markets, and the ledger is public. Join the $5 table. #TheFiveDollarTable https://umoja.example",
    linkedin: "Our team gives $1 to $10 a paycheck. In November, 85% of the Umoja pool became $10 food vouchers at African-owned markets. The ledger, the operating cap and the next voucher batch are all public. Here is where the money went: https://umoja.example/ledger #TheFiveDollarTable",
    whatsapp: "I set up $5 a month with Umoja. It took about 40 seconds, and it comes out of my paycheck. The money becomes food vouchers at African stores. Join me? https://umoja.example",
    share: "I set the table with a small monthly gift to Umoja. $1 to $10 becomes food vouchers at African-owned markets, and the ledger is public. Join the $5 table. https://umoja.example"
  };

  var state = {
    amount: 5,
    method: "sofi",
    filter: "all",
    localGifts: loadGifts(),
    lastName: "",
    syncLabel: "2 min ago"
  };

  var giveDialog = document.getElementById("give-dialog");
  var deskDialog = document.getElementById("fund-desk");
  var giveForm = document.getElementById("give-form");
  var formError = document.getElementById("form-error");
  var submitButton = document.getElementById("submit-gift");
  var toastTimer = null;

  function loadGifts() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (gift) {
        return gift && typeof gift.amount === "number" && gift.date && gift.label;
      }).slice(0, 40);
    } catch (error) {
      return [];
    }
  }

  function saveGifts() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.localGifts.slice(0, 40)));
    } catch (error) {
      /* The ledger still updates in memory when storage is unavailable. */
    }
  }

  function money(value) {
    return "$" + Math.round(Math.abs(value)).toLocaleString("en-US");
  }

  function number(value) {
    return Number(value).toLocaleString("en-US");
  }

  function parseDate(iso) {
    return new Date(iso + "T12:00:00");
  }

  function shortDate(iso) {
    return parseDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function allTransactions() {
    return state.localGifts.concat(SEED_TRANSACTIONS).slice().sort(function (a, b) {
      return parseDate(b.date) - parseDate(a.date);
    });
  }

  function totals() {
    var rows = allTransactions();
    var result = { inflow: 0, food: 0, ops: 0, fees: 0, out: 0, reserve: 0, vouchers: 0, givers: STARTING_GIVERS + state.localGifts.length };
    rows.forEach(function (row) {
      if (row.amount > 0) {
        result.inflow += row.amount;
      } else {
        result.out += Math.abs(row.amount);
        if (row.cat === "food") result.food += Math.abs(row.amount);
        if (row.cat === "ops") result.ops += Math.abs(row.amount);
        if (row.cat === "fees") result.fees += Math.abs(row.amount);
      }
    });
    result.reserve = Math.max(0, result.inflow - result.out);
    result.vouchers = Math.floor(result.food / VOUCHER_VALUE);
    return result;
  }

  function renderLive() {
    var data = totals();
    var values = {
      inflow: money(data.inflow),
      food: money(data.food),
      ops: money(data.ops),
      fees: money(data.fees),
      reserve: money(data.reserve),
      vouchers: number(data.vouchers),
      givers: number(data.givers),
      sync: state.syncLabel
    };

    document.querySelectorAll("[data-live]").forEach(function (node) {
      var key = node.getAttribute("data-live");
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        node.textContent = values[key];
      }
    });
  }

  function annualVouchers(amount) {
    return Math.max(1, Math.round((amount * 12 * FOOD_SHARE) / VOUCHER_VALUE));
  }

  function setAmount(amount) {
    var next = Math.min(10, Math.max(1, Math.round(Number(amount))));
    state.amount = next;

    document.querySelectorAll("[data-amount]").forEach(function (button) {
      var selected = Number(button.getAttribute("data-amount")) === next;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    document.querySelectorAll("[data-dialog-amount]").forEach(function (button) {
      var selected = Number(button.getAttribute("data-dialog-amount")) === next;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    ["amount-range", "dialog-amount"].forEach(function (id) {
      var input = document.getElementById(id);
      if (input && Number(input.value) !== next) input.value = String(next);
    });

    var output = document.getElementById("dialog-amount-output");
    if (output) output.textContent = "$" + next;

    document.querySelectorAll("[data-amount-display]").forEach(function (node) {
      node.textContent = "$" + next;
    });

    document.querySelectorAll("[data-out-vouchers]").forEach(function (node) {
      node.textContent = String(annualVouchers(next));
    });

    updateSummary();
  }

  function updateSummary() {
    document.querySelectorAll("[data-summary-amount]").forEach(function (node) {
      node.textContent = "$" + state.amount;
    });
    document.querySelectorAll("[data-summary-method]").forEach(function (node) {
      node.textContent = METHOD_NAMES[state.method];
    });
    document.querySelectorAll("[data-summary-vouchers]").forEach(function (node) {
      node.textContent = String(annualVouchers(state.amount));
    });
  }

  function setStep(step) {
    document.querySelectorAll(".give-step").forEach(function (section) {
      section.hidden = Number(section.getAttribute("data-step")) !== step;
    });

    document.querySelectorAll("[data-step-label]").forEach(function (label) {
      var number = Number(label.getAttribute("data-step-label"));
      label.classList.toggle("is-active", number === step);
      label.classList.toggle("is-complete", number < step);
    });

    if (step === 2) {
      updateSummary();
      window.setTimeout(function () {
        var name = document.getElementById("donor-name");
        if (name) name.focus();
      }, 40);
    }

    if (step === 3) {
      var dialog = document.querySelector(".give-dialog");
      if (dialog) dialog.scrollTop = 0;
    }
  }

  function openGive() {
    if (!giveDialog) return;
    setStep(1);
    hideFormError();
    giveDialog.showModal();
    document.body.style.overflow = "hidden";
    window.setTimeout(function () {
      var active = document.querySelector(".give-dialog [data-dialog-amount].is-selected");
      if (active) active.focus();
    }, 50);
  }

  function closeGive() {
    if (giveDialog && giveDialog.open) giveDialog.close();
  }

  function openDesk() {
    if (!deskDialog) return;
    deskDialog.showModal();
    document.body.style.overflow = "hidden";
  }

  function closeDesk() {
    if (deskDialog && deskDialog.open) deskDialog.close();
  }

  function hideFormError() {
    if (!formError) return;
    formError.hidden = true;
    formError.textContent = "";
  }

  function showFormError(message) {
    if (!formError) return;
    formError.textContent = message;
    formError.hidden = false;
  }

  function renderLedger() {
    var body = document.getElementById("ledger-body");
    if (!body) return;

    var rows = allTransactions().filter(function (row) {
      if (state.filter === "all") return true;
      if (state.filter === "in") return row.kind === "in";
      if (state.filter === "food") return row.cat === "food";
      if (state.filter === "ops") return row.cat === "ops" || row.cat === "fees";
      return true;
    });

    body.innerHTML = rows.map(function (row) {
      var catLabel = row.cat === "food" ? "Food vouchers" : row.cat === "ops" ? "Operations" : row.cat === "fees" ? "Payment fees" : "Inflow";
      var catClass = row.cat === "food" ? "cat cat--food" : row.cat === "inflow" ? "cat cat--in" : "cat";
      var amountClass = row.amount > 0 ? "num amount--in" : "num amount--out";
      var amountText = row.amount > 0 ? "+" + money(row.amount) : "-" + money(row.amount);
      return '<tr data-kind="' + escapeHtml(row.kind) + '" data-cat="' + escapeHtml(row.cat) + '">' +
        "<td>" + escapeHtml(shortDate(row.date)) + "</td>" +
        "<td><strong>" + escapeHtml(row.label) + '</strong><span class="row-detail">' + escapeHtml(row.detail) + "</span></td>" +
        '<td><span class="' + catClass + '">' + catLabel + "</span></td>" +
        '<td class="' + amountClass + '">' + amountText + "</td>" +
        "</tr>";
    }).join("");

    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="4">No rows match this filter.</td></tr>';
    }

    document.querySelectorAll("[data-filter]").forEach(function (button) {
      var active = button.getAttribute("data-filter") === state.filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderDeskActivity() {
    var list = document.getElementById("desk-activity");
    if (!list) return;
    var rows = allTransactions().slice(0, 4);
    list.innerHTML = rows.map(function (row) {
      var amountClass = row.amount > 0 ? "amount--in" : "amount--out";
      var amountText = row.amount > 0 ? "+" + money(row.amount) : "-" + money(row.amount);
      return "<li><span>" + escapeHtml(shortDate(row.date)) + "</span><strong>" + escapeHtml(row.label) +
        '</strong><span class="' + amountClass + '">' + amountText + "</span></li>";
    }).join("");
  }

  function renderAll() {
    renderLive();
    renderLedger();
    renderDeskActivity();
  }

  function addGift(name, email, phone, method, amount, emailOpt, smsOpt) {
    var today = new Date();
    var iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    var gift = {
      date: iso,
      label: "Your monthly gift",
      detail: METHOD_NAMES[method] + " · recurring",
      kind: "in",
      cat: "inflow",
      amount: amount,
      donor: name,
      email: email,
      phone: phone,
      emailOpt: Boolean(emailOpt),
      smsOpt: Boolean(smsOpt)
    };
    state.localGifts.unshift(gift);
    state.lastName = name;
    state.syncLabel = "just now";
    saveGifts();
    renderAll();
    return gift;
  }

  function showSuccess(name, amount, method, emailOpt, smsOpt) {
    document.querySelectorAll("[data-success-name]").forEach(function (node) {
      node.textContent = name;
    });
    document.querySelectorAll("[data-success-amount]").forEach(function (node) {
      node.textContent = "$" + amount + (node.textContent.indexOf("/ month") !== -1 ? " / month" : "");
    });
    document.querySelectorAll("[data-success-method]").forEach(function (node) {
      node.textContent = METHOD_NAMES[method];
    });
    document.querySelectorAll("[data-success-vouchers]").forEach(function (node) {
      node.textContent = String(annualVouchers(amount));
    });

    var emailStatus = document.querySelector('[data-msg-status="email"]');
    var smsStatus = document.querySelector('[data-msg-status="sms"]');
    if (emailStatus) {
      emailStatus.textContent = emailOpt ? "Queued" : "Skipped";
      emailStatus.className = "status " + (emailOpt ? "status--queued" : "status--draft");
    }
    if (smsStatus) {
      smsStatus.textContent = smsOpt ? "Queued" : "Skipped";
      smsStatus.className = "status " + (smsOpt ? "status--queued" : "status--draft");
    }

    setStep(3);
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function completeGift() {
    hideFormError();

    var name = document.getElementById("donor-name").value.trim();
    var email = document.getElementById("donor-email").value.trim();
    var phone = document.getElementById("donor-phone").value.trim();
    var emailOpt = document.getElementById("opt-email").checked;
    var smsOpt = document.getElementById("opt-sms").checked;
    var consent = document.getElementById("opt-consent").checked;

    if (!name) {
      showFormError("Add a first name so the thank-you can sound human.");
      document.getElementById("donor-name").focus();
      return;
    }
    if (!validEmail(email)) {
      showFormError("Add a valid email address for the receipt.");
      document.getElementById("donor-email").focus();
      return;
    }
    if (smsOpt && phone.replace(/\D/g, "").length < 7) {
      showFormError("Add a mobile number for the text, or untick the text thank-you.");
      document.getElementById("donor-phone").focus();
      return;
    }
    if (!consent) {
      showFormError("Tick the authorization box to set up a monthly gift.");
      document.getElementById("opt-consent").focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Setting up…";

    window.setTimeout(function () {
      addGift(name, email, phone, state.method, state.amount, emailOpt, smsOpt);
      showSuccess(name, state.amount, state.method, emailOpt, smsOpt);
      submitButton.disabled = false;
      submitButton.textContent = "Confirm monthly gift";
      showToast("Gift added to the demo ledger. No money moved.");
    }, 850);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    try {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var copied = document.execCommand("copy");
      document.body.removeChild(area);
      return copied;
    } catch (error) {
      return false;
    }
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    var host = (giveDialog && giveDialog.open) ? giveDialog : (deskDialog && deskDialog.open) ? deskDialog : document.body;
    if (toast.parentElement !== host) host.appendChild(toast);
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  function downloadCsv() {
    var rows = allTransactions();
    var lines = [["date", "description", "category", "amount_usd"]];
    rows.forEach(function (row) {
      lines.push([row.date, row.label, row.cat, row.amount]);
    });
    var csv = lines.map(function (line) {
      return line.map(function (cell) {
        var value = String(cell);
        return /[",\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value;
      }).join(",");
    }).join("\n");

    try {
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "umoja-ledger-november-2026.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 500);
      showToast("Ledger CSV downloaded.");
    } catch (error) {
      showToast("CSV download is not available in this browser.");
    }
  }

  function resetDemo() {
    state.localGifts = [];
    state.lastName = "";
    state.syncLabel = "2 min ago";
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      /* Nothing to clear. */
    }
    renderAll();
    showToast("Demo ledger reset to the seeded November state.");
  }

  function initEvents() {
    document.querySelectorAll("[data-open-give]").forEach(function (button) {
      button.addEventListener("click", openGive);
    });

    document.querySelectorAll("[data-close-give]").forEach(function (button) {
      button.addEventListener("click", closeGive);
    });

    document.querySelectorAll("[data-open-desk]").forEach(function (button) {
      button.addEventListener("click", openDesk);
    });

    document.querySelectorAll("[data-close-desk]").forEach(function (button) {
      button.addEventListener("click", closeDesk);
    });

    document.querySelectorAll("[data-amount]").forEach(function (button) {
      button.addEventListener("click", function () {
        setAmount(button.getAttribute("data-amount"));
      });
    });

    document.querySelectorAll("[data-dialog-amount]").forEach(function (button) {
      button.addEventListener("click", function () {
        setAmount(button.getAttribute("data-dialog-amount"));
      });
    });

    ["amount-range", "dialog-amount"].forEach(function (id) {
      var input = document.getElementById(id);
      if (input) {
        input.addEventListener("input", function () {
          setAmount(input.value);
        });
      }
    });

    document.querySelectorAll('input[name="method"]').forEach(function (input) {
      input.addEventListener("change", function () {
        state.method = input.value;
        var note = document.getElementById("method-note");
        if (note) note.textContent = METHOD_NOTES[state.method];
        updateSummary();
      });
    });

    document.querySelectorAll("[data-next-step]").forEach(function (button) {
      button.addEventListener("click", function () {
        setStep(Number(button.getAttribute("data-next-step")));
      });
    });

    document.querySelectorAll("[data-back-step]").forEach(function (button) {
      button.addEventListener("click", function () {
        setStep(Number(button.getAttribute("data-back-step")));
      });
    });

    if (giveForm) {
      giveForm.addEventListener("submit", function (event) {
        event.preventDefault();
        completeGift();
      });
    }

    document.querySelectorAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.filter = button.getAttribute("data-filter");
        renderLedger();
      });
    });

    document.querySelectorAll("[data-export]").forEach(function (button) {
      button.addEventListener("click", downloadCsv);
    });

    document.querySelectorAll("[data-copy-key]").forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-copy-key");
        var text = key === "share" && state.lastName
          ? "I set the table with a $" + state.amount + " monthly gift to Umoja. $1 to $10 becomes food vouchers at African-owned markets, and the ledger is public. Join the $5 table. https://umoja.example"
          : CAPTIONS[key] || CAPTIONS.share;
        copyText(text).then(function (ok) {
          showToast(ok ? "Caption copied. Paste it anywhere." : "Copy failed. Select the caption manually.");
        });
      });
    });

    document.querySelectorAll("[data-post]").forEach(function (button) {
      button.addEventListener("click", function () {
        var row = button.closest("[data-queue-row]");
        if (!row) return;
        var status = document.createElement("span");
        status.className = "status status--done";
        status.textContent = "Posted";
        button.replaceWith(status);
        showToast("Post marked as published in the demo queue.");
      });
    });

    document.querySelectorAll("[data-reset-demo]").forEach(function (button) {
      button.addEventListener("click", resetDemo);
    });

    if (giveDialog) {
      giveDialog.addEventListener("click", function (event) {
        if (event.target === giveDialog) closeGive();
      });
      giveDialog.addEventListener("close", function () {
        document.body.style.overflow = "";
      });
    }

    if (deskDialog) {
      deskDialog.addEventListener("click", function (event) {
        if (event.target === deskDialog) closeDesk();
      });
      deskDialog.addEventListener("close", function () {
        document.body.style.overflow = "";
      });
    }

    document.querySelectorAll(".brand--dialog").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        closeGive();
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        if (giveDialog && giveDialog.open) closeGive();
        if (deskDialog && deskDialog.open) closeDesk();
      }
    });
  }

  function init() {
    renderAll();
    setAmount(5);
    initEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
