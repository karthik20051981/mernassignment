// Helpers
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// Year in footer
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// Responsive nav
(function nav(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  // Close on link click (mobile)
  $$('#site-nav a').forEach(a => a.addEventListener('click', ()=>{
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
  }));
})();

// Gallery lightbox (home)
(function gallery(){
  const dialog = $('#lightbox');
  const img = $('#lightbox-img');
  const closeBtn = $('.lightbox-close');
  if (!dialog || !img) return;
  $$('.gallery-item').forEach(btn => {
    btn.addEventListener('click', () => {
      img.src = btn.dataset.full;
      dialog.showModal();
    });
  });
  closeBtn?.addEventListener('click', ()=> dialog.close());
  dialog?.addEventListener('click', (e)=> {
    const rect = dialog.getBoundingClientRect();
    const inDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                      rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
    if (!inDialog) dialog.close();
  });
})();

// Contact form validation
(function contactForm(){
  const form = $('#contact-form');
  if (!form) return;
  const name = $('#name'), email = $('#email');
  const errName = $('#err-name'), errEmail = $('#err-email');
  const status = $('#form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    errName.textContent = '';
    errEmail.textContent = '';
    status.textContent = '';

    if (!name.value.trim()) {
      errName.textContent = 'Please enter your name.';
      ok = false;
    }
    const emailVal = email.value.trim();
    if (!emailVal) {
      errEmail.textContent = 'Please enter your email.';
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      errEmail.textContent = 'Please enter a valid email address.';
      ok = false;
    }
    if (!ok) return;

    // Simulate submit
    status.textContent = 'Thanks! Your message was received.';
    form.reset();
  });
})();

// Events list (JSON with fallback)
(async function events(){
  const list = $('#events-list');
  const empty = $('#events-empty');
  const filterSel = $('#filter');
  if (!list || !filterSel) return;

  function render(items) {
    list.innerHTML = '';
    if (!items.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    items.forEach(ev => {
      const li = document.createElement('li');
      const title = document.createElement('div');
      title.className = 'event-title';
      title.textContent = ev.title;

      const meta = document.createElement('div');
      meta.className = 'event-date';
      const d = new Date(ev.date);
      const formatted = d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
      meta.textContent = formatted;

      const desc = document.createElement('div');
      desc.className = 'muted';
      desc.textContent = ev.description;

      li.appendChild(title);
      li.appendChild(meta);
      li.appendChild(desc);
      list.appendChild(li);
    });
  }

  let events = [];
  try {
    const res = await fetch('events.json', {cache:'no-store'});
    if (!res.ok) throw new Error('Network');
    events = await res.json();
  } catch (e) {
    // Fallback if JSON fetch fails (e.g., opened directly from file system)
    events = [
      { title: 'Welcome Meetup', date: '2025-08-25', description: 'Kickoff + roadmap for the semester.' },
      { title: 'HTML/CSS Bootcamp', date: '2025-09-02', description: 'Hands-on layout & responsive design.' },
      { title: 'AI Agents 101', date: '2025-09-10', description: 'Intro to building and evaluating agents.' },
      { title: 'Hack Night #1', date: '2025-09-18', description: 'Team up and ship something small.' }
    ];
  }

  function applyFilter(kind) {
    const now = new Date();
    if (kind === 'upcoming') return events.filter(e => new Date(e.date) >= now);
    if (kind === 'past') return events.filter(e => new Date(e.date) < now);
    return events;
  }

  render(applyFilter(filterSel.value));
  filterSel.addEventListener('change', () => render(applyFilter(filterSel.value)));
})();
