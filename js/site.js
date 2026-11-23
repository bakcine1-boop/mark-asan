/* =========================================================
   WORSHIP MUSICAL MARK · 아산 특별공연
   확정 정보가 나오면 아래 CONFIG만 고치면 화면 전체에 반영됩니다.
   ========================================================= */
const CONFIG = {
  preview: true,                 // 검토용 표시 띠. 공개할 때 false
  date: '2027-01-23',            // 공연일 (주간보고 대전 11/17·11/24 기준)
  time: '',                      // 확정되면 '16:00' 형식으로. 비어 있으면 '추후 안내'
  fee: '',                       // 예: '1인 20,000원 (사전예매)' 또는 '무료' — 비어 있으면 '확정 후 안내'
  host: 'CTS기독교TV',
  organizer: 'CTS대전방송 · 생명샘동천교회',
  contactLabel: 'CTS대전방송 042-482-0691',
  contactTel: '042-482-0691',
  // 사전예매
  api: 'https://script.google.com/macros/s/AKfycbzEKyMa9A86CmKyvNqYuabOpBjTheEIcILL9rGjnHxolwKMOeJrUQRKBHagnLGaJDwCSA/exec',
  price: 20000,                  // 1매
  groupMin: 10,                  // 이 매수부터 단체 할인
  groupRate: 0.9,                // 10% 할인 → 18,000원
  bank: { name: '우리은행', no: '1005-100-350576', holder: '(주)기독교텔레비전' }, // ※ 대전지사 확인 필요
  retention: '공연 종료 후 지체 없이 파기',
  inviteText: '1월 23일(토) 아산 생명샘동천교회에서 워십 뮤지컬 〈마크〉 같이 보러 가요. 우리가 아는 찬양으로 만든 90분짜리 뮤지컬이에요.',
  venue: '생명샘동천교회',
  address: '충남 아산시 배방읍 순천향로 1060',
  url: 'https://mark-asan.churchhistory.kr/'
};

document.documentElement.classList.add('js');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- 확정 정보 반영 ---------- */
(function applyConfig() {
  const flag = $('[data-preview-flag]');
  if (CONFIG.preview && flag) {
    flag.hidden = false;
    document.body.classList.add('has-flag');
    const setFlag = () => document.documentElement.style.setProperty('--flag-h', flag.offsetHeight + 'px');
    setFlag();
    addEventListener('resize', setFlag);
  }
  if (CONFIG.time) {
    const [h, m] = CONFIG.time.split(':').map(Number);
    const ampm = h < 12 ? '오전' : '오후';
    const hh = h % 12 === 0 ? 12 : h % 12;
    const txt = `${ampm} ${hh}시${m ? ' ' + m + '분' : ''}`;
    $$('[data-time-text]').forEach(el => (el.textContent = txt));
  }
  if (CONFIG.fee) $$('[data-fee-text]').forEach(el => (el.textContent = CONFIG.fee));
  $$('[data-host-text]').forEach(el => (el.textContent = CONFIG.host));
  $$('[data-org-text]').forEach(el => (el.textContent = CONFIG.organizer));
  $$('[data-contact-link]').forEach(el => {
    el.href = 'tel:' + CONFIG.contactTel;
    if (!el.classList.contains('btn')) {
      const m = CONFIG.contactLabel.match(/^(.*?)\s*([\d-]+)$/);
      el.innerHTML = m ? `${m[1]} <span class="nw">${m[2]}</span>` : CONFIG.contactLabel;
    }
  });
  $$('[data-bank-name]').forEach(el => (el.textContent = CONFIG.bank.name));
  $$('[data-bank-no]').forEach(el => (el.textContent = CONFIG.bank.no));
  $$('[data-bank-holder]').forEach(el => (el.textContent = CONFIG.bank.holder));
  $$('[data-retention]').forEach(el => (el.textContent = CONFIG.retention));
})();

/* ---------- D-day (한국 시간 기준) ---------- */
(function dday() {
  const el = $('[data-dday]');
  if (!el) return;
  const now = new Date();
  const kst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  const today = Date.UTC(kst.getFullYear(), kst.getMonth(), kst.getDate());
  const [y, mo, d] = CONFIG.date.split('-').map(Number);
  const diff = Math.round((Date.UTC(y, mo - 1, d) - today) / 86400000);
  if (diff > 0) el.textContent = 'D-' + diff;
  else if (diff === 0) el.textContent = 'D-DAY';
  else return;
  el.hidden = false;
})();

/* ---------- 헤더 · 하단 바 ---------- */
(function chrome() {
  const hdr = $('[data-hdr]');
  const mbar = $('[data-mbar]');
  const hero = $('.hero');
  const visit = $('#reserve');
  let heroOut = false, visitIn = false;
  const flag = document.body.classList.contains('has-flag') ? $('[data-preview-flag]') : null;
  const update = () => {
    if (flag) hdr.style.top = Math.max(0, flag.offsetHeight - scrollY) + 'px';
    hdr.classList.toggle('is-solid', scrollY > 24);
    if (mbar) {
      const on = heroOut && !visitIn;
      mbar.classList.toggle('is-on', on);
      mbar.setAttribute('aria-hidden', on ? 'false' : 'true');
      const a = $('a', mbar); if (a) a.tabIndex = on ? 0 : -1;
    }
  };
  addEventListener('scroll', update, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { heroOut = !e.isIntersecting; update(); }, { rootMargin: '-40% 0px 0px 0px' }).observe(hero);
    const seen = new Set();
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(e => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      visitIn = seen.size > 0; update();
    }, { rootMargin: '0px 0px -20% 0px' });
    io2.observe(visit); const ftr = $('.ftr'); if (ftr) io2.observe(ftr);
  }
  update();

  // 현재 섹션 표시
  const links = $$('.hdr__nav a');
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const a = map.get(e.target.id);
        if (a && e.isIntersecting) { links.forEach(l => l.removeAttribute('aria-current')); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }
})();

/* ---------- 모바일 메뉴 ---------- */
(function menu() {
  const btn = $('[data-menu-btn]');
  const nav = $('[data-mnav]');
  if (!btn || !nav) return;
  const set = open => {
    btn.setAttribute('aria-expanded', String(open));
    $('.sr-only', btn).textContent = open ? '메뉴 닫기' : '메뉴 열기';
    nav.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    $('[data-hdr]').classList.toggle('is-solid', open || scrollY > 24);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !nav.hidden) set(false); });
})();

/* ---------- 스크롤 등장 ---------- */
(function reveal() {
  const els = $$('[data-reveal], [data-reveal-list]');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  els.forEach(e => io.observe(e));
  $$('.act').forEach(e => io.observe(e));
})();

/* ---------- 티저 영상 ---------- */
(function teaser() {
  const player = $('[data-player]');
  const cover = $('[data-play-inline]');
  const video = player && $('video', player);
  if (cover && video) {
    cover.addEventListener('click', () => {
      video.hidden = false;
      cover.hidden = true;
      video.play().catch(() => {});
      video.focus();
    });
  }
  const modal = $('[data-vmodal]');
  const mvideo = modal && $('video', modal);
  $$('[data-play-teaser]').forEach(b => b.addEventListener('click', () => {
    if (!modal || typeof modal.showModal !== 'function') { location.hash = '#teaser'; return; }
    modal.showModal();
    mvideo.currentTime = 0;
    mvideo.play().catch(() => {});
  }));
  const close = () => { mvideo.pause(); modal.close(); };
  $('[data-vmodal-close]')?.addEventListener('click', close);
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });
  modal?.addEventListener('close', () => mvideo.pause());
})();

/* ---------- 사진 스트립 ---------- */
(function strip() {
  const box = $('[data-strip]');
  if (!box) return;
  const items = $$('.strip__list li', box);
  const count = $('[data-strip-count]');
  const prev = $('[data-strip-prev]');
  const next = $('[data-strip-next]');
  const current = () => {
    const left = box.scrollLeft + parseFloat(getComputedStyle(box).scrollPaddingLeft || 0);
    let idx = 0, best = Infinity;
    items.forEach((li, i) => { const d = Math.abs(li.offsetLeft - left); if (d < best) { best = d; idx = i; } });
    return idx;
  };
  const sync = () => {
    const i = current();
    if (count) count.textContent = `${i + 1} / ${items.length}`;
    if (prev) prev.disabled = box.scrollLeft < 4;
    if (next) next.disabled = box.scrollLeft + box.clientWidth >= box.scrollWidth - 4;
  };
  const go = dir => {
    const i = Math.max(0, Math.min(items.length - 1, current() + dir));
    const pad = parseFloat(getComputedStyle(box).scrollPaddingLeft || 0);
    box.scrollTo({ left: items[i].offsetLeft - pad, behavior: 'smooth' });
  };
  prev?.addEventListener('click', () => go(-1));
  next?.addEventListener('click', () => go(1));
  box.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  box.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
  addEventListener('resize', sync);
  sync();

  // 크게 보기
  const lbox = $('[data-lbox]');
  const img = $('[data-lbox-img]');
  $$('[data-lightbox]').forEach(b => b.addEventListener('click', () => {
    if (!lbox || typeof lbox.showModal !== 'function') return;
    img.src = b.dataset.lightbox;
    img.alt = $('img', b).alt;
    lbox.showModal();
  }));
  $('[data-lbox-close]')?.addEventListener('click', () => lbox.close());
  lbox?.addEventListener('click', e => { if (e.target === lbox || e.target === img) lbox.close(); });
})();

/* ---------- 복사 · 공유 ---------- */
const toast = (() => {
  const el = $('[data-toast]');
  let t;
  return msg => { el.textContent = msg; el.classList.add('is-on'); clearTimeout(t); t = setTimeout(() => el.classList.remove('is-on'), 2200); };
})();

function legacyCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
  document.body.appendChild(ta);
  ta.select(); ta.setSelectionRange(0, text.length);
  let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
  ta.remove(); return ok;
}
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1200))
      ]);
      return true;
    } catch (_) { /* 아래 방식으로 재시도 */ }
  }
  return legacyCopy(text);
}
$$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  const ok = await copyText(b.dataset.copy);
  toast(ok ? (b.dataset.copyMsg || '복사했습니다') : '복사하지 못했습니다. 길게 눌러 복사해 주세요');
}));

const shareUrl = () => (location.protocol.startsWith('http') && !/127\.0\.0\.1|localhost/.test(location.host)) ? location.href.split('#')[0] : CONFIG.url;
$$('[data-share]').forEach(b => b.addEventListener('click', async () => {
  const data = { title: '워십 뮤지컬 〈마크〉 아산 특별공연', text: '2027년 1월 23일(토) 생명샘동천교회', url: shareUrl() };
  const touch = matchMedia('(pointer: coarse)').matches;
  if (navigator.share && touch) {
    try { await navigator.share(data); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const ok = await copyText(data.url);
  toast(ok ? '링크를 복사했습니다. 카카오톡에 붙여 넣어 보내세요' : '주소: ' + data.url);
}));

/* ---------- 캘린더 ---------- */
(function calendar() {
  const wrap = $('[data-cal]');
  if (!wrap) return;
  const btn = $('[data-cal-btn]', wrap);
  const menu = $('[data-cal-menu]', wrap);
  const [y, m, d] = CONFIG.date.split('-');
  const ymd = `${y}${m}${d}`;
  const title = '워십 뮤지컬 〈마크〉 아산 특별공연';
  const details = (CONFIG.time ? '' : '공연 시간은 확정 후 안내됩니다. ') + '관람 안내: ' + CONFIG.url;
  let dates, icsTime;
  if (CONFIG.time) {
    const [h, mi] = CONFIG.time.split(':');
    const startUTC = new Date(Date.UTC(+y, +m - 1, +d, +h - 9, +mi));
    const endUTC = new Date(startUTC.getTime() + 100 * 60000);
    const f = t => t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    dates = `${f(startUTC)}/${f(endUTC)}`;
    icsTime = [`DTSTART:${f(startUTC)}`, `DTEND:${f(endUTC)}`];
  } else {
    const next = new Date(Date.UTC(+y, +m - 1, +d + 1));
    const ymd2 = next.toISOString().slice(0, 10).replace(/-/g, '');
    dates = `${ymd}/${ymd2}`;
    icsTime = [`DTSTART;VALUE=DATE:${ymd}`, `DTEND;VALUE=DATE:${ymd2}`];
  }
  const g = new URL('https://calendar.google.com/calendar/render');
  g.searchParams.set('action', 'TEMPLATE');
  g.searchParams.set('text', title);
  g.searchParams.set('dates', dates);
  g.searchParams.set('details', details);
  g.searchParams.set('location', `${CONFIG.venue} (${CONFIG.address})`);
  $('[data-cal-google]', wrap).href = g.toString();

  $('[data-cal-ics]', wrap).addEventListener('click', e => {
    e.preventDefault();
    const esc = s => s.replace(/[\\,;]/g, m => '\\' + m);
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CTS//MARK ASAN//KO', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT', `UID:mark-asan-${ymd}@churchhistory.kr`, `DTSTAMP:${stamp}`, ...icsTime,
      `SUMMARY:${esc(title)}`, `LOCATION:${esc(CONFIG.venue + ' ' + CONFIG.address)}`,
      `DESCRIPTION:${esc(details)}`, `URL:${CONFIG.url}`, 'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mark-asan-20270123.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setMenu(false);
  });

  const setMenu = open => { menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', e => { e.stopPropagation(); setMenu(menu.hidden); });
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  $('[data-cal-google]', wrap).addEventListener('click', () => setMenu(false));
})();

/* ---------- 데스크톱 히어로: 스크롤 시 로고가 천천히 물러나는 효과 ---------- */
(function heroDrift() {
  if (!matchMedia('(pointer: fine) and (min-width: 900px)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const inner = $('.hero__in');
  if (!inner) return;
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(scrollY, innerHeight);
      inner.style.transform = y > 0 ? `translate3d(0, ${(y * 0.16).toFixed(1)}px, 0)` : '';
      inner.style.opacity = y > 0 ? String(Math.max(0, 1 - y / (innerHeight * 0.85)).toFixed(3)) : '';
      ticking = false;
    });
  }, { passive: true });
})();

/* ---------- 초대장 보내기 ---------- */
$$('[data-invite]').forEach(b => b.addEventListener('click', async () => {
  const url = shareUrl();
  const text = CONFIG.inviteText;
  const touch = matchMedia('(pointer: coarse)').matches;
  if (navigator.share && touch) {
    try { await navigator.share({ title: '워십 뮤지컬 〈마크〉 아산 특별공연', text, url }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const ok = await copyText(text + '\n' + url);
  toast(ok ? '초대 문구를 복사했습니다. 카카오톡에 붙여 넣어 보내세요' : '복사하지 못했습니다');
}));

/* ---------- 계좌 복사 ---------- */
$$('[data-copy-acct]').forEach(b => b.addEventListener('click', async () => {
  const all = b.dataset.copyAcct === 'all';
  const text = all ? `${CONFIG.bank.name} ${CONFIG.bank.no}\n예금주 ${CONFIG.bank.holder}` : CONFIG.bank.no;
  const ok = await copyText(text);
  toast(ok ? (all ? '계좌 정보를 복사했습니다' : '계좌번호가 복사되었습니다') : '복사하지 못했습니다. 길게 눌러 복사해 주세요');
}));

/* ---------- 사전예매 ---------- */
(function reserve() {
  const form = $('[data-rsv-form]');
  if (!form) return;
  const done = $('[data-done]');
  const won = n => n.toLocaleString('ko-KR') + '원';
  const qty = $('#r-qty');
  const phone = $('#r-phone');
  let type = '개인';
  const q = () => Math.max(1, Math.min(500, parseInt(qty.value, 10) || 1));
  const unit = () => (q() >= CONFIG.groupMin ? CONFIG.price * CONFIG.groupRate : CONFIG.price);
  const calc = () => {
    $('[data-unit]').textContent = won(unit());
    $('[data-total]').textContent = won(unit() * q());
    $('[data-disc]').hidden = q() < CONFIG.groupMin;
  };
  $$('.qty__btn', form).forEach(b => b.addEventListener('click', () => { qty.value = Math.max(1, Math.min(500, q() + Number(b.dataset.q))); calc(); }));
  qty.addEventListener('input', () => { qty.value = qty.value.replace(/\D/g, '').slice(0, 3); calc(); });
  qty.addEventListener('blur', () => { qty.value = q(); calc(); });

  const setType = t => {
    type = t;
    $$('.seg__btn', form).forEach(x => { const on = x.dataset.type === t; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', String(on)); });
    const g = t === '교회·단체';
    $('[data-church-field]').hidden = !g;
    $('[data-name-label]').textContent = g ? '담당자 이름' : '이름';
    const pick = form.querySelector(`input[name=pickup][value="${g ? '교회·단체 일괄수령' : '공연 당일 개인수령'}"]`);
    if (pick) pick.checked = true;
  };
  $$('.seg__btn', form).forEach(b => b.addEventListener('click', () => setType(b.dataset.type)));

  phone.addEventListener('input', () => {
    const v = phone.value.replace(/\D/g, '').slice(0, 11);
    phone.value = v.length < 4 ? v : v.length < 8 ? `${v.slice(0, 3)}-${v.slice(3)}` : `${v.slice(0, 3)}-${v.slice(3, v.length - 4)}-${v.slice(-4)}`;
  });
  $$('.inp', form).forEach(i => i.addEventListener('input', () => i.classList.remove('is-err')));
  const fail = (el, msg) => { if (el) { el.classList.add('is-err'); el.focus(); } toast(msg); };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const sub = $('[data-submit]');
    if (sub.disabled) return;
    const g = type === '교회·단체';
    const church = $('#r-church'), name = $('#r-name');
    if (g && !church.value.trim()) return fail(church, '교회·단체명을 입력해 주세요');
    if (!name.value.trim()) return fail(name, g ? '담당자 이름을 입력해 주세요' : '이름을 입력해 주세요');
    if (phone.value.replace(/\D/g, '').length < 10) return fail(phone, '휴대전화 번호를 확인해 주세요');
    if (!$('#r-agree').checked) return fail(null, '개인정보 수집·이용에 동의해 주세요');
    const pick = form.querySelector('input[name=pickup]:checked');
    const data = {
      type, name: name.value.trim(), church: g ? church.value.trim() : '', phone: phone.value.trim(),
      qty: q(), pickup: pick ? pick.value : '', note: $('#r-note').value.trim(), agree: true,
      website: form.elements.website.value
    };
    sub.disabled = true; sub.textContent = '신청 중…';
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      const res = await fetch(CONFIG.api, { method: 'POST', body: JSON.stringify({ site: 'mark-asan', data }), signal: ctrl.signal });
      clearTimeout(timer);
      const j = await res.json();
      if (!j || !j.ok) throw new Error(j && j.error);
      $('[data-done-who]').innerHTML = `${g ? esc(data.church) + ' ' : ''}${esc(data.name)} 님 · <b>${j.qty}매</b>${j.qty >= CONFIG.groupMin ? ' (단체 10% 할인)' : ''}`;
      $('[data-done-no]').textContent = j.no;
      $('[data-done-amt]').textContent = won(j.total);
      form.hidden = true; done.hidden = false;
      scrollTo({ top: Math.max(0, $('[data-rsv]').getBoundingClientRect().top + scrollY - 90), behavior: 'smooth' });
      done.focus({ preventScroll: true });
    } catch (err) {
      toast('신청을 저장하지 못했습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요');
    } finally {
      sub.disabled = false; sub.textContent = '사전예매 신청하기';
    }
  });

  $('[data-again]').addEventListener('click', () => {
    form.reset(); qty.value = 1; setType('개인'); calc();
    form.hidden = false; done.hidden = true;
    $('#r-name').focus();
  });
  calc();
})();
