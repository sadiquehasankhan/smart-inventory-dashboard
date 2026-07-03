/* ============================================================
   SCM/OS — application logic (vanilla JS, no dependencies)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- NAVIGATION ---------------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');

  function goToPage(pageId){
    pages.forEach(p => p.classList.toggle('active', p.id === pageId));
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
    window.scrollTo({top:0, behavior:'smooth'});
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => goToPage(link.dataset.page));
  });

  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => goToPage(btn.dataset.goto));
  });

  /* ---------------- LIVE CLOCK ---------------- */
  function tickClock(){
    const el = document.getElementById('sysClock');
    if(el) el.textContent = new Date().toLocaleTimeString('en-GB');
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------------- TICKER FEED ---------------- */
  const tickerMessages = [
    'PO-4471 dispatched from Chennai Port — ETA 3 days',
    'Pune Yard: SKU-2291 below reorder point',
    'Forecast updated for 214 SKUs',
    'Supplier "Northline Traders" confirmed lead time: 6 days',
    'Delhi Hub cycle count reconciled — 0 discrepancies',
    'Alert cleared: SKU-1187 restocked at Patna DC'
  ];
  let tIdx = 0;
  const tickerEl = document.getElementById('tickerText');
  function rotateTicker(){
    if(!tickerEl) return;
    tickerEl.textContent = tickerMessages[tIdx % tickerMessages.length];
    tIdx++;
  }
  rotateTicker();
  setInterval(rotateTicker, 4000);

  /* ---------------- SAMPLE DATA ---------------- */
  const stockData = [
    {sku:'SKU-1187', name:'Corrugated Cartons (M)', wh:'Patna DC',   units:1420, reorder:400,  status:'ok'},
    {sku:'SKU-2291', name:'Steel Pallet Racks',      wh:'Pune Yard', units:38,   reorder:120,  status:'critical'},
    {sku:'SKU-3305', name:'Barcode Scanners',        wh:'Delhi Hub', units:96,   reorder:100,  status:'low'},
    {sku:'SKU-4410', name:'Stretch Wrap Film',       wh:'Chennai Port', units:860, reorder:200, status:'ok'},
    {sku:'SKU-5522', name:'Forklift Batteries',      wh:'Pune Yard', units:11,   reorder:25,   status:'critical'},
    {sku:'SKU-6630', name:'Pallet Jacks',            wh:'Delhi Hub', units:54,   reorder:60,   status:'low'},
    {sku:'SKU-7741', name:'Poly Mailers (L)',        wh:'Patna DC',  units:3020, reorder:600,  status:'ok'},
  ];

  const supplierData = [
    {name:'Northline Traders', category:'Packaging',    lead:6,  rating:4},
    {name:'Ironclad Racking Co.', category:'Warehouse Equipment', lead:14, rating:3},
    {name:'Sunrise Logistics Supply', category:'Fulfilment Consumables', lead:4, rating:5},
    {name:'Vantage Fleet Parts', category:'Material Handling', lead:9, rating:4},
  ];

  let alertData = [
    {sev:'high', title:'Forklift Batteries below safety stock', sub:'SKU-5522 · Pune Yard · 11 units remaining'},
    {sev:'high', title:'Steel Pallet Racks critical', sub:'SKU-2291 · Pune Yard · 38 units remaining'},
    {sev:'medium', title:'Barcode Scanners approaching reorder point', sub:'SKU-3305 · Delhi Hub · 96 units remaining'},
    {sev:'medium', title:'Supplier lead time increased', sub:'Ironclad Racking Co. · now 14 days'},
  ];

  /* ---------------- STOCK TABLE ---------------- */
  const stockBody = document.getElementById('stockTableBody');
  const statusLabel = {ok:'Healthy', low:'Low Stock', critical:'Critical'};

  function renderStock(filter='all'){
    if(!stockBody) return;
    stockBody.innerHTML = '';
    stockData
      .filter(row => filter === 'all' || row.status === filter)
      .forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="mono">${row.sku}</td>
          <td>${row.name}</td>
          <td>${row.wh}</td>
          <td>${row.units.toLocaleString()}</td>
          <td>${row.reorder.toLocaleString()}</td>
          <td><span class="status-pill ${row.status}">${statusLabel[row.status]}</span></td>
          <td><button class="btn-industrial small">Restock</button></td>
        `;
        tr.querySelector('button').addEventListener('click', (e) => {
          e.target.textContent = 'Requested ✓';
          e.target.disabled = true;
        });
        stockBody.appendChild(tr);
      });
  }
  renderStock();

  document.querySelectorAll('#stock .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#stock .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderStock(chip.dataset.filter);
    });
  });

  /* ---------------- FORECAST TABLE + CHART ---------------- */
  const forecastBody = document.getElementById('forecastTableBody');
  const forecastTitle = document.getElementById('forecastTitle');

  function velocityFor(row){ return Math.max(2, Math.round(row.units / 60)); }

  function renderForecastTable(days){
    if(!forecastBody) return;
    forecastBody.innerHTML = '';
    stockData.forEach(row => {
      const v = velocityFor(row);
      const projected = v * days;
      const recommended = Math.max(0, projected + row.reorder - row.units);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.name}</td>
        <td class="mono">${v}/day</td>
        <td class="mono">${projected.toLocaleString()}</td>
        <td class="mono">${recommended.toLocaleString()}</td>
      `;
      forecastBody.appendChild(tr);
    });
  }

  function drawLineChart(canvas, points, color){
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || canvas.parentElement.clientWidth, h = parseInt(canvas.getAttribute('height'), 10) || 220;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0,0,w,h);

    const pad = 30;
    const max = Math.max(...points) * 1.15;
    const stepX = (w - pad*2) / (points.length - 1);

    // gridlines
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    ctx.lineWidth = 1;
    for(let i=0;i<=4;i++){
      const y = pad + (h - pad*2) * (i/4);
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w-pad, y); ctx.stroke();
    }

    // line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    points.forEach((p,i) => {
      const x = pad + i*stepX;
      const y = h - pad - (p/max) * (h - pad*2);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();

    // fill
    ctx.lineTo(w-pad, h-pad); ctx.lineTo(pad, h-pad); ctx.closePath();
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0, color + '33');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.fill();

    // points
    ctx.fillStyle = color;
    points.forEach((p,i) => {
      const x = pad + i*stepX;
      const y = h - pad - (p/max) * (h - pad*2);
      ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
    });
  }

  function seededSeries(n, base){
    const arr = [];
    let v = base;
    for(let i=0;i<n;i++){
      v += (Math.sin(i*1.3) * base * 0.12) + (Math.random()-0.5) * base * 0.08;
      arr.push(Math.max(10, Math.round(v)));
    }
    return arr;
  }

  function renderForecastChart(days){
    const canvas = document.getElementById('forecastChart');
    const n = days === 7 ? 7 : (days === 30 ? 10 : 12);
    const series = seededSeries(n, 300);
    drawLineChart(canvas, series, '#f2a93b');
  }

  function setForecastRange(days){
    forecastTitle.textContent = `Projected Demand — Next ${days} Days`;
    renderForecastTable(days);
    renderForecastChart(days);
  }

  document.querySelectorAll('#forecast .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#forecast .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      setForecastRange(parseInt(chip.dataset.range, 10));
    });
  });

  /* ---------------- DASHBOARD CHART ---------------- */
  function renderDashboardChart(){
    const canvas = document.getElementById('dashChart');
    const series = seededSeries(14, 450);
    drawLineChart(canvas, series, '#3fb8af');
  }

  /* ---------------- SUPPLIERS ---------------- */
  const supplierGrid = document.getElementById('supplierGrid');

  function starString(rating){
    return '★★★★★'.slice(0,rating) + '☆☆☆☆☆'.slice(0, 5-rating);
  }

  function renderSuppliers(){
    if(!supplierGrid) return;
    supplierGrid.innerHTML = '';
    supplierData.forEach(s => {
      const card = document.createElement('div');
      card.className = 'supplier-card';
      card.innerHTML = `
        <h3>${s.name}</h3>
        <div class="supplier-cat">${s.category}</div>
        <div class="supplier-meta">
          <span>Lead time: <b class="mono">${s.lead}d</b></span>
          <span class="stars">${starString(s.rating)}</span>
        </div>
        <button class="btn-industrial small full">Contact Supplier</button>
      `;
      card.querySelector('button').addEventListener('click', (e) => {
        e.target.textContent = 'Message Sent ✓';
        e.target.disabled = true;
      });
      supplierGrid.appendChild(card);
    });
  }
  renderSuppliers();

  const toggleBtn = document.getElementById('toggleSupplierForm');
  const supplierForm = document.getElementById('supplierForm');
  toggleBtn?.addEventListener('click', () => {
    supplierForm.classList.toggle('open');
  });

  document.getElementById('supplierAddForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('supName').value.trim();
    const category = document.getElementById('supCategory').value.trim();
    const lead = parseInt(document.getElementById('supLead').value, 10) || 5;
    if(!name || !category) return;
    supplierData.unshift({name, category, lead, rating: 4});
    renderSuppliers();
    e.target.reset();
    supplierForm.classList.remove('open');
  });

  /* ---------------- ALERTS ---------------- */
  const alertList = document.getElementById('alertList');

  function renderAlerts(){
    if(!alertList) return;
    alertList.innerHTML = '';
    const kpiAlerts = document.getElementById('kpiAlerts');
    if(kpiAlerts) kpiAlerts.textContent = alertData.length;

    if(alertData.length === 0){
      alertList.innerHTML = `<li class="alert-item"><div class="alert-body"><p class="alert-title">All clear — no active alerts.</p></div></li>`;
      return;
    }

    alertData.forEach((a, i) => {
      const li = document.createElement('li');
      li.className = 'alert-item';
      li.innerHTML = `
        <span class="alert-sev ${a.sev}">${a.sev}</span>
        <div class="alert-body">
          <p class="alert-title">${a.title}</p>
          <p class="alert-sub">${a.sub}</p>
        </div>
        <button class="btn-industrial small outline">Resolve</button>
      `;
      li.querySelector('button').addEventListener('click', () => {
        alertData.splice(i, 1);
        renderAlerts();
      });
      alertList.appendChild(li);
    });
  }
  renderAlerts();

  /* ---------------- CSV REPORT GENERATION ---------------- */
  document.getElementById('generateReportBtn')?.addEventListener('click', () => {
    const rows = [['SKU','Item','Warehouse','Units on Hand','Reorder Point','Status']];
    stockData.forEach(r => rows.push([r.sku, r.name, r.wh, r.units, r.reorder, statusLabel[r.status]]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scm-stock-report-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    const status = document.getElementById('reportStatus');
    status.textContent = 'Report downloaded ✓';
    setTimeout(() => status.textContent = '', 3000);
  });

  /* ---------------- INITIAL CHART PAINT ---------------- */
  renderDashboardChart();
  setForecastRange(7);

  // repaint charts on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderDashboardChart();
      const activeRange = document.querySelector('#forecast .chip.active');
      setForecastRange(activeRange ? parseInt(activeRange.dataset.range,10) : 7);
    }, 200);
  });

});