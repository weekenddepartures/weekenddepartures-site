/* ============================================================
   Weekend Departures — Award Flight Value Calculator
   Compares cash vs miles redemption. Computes cents-per-point
   and gives a plain-English verdict.
   ============================================================ */

/* Industry-standard valuations (cpp = cents per point).
   Updated to reflect typical 2025-2026 valuations from public sources. */
const POINT_VALUATIONS = {
  chase: { cpp: 2.0, name: 'Chase Ultimate Rewards' },
  amex: { cpp: 2.0, name: 'Amex Membership Rewards' },
  capone: { cpp: 1.85, name: 'Capital One Miles' },
  citi: { cpp: 1.8, name: 'Citi ThankYou Points' },
  united: { cpp: 1.35, name: 'United MileagePlus' },
  aa: { cpp: 1.65, name: 'American AAdvantage' },
  delta: { cpp: 1.2, name: 'Delta SkyMiles' },
  aircanada: { cpp: 1.5, name: 'Air Canada Aeroplan' },
  hyatt: { cpp: 1.7, name: 'World of Hyatt' },
  marriott: { cpp: 0.7, name: 'Marriott Bonvoy' },
  other: { cpp: 1.5, name: 'this points currency' }
};

const $ = (id) => document.getElementById(id);
const fmt = (n) => n.toLocaleString('en-US');
const fmtMoney = (n) => '$' + Math.round(n).toLocaleString('en-US');

function calculate() {
  const route = $('awc-route').value.trim();
  const cabin = $('awc-cabin').value;
  const cash = parseFloat($('awc-cash').value) || 0;
  const miles = parseFloat($('awc-miles').value) || 0;
  const fees = parseFloat($('awc-fees').value) || 0;
  const currency = $('awc-currency').value;

  if (cash <= 0 || miles <= 0) {
    return showError('Add a cash price and miles required to compare.');
  }

  // The actual value you're getting from the redemption
  // (cash price you'd otherwise pay, minus taxes you still pay on the award)
  const valueExtracted = cash - fees;
  const cppActual = (valueExtracted / miles) * 100;

  // Compare against industry-standard valuation for that currency
  const baseline = currency ? POINT_VALUATIONS[currency] : null;
  const baselineCpp = baseline ? baseline.cpp : 1.5; // sensible default
  const baselineName = baseline ? baseline.name : 'flexible travel points';

  // Verdict tiers
  let tier, tierLabel, tierColor, verdict;
  if (cppActual < 0.9) {
    tier = 'bad'; tierLabel = 'Pay cash'; tierColor = '#c14848';
    verdict = `You're getting ${cppActual.toFixed(2)}¢ per point — well below what these points are typically worth. Save the miles for a better redemption and pay cash.`;
  } else if (cppActual < 1.4) {
    tier = 'meh'; tierLabel = 'Lean cash'; tierColor = '#b8842e';
    verdict = `${cppActual.toFixed(2)}¢ per point is mediocre. Unless you have miles you'd otherwise lose to expiration, paying cash and earning new points is usually the better move.`;
  } else if (cppActual < 1.9) {
    tier = 'ok'; tierLabel = 'Fair use'; tierColor = '#a88a52';
    verdict = `${cppActual.toFixed(2)}¢ per point is a reasonable use — close to the baseline value of these points. Worth burning if you want to preserve cash.`;
  } else if (cppActual < 3) {
    tier = 'good'; tierLabel = 'Solid redemption'; tierColor = '#7c9c4f';
    verdict = `${cppActual.toFixed(2)}¢ per point is a solid redemption — clearly above the baseline. Comfortable burn.`;
  } else if (cppActual < 5) {
    tier = 'great'; tierLabel = 'Great value'; tierColor = '#5a8a3a';
    verdict = `${cppActual.toFixed(2)}¢ per point is a great redemption — you're extracting real value here. Book it.`;
  } else {
    tier = 'unicorn'; tierLabel = 'Unicorn redemption'; tierColor = '#3d7a2a';
    verdict = `${cppActual.toFixed(2)}¢ per point is a unicorn — these don't come around often. Book it before someone else does.`;
  }

  // Compare to baseline
  const vsBaseline = cppActual / baselineCpp;
  let baselineLine;
  if (vsBaseline >= 1.5) {
    baselineLine = `That's ${vsBaseline.toFixed(1)}× the typical value of ${baselineName}.`;
  } else if (vsBaseline >= 1) {
    baselineLine = `That's at or above the typical value of ${baselineName} (${baselineCpp}¢).`;
  } else if (vsBaseline >= 0.7) {
    baselineLine = `That's slightly below the typical value of ${baselineName} (${baselineCpp}¢).`;
  } else {
    baselineLine = `That's well below the typical value of ${baselineName} (${baselineCpp}¢) — these points can usually do better.`;
  }

  // Equivalent calculations
  const totalAwardCost = fees;
  const cashSavings = cash - fees;

  showResult({
    route, cabin, cash, miles, fees,
    cppActual, valueExtracted,
    tier, tierLabel, tierColor,
    verdict, baselineLine,
    totalAwardCost, cashSavings,
    baselineCpp
  });
}

function showError(msg) {
  const el = $('awc-results');
  el.style.display = 'block';
  el.innerHTML = `
    <div class="empty-state">
      <p style="color: #c14848;">${msg}</p>
    </div>
  `;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showResult(r) {
  const el = $('awc-results');
  el.style.display = 'block';

  const cabinLabel = r.cabin ? r.cabin.charAt(0).toUpperCase() + r.cabin.slice(1) : '';
  const headerLine = [r.route, cabinLabel].filter(Boolean).join(' · ');

  el.innerHTML = `
    <div class="step-label">Result</div>
    <h2 class="question" style="margin-bottom: 8px;">${r.tierLabel}</h2>
    ${headerLine ? `<p class="question-sub" style="margin-bottom: 28px;">${headerLine}</p>` : '<div style="margin-bottom: 28px;"></div>'}

    <div class="awc-headline" style="border-left: 4px solid ${r.tierColor};">
      <div class="awc-cpp">
        <span class="awc-cpp-num">${r.cppActual.toFixed(2)}<span class="awc-cpp-unit">¢</span></span>
        <span class="awc-cpp-label">per point</span>
      </div>
      <p class="awc-verdict">${r.verdict}</p>
      <p class="awc-baseline">${r.baselineLine}</p>
    </div>

    <div class="awc-breakdown">
      <div class="awc-row">
        <span class="awc-row-label">Cash price</span>
        <span class="awc-row-val">${fmtMoney(r.cash)}</span>
      </div>
      <div class="awc-row">
        <span class="awc-row-label">Miles required</span>
        <span class="awc-row-val">${fmt(r.miles)}</span>
      </div>
      <div class="awc-row">
        <span class="awc-row-label">Taxes / fees on award</span>
        <span class="awc-row-val">${fmtMoney(r.fees)}</span>
      </div>
      <div class="awc-row awc-row-strong">
        <span class="awc-row-label">Effective cash savings</span>
        <span class="awc-row-val">${fmtMoney(r.cashSavings)}</span>
      </div>
    </div>

    <div class="awc-tip">
      <strong>Quick rule:</strong> Anything above 1.5¢ per point is generally worth burning. Below that, paying cash and earning new points usually wins — those new points compound.
    </div>

    <div class="quiz-nav" style="margin-top: 32px;">
      <button class="btn btn-ghost" onclick="resetCalc()">← Try another</button>
      <a href="card-finder.html" class="btn btn-primary">Find a card that earns these points →</a>
    </div>
  `;

  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetCalc() {
  ['awc-route','awc-cabin','awc-cash','awc-miles','awc-fees','awc-currency'].forEach(id => {
    $(id).value = '';
  });
  $('awc-results').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('awc-calc').addEventListener('click', calculate);
$('awc-reset').addEventListener('click', resetCalc);

// Allow Enter key to submit
['awc-cash','awc-miles','awc-fees'].forEach(id => {
  $(id).addEventListener('keydown', (e) => { if (e.key === 'Enter') calculate(); });
});
