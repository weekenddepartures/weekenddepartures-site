/* ============================================================
   Weekend Departures — Spending Optimizer
   Pick cards → enter spend → map best card per category
   ============================================================ */

/* Category list shown to user */
const CATEGORIES = [
  { key: 'dining',     label: 'Dining & restaurants', icon: '🍽' },
  { key: 'groceries',  label: 'Groceries',            icon: '🛒' },
  { key: 'gas',        label: 'Gas & EV charging',    icon: '⛽' },
  { key: 'travel',     label: 'Travel (flights, hotels, rideshare)', icon: '✈️' },
  { key: 'streaming',  label: 'Streaming services',   icon: '📺' },
  { key: 'online',     label: 'Online shopping',      icon: '🛍' },
  { key: 'other',      label: 'Everything else',      icon: '🌀' }
];

/* Card catalog with category multipliers (points per dollar)
   Source: public issuer reward charts as of 2026. Simplified.
   "travelPortal" bonuses only apply when booking via issuer portal — not modeled here. */
const WALLET = [
  {
    id: 'csp',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    multipliers: { dining: 3, travel: 2, streaming: 3, groceries: 1, gas: 1, online: 1, other: 1 }
  },
  {
    id: 'csr',
    name: 'Chase Sapphire Reserve',
    issuer: 'Chase',
    multipliers: { dining: 3, travel: 3, streaming: 1, groceries: 1, gas: 1, online: 1, other: 1 }
  },
  {
    id: 'freedom-unlimited',
    name: 'Chase Freedom Unlimited',
    issuer: 'Chase',
    multipliers: { dining: 3, travel: 1.5, streaming: 1, groceries: 1.5, gas: 1.5, online: 1.5, other: 1.5 }
  },
  {
    id: 'freedom-flex',
    name: 'Chase Freedom Flex',
    issuer: 'Chase',
    multipliers: { dining: 3, travel: 1, streaming: 1, groceries: 1, gas: 5, online: 5, other: 1 }  // 5x rotating approx
  },
  {
    id: 'amex-gold',
    name: 'American Express Gold',
    issuer: 'American Express',
    multipliers: { dining: 4, groceries: 4, travel: 3, streaming: 1, gas: 1, online: 1, other: 1 }
  },
  {
    id: 'amex-platinum',
    name: 'American Express Platinum',
    issuer: 'American Express',
    multipliers: { travel: 5, dining: 1, groceries: 1, gas: 1, streaming: 1, online: 1, other: 1 }
  },
  {
    id: 'amex-blue-cash',
    name: 'Amex Blue Cash Preferred',
    issuer: 'American Express',
    multipliers: { groceries: 6, streaming: 6, gas: 3, travel: 3, dining: 1, online: 1, other: 1 }
  },
  {
    id: 'venture-x',
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    multipliers: { travel: 2, dining: 2, groceries: 2, gas: 2, streaming: 2, online: 2, other: 2 }
  },
  {
    id: 'venture',
    name: 'Capital One Venture',
    issuer: 'Capital One',
    multipliers: { travel: 2, dining: 2, groceries: 2, gas: 2, streaming: 2, online: 2, other: 2 }
  },
  {
    id: 'savor-one',
    name: 'Capital One Savor (No AF)',
    issuer: 'Capital One',
    multipliers: { dining: 3, groceries: 3, streaming: 3, travel: 1, gas: 1, online: 1, other: 1 }
  },
  {
    id: 'citi-double',
    name: 'Citi Double Cash',
    issuer: 'Citi',
    multipliers: { dining: 2, groceries: 2, gas: 2, travel: 2, streaming: 2, online: 2, other: 2 }
  },
  {
    id: 'citi-premier',
    name: 'Citi Strata Premier',
    issuer: 'Citi',
    multipliers: { dining: 3, groceries: 3, gas: 3, travel: 3, streaming: 1, online: 1, other: 1 }
  },
  {
    id: 'wf-autograph',
    name: 'Wells Fargo Autograph',
    issuer: 'Wells Fargo',
    multipliers: { dining: 3, travel: 3, gas: 3, streaming: 3, groceries: 1, online: 1, other: 1 }
  },
  {
    id: 'discover-it',
    name: 'Discover it Cash Back',
    issuer: 'Discover',
    multipliers: { dining: 5, groceries: 5, gas: 5, online: 5, streaming: 1, travel: 1, other: 1 }  // rotating 5%
  },
  {
    id: 'boa-travel',
    name: 'BofA Travel Rewards',
    issuer: 'Bank of America',
    multipliers: { travel: 1.5, dining: 1.5, groceries: 1.5, gas: 1.5, streaming: 1.5, online: 1.5, other: 1.5 }
  },
  {
    id: 'us-bank-altitude',
    name: 'US Bank Altitude Go',
    issuer: 'U.S. Bank',
    multipliers: { dining: 4, groceries: 2, streaming: 2, gas: 2, travel: 1, online: 1, other: 1 }
  }
];

/* State */
const state = {
  selectedCards: new Set(),
  spend: {} // keyed by category.key → monthly $
};

/* Init spend to 0 */
CATEGORIES.forEach(c => { state.spend[c.key] = 0; });

/* DOM */
const picker = document.getElementById('cardsPicker');
const grid = document.getElementById('spendGrid');
const results = document.getElementById('resultsArea');
const hint = document.getElementById('cardsHint');

/* Render cards picker */
WALLET.forEach(card => {
  const btn = document.createElement('button');
  btn.className = 'card-chip';
  btn.textContent = card.name;
  btn.addEventListener('click', () => {
    if (state.selectedCards.has(card.id)) {
      state.selectedCards.delete(card.id);
      btn.classList.remove('selected');
    } else {
      state.selectedCards.add(card.id);
      btn.classList.add('selected');
    }
    updateHint();
    renderResults();
  });
  picker.appendChild(btn);
});

function updateHint() {
  const n = state.selectedCards.size;
  hint.textContent = n === 0
    ? 'Pick at least one card to see recommendations below.'
    : `${n} card${n === 1 ? '' : 's'} selected.`;
}
updateHint();

/* Render spend inputs */
CATEGORIES.forEach(cat => {
  const row = document.createElement('div');
  row.className = 'spend-row';
  row.innerHTML = `
    <label><span class="category-icon">${cat.icon}</span>${cat.label}</label>
    <div class="spend-input">
      <input type="number" min="0" step="25" placeholder="0" data-key="${cat.key}" inputmode="numeric" />
    </div>
  `;
  grid.appendChild(row);
});

grid.querySelectorAll('input').forEach(inp => {
  inp.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    state.spend[e.target.dataset.key] = isNaN(v) ? 0 : v;
    renderResults();
  });
});

/* ---------- Optimization ---------- */
function optimize() {
  if (state.selectedCards.size === 0) return null;

  const cards = WALLET.filter(c => state.selectedCards.has(c.id));
  const rows = [];
  let totalMonthly = 0;
  let totalAnnualPoints = 0;
  let totalSpendAnnual = 0;

  CATEGORIES.forEach(cat => {
    const monthly = state.spend[cat.key] || 0;
    if (monthly <= 0) return;
    totalMonthly += monthly;
    totalSpendAnnual += monthly * 12;

    // Best card for this category
    let best = cards[0];
    let bestMult = best.multipliers[cat.key] || 1;
    cards.forEach(c => {
      const m = c.multipliers[cat.key] || 1;
      if (m > bestMult) { best = c; bestMult = m; }
    });

    const annualPoints = Math.round(monthly * 12 * bestMult);
    totalAnnualPoints += annualPoints;

    rows.push({
      category: cat,
      card: best,
      multiplier: bestMult,
      annualPoints
    });
  });

  return { rows, totalAnnualPoints, totalSpendAnnual, totalMonthly };
}

/* ---------- Render results ---------- */
function renderResults() {
  const r = optimize();

  if (!r) {
    results.innerHTML = `
      <div class="empty-state">
        <p>Pick at least one card and enter some monthly spend to see your optimized wallet.</p>
      </div>
    `;
    return;
  }

  if (r.rows.length === 0) {
    results.innerHTML = `
      <div class="empty-state">
        <p>Enter monthly spend in at least one category above.</p>
      </div>
    `;
    return;
  }

  // Value estimate: assume points avg ~1.5¢ when redeemed for travel (conservative)
  const valueLow = (r.totalAnnualPoints * 0.01).toFixed(0);
  const valueHigh = (r.totalAnnualPoints * 0.02).toFixed(0);

  results.innerHTML = `
    <div class="optimizer-summary">
      <div class="label">Projected annual earn</div>
      <div class="big-number">${r.totalAnnualPoints.toLocaleString()}</div>
      <div class="label" style="color: var(--gold);">points / miles / cash back</div>
      <div class="value-note">Worth roughly $${parseInt(valueLow).toLocaleString()}–$${parseInt(valueHigh).toLocaleString()} depending on how you redeem · from $${r.totalSpendAnnual.toLocaleString()}/yr in spending</div>
    </div>

    <div class="recommendation-list">
      ${r.rows.map(row => `
        <div class="rec-row">
          <div class="cat-ic">${row.category.icon}</div>
          <div>
            <div class="cat-name">${row.category.label}</div>
            <div class="cat-pick">${row.card.name} <span style="color: var(--gray); font-weight: 400;">· ${row.multiplier}×</span></div>
          </div>
          <div class="cat-points">
            ${row.annualPoints.toLocaleString()}
            <small>pts/yr</small>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 32px; padding: 24px; background: var(--gold-soft); border-radius: 4px; border-left: 3px solid var(--gold-dark);">
      <strong style="font-family: 'Playfair Display', serif; font-size: 1.15rem; color: var(--black);">Next level:</strong>
      <p style="margin-top: 8px; color: var(--charcoal);">Want to see where your current stack is leaving points on the table — and exactly which card to add next? That's what <a href="index.html#guide" style="color: var(--gold-dark); text-decoration: underline;">The Playbook</a> walks through step by step.</p>
    </div>
  `;
}

renderResults();
