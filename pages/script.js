// script.js - pure client-side logic (mock server + behaviour)

document.addEventListener('DOMContentLoaded', () => {
    // elements
    const phoneInput = document.getElementById('phoneInput');
    const copyBtn = document.getElementById('copyBtn');
    const clockEl = document.getElementById('clock');
    const customersContainer = document.getElementById('customersContainer');
    const loadingDots = document.getElementById('loadingDots');
    const spinner = document.getElementById('spinner');
    const readingText = document.getElementById('readingText');
    const readingWidget=document.getElementById('reading-widget');
    const caseMode='swap';

  
    // mock customer data (collected from main page)
    const observedCustomers = [
      {
        id: "A12345",
        name: "Alice Namutebi",
        phone: "+256701111111",
        idImage: svgDataURL("ID A"),
        customerImage: svgDataURL("A")
      },
      {
        id: "B54321",
        name: "Brian O.",
        phone: "+256700222222",
        idImage: svgDataURL("ID B"),
        customerImage: svgDataURL("B")
      },
      {
        id: "C98765",
        name: "Cecilia K",
        phone: "+256700333333",
        idImage: svgDataURL("ID C"),
        customerImage: svgDataURL("C")
      }
    ];
  
    // mock server data - an array to compare with (simulate fetching)
    const serverData = [
      { phone: "+256700333333", caseId: "CASE-9001" }, // will match Cecilia
      { phone: "+256700999999", caseId: "CASE-9999" }
    ];
  
    // Helper: create simple SVG data URLs for placeholder images
    function svgDataURL(letter){
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
        <rect width='100%' height='100%' fill='#222' />
        <text x='50%' y='50%' fill='#fff' font-size='48' text-anchor='middle' dominant-baseline='central' font-family='Arial'>${letter}</text>
      </svg>`;
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
  
    // Start live clock
    function updateClock(){
      const now = new Date();
      const hh = String(now.getHours()).padStart(2,'0');
      const mm = String(now.getMinutes()).padStart(2,'0');
      const ss = String(now.getSeconds()).padStart(2,'0');
      clockEl.textContent = `${hh}:${mm}:${ss}`;
    }
    updateClock();
    const clockTimer = setInterval(updateClock, 1000);
  
    // Copy phone to clipboard
    copyBtn.addEventListener('click', async () => {
      const val = phoneInput.value || '';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(val);
        } else {
          // fallback
          const tmp = document.createElement('textarea');
          tmp.value = val;
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand('copy');
          document.body.removeChild(tmp);
        }
        // simple feedback: temporarily change icon background
        copyBtn.style.transform = 'scale(0.96)';
        setTimeout(()=> copyBtn.style.transform = '', 140);
      } catch(err){
        console.error('copy failed', err);
      }
    });
  
    // Show loading dots first then render customer cards
    function renderCustomersWithLoading(){
      customersContainer.classList.add('loading');
      loadingDots.style.display = 'flex';
      // clear existing customer elements if any
      customersContainer.querySelectorAll('.customer-card').forEach(n => n.remove());
  
      // Simulate a fetch delay for observed clients (500-900ms)
      setTimeout(() => {
        loadingDots.style.display = 'none';
        customersContainer.classList.remove('loading');
  
        observedCustomers.forEach(c => {
          const card = document.createElement('div');
          card.className = 'customer-card';
          card.innerHTML = `
            <img src="${c.customerImage}" alt="${c.name}">
            <div class="name">${escapeHtml(c.name)}</div>
            <div class="phone">${escapeHtml(c.phone)}</div>
            <div class="case-id" style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:4px">ID: ${escapeHtml(c.id)}</div>
          `;
          customersContainer.appendChild(card);
        });
      }, 700);
    }
  
    // escape html safely for mock text
    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, ch => ({
        '&' : '&amp;',
        '<' : '&lt;',
        '>' : '&gt;',
        '"' : '&quot;',
        "'" : '&#39;'
      })[ch]);
    }
  
    // reading memory: simulate getting server array and comparing
    // returns a promise that resolves with {found: boolean, matches: []}
    function readMemoryAndCompare(){
      // simulate network latency and progressive reading
      return new Promise(resolve => {
        // small staged updates for realism
        setTimeout(() => {
          // step 1: pretend fetching from server
          // (serverData is defined above)
        }, 350);
  
        setTimeout(() => {
          // step 2: compare observed customers to serverData
          const matches = [];
          observedCustomers.forEach(c => {
            const found = serverData.find(s => s.phone === c.phone);
            if (found) {
              matches.push({ customer: c, case: found.caseId });
            }
          });
          resolve({ found: matches.length > 0, matches });
        }, 2000); // 2 seconds total to simulate a slightly slower read
      });
    }
  
    // Kick off rendering and readMemory
    renderCustomersWithLoading();
    startReadingMemory();
  
    async function startReadingMemory(){
      // show spinner and text (already visible)
      readingText.textContent = 'reading memory';
      spinner.style.display = 'block';
  
      try {
        const result = await readMemoryAndCompare(); // simulate server fetch & compare
  
        // stop spinner
        spinner.style.display = 'none';
  
        if (result.found) {
          readingText.textContent = 'case found';
          readingText.classList.add('result-found');
          readingText.classList.remove('result-notfound');

         readingWidget.classList.add('reading-widget-2');
         readingText.classList.add('reading-text2');
  
          // highlight matching customer cards and append case id
          result.matches.forEach(match => {
            // find the card by matching phone text
            const cards = Array.from(document.querySelectorAll('.customer-card'));
            const card = cards.find(cd => cd.querySelector('.phone').textContent.trim() === match.customer.phone);
            if (card) {
                /*
              card.style.border = '2px solid rgba(78,245,139,0.18)';
              const small = document.createElement('div');
              small.style.fontSize = '11px';
              small.style.color = 'rgba(78,245,139,0.95)';
              small.style.marginTop = '6px';
              small.textContent = `case: ${match.case}`;
              card.appendChild(small);
            */
              }
          });
        } else {
          readingText.textContent = 'no case found';
          readingText.classList.add('result-notfound');
          readingText.classList.remove('result-found');

          readingWidget.classList.add('reading-widget-3');
          readingText.classList.add('reading-text2');
        }
      } catch (err) {
        console.error(err);
        spinner.style.display = 'none';
        readingText.textContent = 'error';
        readingText.classList.add('result-notfound');
      }
    }
  
    // make it possible to re-run reading memory if user clicks the widget
    document.querySelector('.reading-widget').addEventListener('click', () => {
      // reset visuals
      readingText.classList.remove('result-found','result-notfound');
      spinner.style.display = 'block';
      readingText.textContent = 'reading memory';
      // remove prior highlights
      document.querySelectorAll('.customer-card').forEach(c => {
        c.style.border = '1px solid rgba(255,255,255,0.03)';
        const extra = c.querySelector('div[style*="case:"]');
        // remove small appended nodes by matching textContent
        Array.from(c.children).forEach(ch => { if (ch.textContent && ch.textContent.startsWith('case:')) ch.remove(); });
      });
      // re-run
      startReadingMemory();
    });
  
    // ensure we clear intervals if popup is closed (good practice)
    window.addEventListener('unload', () => {
      clearInterval(clockTimer);
    });
  });
  