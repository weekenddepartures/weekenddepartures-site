/* ============================================================
   Weekend Departures — Card Finder Quiz
   Conversational 3-question quiz → recommendations
   ============================================================ */

const QUIZ = [
  {
    key: 'credit',
    label: 'Question 1 of 3',
    question: "What's your credit score looking like?",
    sub: "Be honest — the right starter card depends on it. If you're not sure, Credit Karma gives a free estimate.",
    options: [
      { val: 'excellent', label: 'Excellent (740+)', desc: 'All premium cards are on the table.' },
      { val: 'good',      label: 'Good (670–739)',  desc: 'Most travel and cash-back cards will approve you.' },
      { val: 'fair',      label: 'Fair (580–669)',  desc: "We'll match you to cards built for this range." },
      { val: 'building',  label: 'Building / no history', desc: "Secured and starter cards — the foundation." }
    ]
  },
  {
    key: 'rewards',
    label: 'Question 2 of 3',
    question: "Travel rewards or cash back?",
    sub: "Travel points are usually worth more per dollar — if you actually redeem them for travel. Cash back is simpler and flexible.",
    options: [
      { val: 'travel',   label: 'Travel rewards',  desc: 'Flights, hotels, transfer partners. Best upside.' },
      { val: 'cashback', label: 'Cash back',       desc: 'Simple. No games. Same value every time.' },
      { val: 'both',     label: 'A little of both', desc: "We'll mix the picks." }
    ]
  },
  {
    key: 'fee',
    label: 'Question 3 of 3',
    question: "Open to paying an annual fee?",
    sub: "Premium cards charge $95–$695/year but often return multiples of that in perks and points — if you use them.",
    options: [
      { val: 'none',     label: 'No — $0 only',           desc: 'Free is free. We respect it.' },
      { val: 'moderate', label: 'Up to ~$95',             desc: 'The sweet spot — most top travel cards live here.' },
      { val: 'premium',  label: 'Yes, if the math works', desc: '$200+ premium cards are fair game.' }
    ]
  }
];

/* ---------------- Card catalog ----------------
   Simplified, beginner-friendly picks. Keep these honest and current.
------------------------------------------------- */
const CARDS = [
  {
    id: 'discover-it',
    name: 'Discover it® Cash Back',
    issuer: 'Discover',
    fee: 0,
    type: 'cashback',
    creditFit: ['good','fair','building','excellent'],
    feeTier: 'none',
    bonus: 'First-year cashback match (doubles everything you earn Year 1)',
    rate: '5% rotating categories (up to $1,500/qtr) · 1% on everything else',
    why: "The best card for building credit while still earning real rewards. The first-year match effectively doubles your rewards — a 5% category becomes 10%."
  },
  {
    id: 'capital-one-savor-one',
    name: 'Capital One Savor (No Annual Fee)',
    issuer: 'Capital One',
    fee: 0,
    type: 'cashback',
    creditFit: ['good','excellent','fair'],
    feeTier: 'none',
    bonus: '$200 cash after $500 spend',
    rate: '3% dining, groceries, entertainment, streaming · 1% elsewhere',
    why: "An unfairly generous no-fee cash-back card. If you eat out or cook at home, you're earning 3% — better than most paid cards."
  },
  {
    id: 'chase-freedom-unlimited',
    name: 'Chase Freedom Unlimited®',
    issuer: 'Chase',
    fee: 0,
    type: 'cashback',
    creditFit: ['good','excellent'],
    feeTier: 'none',
    bonus: '$200 after $500 spend + 5% on groceries Y1',
    rate: '1.5% on everything · 3% dining & drugstores · 5% travel via Chase',
    why: "The ultimate 'boring backup' card. When paired later with a Sapphire, those 1.5% rewards become transferable travel points worth 2–3× more."
  },
  {
    id: 'citi-double-cash',
    name: 'Citi Double Cash®',
    issuer: 'Citi',
    fee: 0,
    type: 'cashback',
    creditFit: ['good','excellent'],
    feeTier: 'none',
    bonus: '$200 after $1,500 spend',
    rate: '2% on everything (1% when you buy, 1% when you pay)',
    why: "The flat-2%-on-everything champion. Zero thinking required. If the Spending Optimizer ever points you here, it's a safe workhorse."
  },
  {
    id: 'wells-fargo-autograph',
    name: 'Wells Fargo Autograph℠',
    issuer: 'Wells Fargo',
    fee: 0,
    type: 'travel',
    creditFit: ['good','excellent'],
    feeTier: 'none',
    bonus: '20,000 points after $1,000 spend',
    rate: '3× on travel, dining, gas, transit, streaming, phone plans · 1× elsewhere',
    why: "The best no-annual-fee travel card. Six bonus categories is absurd for $0. Great starter before stepping up to a premium travel card."
  },
  {
    id: 'chase-sapphire-preferred',
    name: 'Chase Sapphire Preferred®',
    issuer: 'Chase',
    fee: 95,
    type: 'travel',
    creditFit: ['good','excellent'],
    feeTier: 'moderate',
    bonus: '60,000 points after $4,000 in 3 months (~$750–$1,200 in travel)',
    rate: '5× Chase travel · 3× dining & streaming · 2× other travel · 1× rest',
    why: "The single best travel card for beginners. Points transfer to United, Hyatt, Southwest, Air Canada, and more — where they're often worth 2–4× the cash value."
  },
  {
    id: 'amex-gold',
    name: 'American Express® Gold Card',
    issuer: 'American Express',
    fee: 325,
    type: 'travel',
    creditFit: ['good','excellent'],
    feeTier: 'premium',
    bonus: '60,000 Membership Rewards after $6,000 spend in 6 months',
    rate: '4× dining & U.S. supermarkets (up to $50k) · 3× flights · 1× rest',
    why: "If you spend real money on food, the Gold quietly prints points. Credits for Uber, dining, and Resy often offset most of the annual fee."
  },
  {
    id: 'capital-one-venture-x',
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    fee: 395,
    type: 'travel',
    creditFit: ['excellent'],
    feeTier: 'premium',
    bonus: '75,000 miles after $4,000 spend',
    rate: '2× on everything · 10× hotels & cars via Capital One Travel',
    why: "The only $395 card where the math almost always nets positive: $300 travel credit + 10,000 anniversary miles ≈ the fee back before you swipe."
  },
  {
    id: 'capital-one-quicksilver-secured',
    name: 'Capital One Quicksilver Secured',
    issuer: 'Capital One',
    fee: 0,
    type: 'cashback',
    creditFit: ['building'],
    feeTier: 'none',
    bonus: '—',
    rate: '1.5% on everything',
    why: "If you're building credit from zero, this is the graduation path: put down a refundable deposit, get a normal-looking card, and Capital One can upgrade you to an unsecured card in ~6 months."
  },
  {
    id: 'chase-freedom-rise',
    name: 'Chase Freedom Rise℠',
    issuer: 'Chase',
    fee: 0,
    type: 'cashback',
    creditFit: ['building','fair'],
    feeTier: 'none',
    bonus: '—',
    rate: '1.5% on everything',
    why: "Built specifically for people with limited credit history. Pair a Chase checking account and approval odds jump. It's the quiet side door into the Chase ecosystem."
  }
];

/* ---------------- Scoring logic ---------------- */
function scoreCard(card, answers) {
  let score = 0;

  // Credit fit — must match
  if (!card.creditFit.includes(answers.credit)) return -1;

  // Rewards type
  if (answers.rewards === 'both') score += 1;
  else if (card.type === answers.rewards) score += 3;
  else score -= 1;

  // Fee tier
  if (answers.fee === 'none') {
    if (card.feeTier === 'none') score += 3;
    else if (card.feeTier === 'moderate') score -= 5;
    else if (card.feeTier === 'premium') score -= 10;
  } else if (answers.fee === 'moderate') {
    if (card.feeTier === 'none') score += 1;
    else if (card.feeTier === 'moderate') score += 3;
    else if (card.feeTier === 'premium') score -= 3;
  } else if (answers.fee === 'premium') {
    if (card.feeTier === 'premium') score += 3;
    else if (card.feeTier === 'moderate') score += 2;
    else if (card.feeTier === 'none') score += 1;
  }

  // Credit bonus: building → prioritize starter cards heavily
  if (answers.credit === 'building' && card.creditFit.length <= 2) score += 4;

  return score;
}

function getRecommendations(answers) {
  const scored = CARDS
    .map(c => ({ card: c, s: scoreCard(c, answers) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s);

  return scored.slice(0, 3).map(x => x.card);
}

/* ---------------- Render ---------------- */
const state = { step: 0, answers: {} };
const slot = document.getElementById('quizSlot');
const progress = document.getElementById('progress');

function setProgress(pct) { progress.style.width = pct + '%'; }

function renderQuestion() {
  const q = QUIZ[state.step];
  setProgress(((state.step) / QUIZ.length) * 100);

  slot.innerHTML = `
    <div class="step-label">${q.label}</div>
    <h2 class="question">${q.question}</h2>
    <p class="question-sub">${q.sub}</p>
    <div class="options" role="listbox">
      ${q.options.map(opt => `
        <button class="option ${state.answers[q.key] === opt.val ? 'selected' : ''}" data-val="${opt.val}">
          <span class="option-label">
            <strong>${opt.label}</strong>
            <span class="option-desc">${opt.desc}</span>
          </span>
          <span class="option-arrow">→</span>
        </button>
      `).join('')}
    </div>
    <div class="quiz-nav">
      ${state.step > 0 ? '<button class="btn btn-ghost" id="backBtn">← Back</button>' : '<span></span>'}
      <span></span>
    </div>
  `;

  slot.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', () => {
      state.answers[q.key] = btn.dataset.val;
      if (state.step < QUIZ.length - 1) {
        state.step++;
        renderQuestion();
      } else {
        renderResults();
      }
    });
  });

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.step--;
      renderQuestion();
    });
  }
}

function renderResults() {
  setProgress(100);
  const recs = getRecommendations(state.answers);

  const summaryLine = {
    excellent: 'With excellent credit, ',
    good: 'With good credit, ',
    fair: 'Cards matched to your fair-credit range, ',
    building: 'Built for people starting from zero, '
  }[state.answers.credit];

  const styleLine = {
    travel: 'optimized for travel rewards.',
    cashback: 'focused on simple cash back.',
    both: 'balancing travel upside with cash-back simplicity.'
  }[state.answers.rewards];

  if (recs.length === 0) {
    slot.innerHTML = `
      <div class="empty-state">
        <h3 style="margin-bottom: 10px;">No perfect match in our current picks.</h3>
        <p style="margin-bottom: 24px;">Try relaxing one answer — the beginner sweet spot usually opens up with "good" credit + "moderate" fee.</p>
        <button class="btn btn-outline" id="restart">Start over</button>
      </div>
    `;
    document.getElementById('restart').addEventListener('click', restart);
    return;
  }

  slot.innerHTML = `
    <div class="step-label">Your matches</div>
    <h2 class="question">Three cards worth a <em style="color: var(--gold-dark); font-style: italic;">serious look</em></h2>
    <p class="question-sub">${summaryLine}${styleLine} Read the "why" before applying — the bonus is only worth it if you can hit the spend naturally.</p>

    ${recs.map((c, i) => `
      <div class="result-card">
        <span class="pick-badge">${i === 0 ? 'Top pick' : i === 1 ? 'Runner-up' : 'Also consider'}</span>
        <h3>${c.name}</h3>
        <div class="result-meta">${c.issuer} · ${c.fee === 0 ? 'No annual fee' : '$' + c.fee + ' annual fee'}</div>
        <p class="result-why">${c.why}</p>
        <div class="result-stats">
          <span><strong>Welcome bonus:</strong> ${c.bonus}</span>
          <span><strong>Earning:</strong> ${c.rate}</span>
        </div>
      </div>
    `).join('')}

    <div class="quiz-nav">
      <button class="btn btn-ghost" id="restart">← Start over</button>
      <a href="spending-optimizer.html" class="btn btn-primary">Next: optimize spending →</a>
    </div>
  `;

  document.getElementById('restart').addEventListener('click', restart);
}

function restart() {
  state.step = 0;
  state.answers = {};
  renderQuestion();
}

renderQuestion();
