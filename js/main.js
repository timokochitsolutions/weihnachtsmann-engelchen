/* Weihnachtsmann & Engelchen – Startseite
   Kopf und Menü, Einblenden, Countdown, Glocke mit Sternenstaub,
   Türchen, Goldenes Buch, Filmstreifen, Wunschzettel */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TELEFON = '4917636467542';
  const MAIL = 'kontakt@weihnachtsmann-engelchen.de';

  /* ---------- Jahr ---------- */
  const jahr = new Date().getFullYear();
  $$('[data-jahr]').forEach((e) => { e.textContent = jahr; });

  /* ---------- Kopf und Menü ---------- */
  const kopf = $('#kopf');
  const wa = $('#wa');
  const fuss = $('.fuss');
  const beimScrollen = () => {
    kopf.classList.toggle('kopf--fest', scrollY > 24);
    // Im Fuß steht WhatsApp ohnehin, dort blendet sich der schwebende Knopf aus
    const fussSichtbar = fuss.getBoundingClientRect().top < innerHeight - 60;
    wa.classList.toggle('wa--da', scrollY > innerHeight * 0.6 && !fussSichtbar);
  };
  addEventListener('scroll', beimScrollen, { passive: true });
  beimScrollen();

  const menue = $('#menue');
  const nav = $('#nav');
  const menueOffen = () => menue.getAttribute('aria-expanded') === 'true';
  const setzeMenue = (offen) => {
    menue.setAttribute('aria-expanded', String(offen));
    nav.classList.toggle('nav--offen', offen);
    document.body.style.overflow = offen ? 'hidden' : '';
  };
  menue.addEventListener('click', () => setzeMenue(!menueOffen()));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setzeMenue(false); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menueOffen()) { setzeMenue(false); menue.focus(); }
  });
  matchMedia('(min-width: 1061px)').addEventListener('change', (e) => { if (e.matches) setzeMenue(false); });

  /* ---------- Angebots-Menü (Desktop: Hover oder Klick) ---------- */
  (() => {
    const gruppe = $('#nav-angebote');
    if (!gruppe) return;
    const auf = $('.nav__auf', gruppe);
    const setze = (offen) => {
      gruppe.classList.toggle('nav__gruppe--offen', offen);
      auf.setAttribute('aria-expanded', String(offen));
    };
    auf.addEventListener('click', () => setze(!gruppe.classList.contains('nav__gruppe--offen')));
    gruppe.addEventListener('focusout', (e) => { if (!gruppe.contains(e.relatedTarget)) setze(false); });
    document.addEventListener('click', (e) => { if (!gruppe.contains(e.target)) setze(false); });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && gruppe.classList.contains('nav__gruppe--offen')) { setze(false); auf.focus(); }
    });
  })();

  /* ---------- Einblenden beim Scrollen ---------- */
  const zeigen = $$('.zeig');
  if ('IntersectionObserver' in window && !ruhig) {
    const waechter = new IntersectionObserver((treffer) => {
      treffer.forEach((t) => {
        if (!t.isIntersecting) return;
        t.target.classList.add('sichtbar');
        waechter.unobserve(t.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    zeigen.forEach((e) => waechter.observe(e));
  } else {
    zeigen.forEach((e) => e.classList.add('sichtbar'));
  }

  /* ---------- Countdown bis Heiligabend ---------- */
  (() => {
    const feld = $('#countdown');
    if (!feld) return;
    const jetzt = new Date();
    const heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate());
    let tage = Math.round((new Date(heute.getFullYear(), 11, 24) - heute) / 864e5);
    let text;
    if (tage === 0) text = 'Heute ist <b>Heiligabend</b>';
    else if (tage === -1 || tage === -2) text = '<b>Frohe Weihnachten</b>';
    else {
      if (tage < 0) tage = Math.round((new Date(heute.getFullYear() + 1, 11, 24) - heute) / 864e5);
      text = tage === 1 ? 'Noch <b>eine Nacht</b> bis Heiligabend' : `Noch <b>${tage} Nächte</b> bis Heiligabend`;
    }
    feld.querySelector('span').innerHTML = text;
    feld.hidden = false;
  })();

  /* ---------- Sternenstaub ---------- */
  const staub = (() => {
    const leinwand = $('#staub');
    const g = leinwand.getContext('2d');
    let teile = [];
    let laeuft = false;
    let bis = 0;
    let letzter = 0;
    let w = 0;
    let h = 0;

    const groesse = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth;
      h = innerHeight;
      leinwand.width = Math.round(w * dpr);
      leinwand.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const neu = (x, y, stoss) => ({
      x, y,
      vx: stoss ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 0.3,
      vy: stoss ? -Math.random() * 3.4 - 0.4 : Math.random() * 0.5 + 0.3,
      vmax: Math.random() * 0.8 + 0.55,
      r: Math.random() * 1.6 + 0.8,
      stern: Math.random() < 0.24,
      phase: Math.random() * 6.28,
      dreh: Math.random() * 6.28,
      leben: 1,
    });

    const stern = (x, y, r, rot) => {
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      g.beginPath();
      for (let i = 0; i < 8; i++) {
        const rr = i % 2 ? r * 0.26 : r;
        const a = (i * Math.PI) / 4;
        g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      g.closePath();
      g.fill();
      g.restore();
    };

    const bild = (t) => {
      const dt = Math.min((t - letzter) / 16.7, 3);
      letzter = t;
      g.clearRect(0, 0, w, h);

      if (t < bis && teile.length < 160 && Math.random() < 0.6 * dt) {
        teile.push(neu(Math.random() * w, -12, false));
      }
      teile = teile.filter((p) => p.y < h + 24 && p.leben > 0);

      for (const p of teile) {
        p.vy = Math.min(p.vy + 0.055 * dt, p.vmax);
        p.vx *= Math.pow(0.975, dt);
        p.x += (p.vx + Math.sin(t / 900 + p.phase) * 0.28) * dt;
        p.y += p.vy * dt;
        p.dreh += 0.02 * dt;
        if (t > bis) p.leben -= 0.007 * dt;
        g.globalAlpha = Math.max(0, (0.55 + 0.45 * Math.sin(t / 260 + p.phase)) * Math.min(p.leben, 1));
        g.fillStyle = p.stern ? '#C0914A' : '#D0A961';
        if (p.stern) stern(p.x, p.y, p.r * 3.3, p.dreh);
        else { g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.2832); g.fill(); }
      }
      g.globalAlpha = 1;

      if (teile.length || t < bis) requestAnimationFrame(bild);
      else { laeuft = false; g.clearRect(0, 0, w, h); }
    };

    addEventListener('resize', () => { if (laeuft) groesse(); });

    return {
      los(x, y) {
        if (ruhig) return;
        groesse();
        for (let i = 0; i < 48; i++) teile.push(neu(x, y, true));
        bis = performance.now() + 14000;
        if (!laeuft) { laeuft = true; letzter = performance.now(); requestAnimationFrame(bild); }
      },
    };
  })();

  /* ---------- Glocke ---------- */
  (() => {
    const glocke = $('#glocke');
    if (!glocke) return;
    let ac;

    // Handglocke: Grundton plus unharmonische Teiltöne, jeder klingt unterschiedlich lang aus
    const schlag = (wann, staerke) => {
      const grund = 1318.5;
      const teiltoene = [[0.5, 0.18, 1.7], [1, 1, 1.5], [2.0, 0.5, 1.05], [2.76, 0.34, 0.8], [4.07, 0.2, 0.5], [5.4, 0.1, 0.32]];
      const summe = ac.createGain();
      summe.gain.value = 0.16 * staerke;
      summe.connect(ac.destination);
      for (const [faktor, laut, dauer] of teiltoene) {
        const o = ac.createOscillator();
        const v = ac.createGain();
        o.type = 'sine';
        o.frequency.value = grund * faktor;
        v.gain.setValueAtTime(0.0001, wann);
        v.gain.exponentialRampToValueAtTime(laut, wann + 0.004);
        v.gain.exponentialRampToValueAtTime(0.0001, wann + dauer);
        o.connect(v).connect(summe);
        o.start(wann);
        o.stop(wann + dauer + 0.05);
      }
    };

    const ton = () => {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = ac || new AC();
      if (ac.state === 'suspended') ac.resume();
      const t = ac.currentTime + 0.02;
      schlag(t, 1);
      schlag(t + 0.24, 0.8);
      schlag(t + 0.5, 0.9);
    };

    glocke.addEventListener('click', () => {
      glocke.classList.remove('laeutet', 'glocke--tipp');
      void glocke.offsetWidth;
      glocke.classList.add('laeutet');
      try { ton(); } catch (e) { /* ohne Ton weiter */ }
      const r = $('.glocke__bild', glocke).getBoundingClientRect();
      staub.los(r.left + r.width / 2, r.top + r.height * 0.7);
    });
    glocke.addEventListener('animationend', (e) => {
      if (e.animationName === 'laeuten') glocke.classList.remove('laeutet');
    });

    // Einmal pro Sitzung kurz auf die Glocke hinweisen
    try {
      if (!sessionStorage.getItem('glocke-tipp')) {
        sessionStorage.setItem('glocke-tipp', '1');
        setTimeout(() => glocke.classList.add('glocke--tipp'), 2800);
        setTimeout(() => glocke.classList.remove('glocke--tipp'), 8200);
      }
    } catch (e) { /* Speicher gesperrt: kein Hinweis */ }
  })();

  /* ---------- Türchen: Bild wechselt mit dem Angebot ---------- */
  $$('[data-tuer]').forEach((tuer) => {
    const kiste = $('.tuerchen', tuer);
    const neu = $('[data-tuerbild-neu]', tuer);
    let lauf = 0;
    $$('a[data-bild]', tuer).forEach((a) => {
      const an = () => {
        const meiner = ++lauf;
        neu.style.objectPosition = a.dataset.pos || '';
        neu.src = a.dataset.bild;
        const fertig = () => { if (meiner === lauf) kiste.classList.add('tuerchen--wechsel'); };
        if (neu.decode) neu.decode().then(fertig, fertig); else fertig();
      };
      const aus = () => { lauf++; kiste.classList.remove('tuerchen--wechsel'); };
      a.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') an(); });
      a.addEventListener('pointerleave', aus);
      a.addEventListener('focus', an);
      a.addEventListener('blur', aus);
    });
  });

  /* ---------- Das Goldene Buch ---------- */
  (() => {
    const formular = $('#buchform');
    const buch = $('#buch');
    if (!formular || !buch) return;
    const namensfeld = $('#buch-name');
    const eName = $('#eintrag-name');
    const eText = $('#eintrag-text');
    const eGruss = $('#eintrag-gruss');
    const danach = $('#buch-danach');
    let lauf = 0;

    // Schreibt Buchstabe für Buchstabe; Wörter bleiben beim Umbruch zusammen
    const schreibe = (ziel, text, start, takt) => {
      ziel.textContent = '';
      const vorlesen = document.createElement('span');
      vorlesen.className = 'nur-vorlesen';
      vorlesen.textContent = text;
      const sichtbar = document.createElement('span');
      sichtbar.setAttribute('aria-hidden', 'true');
      let i = 0;
      text.split(' ').forEach((wort, nr, alle) => {
        const w = document.createElement('span');
        w.className = 'wort';
        for (const zeichen of wort) {
          const z = document.createElement('span');
          z.className = 'z';
          z.textContent = zeichen;
          z.style.animationDelay = `${start + i * takt}ms`;
          w.appendChild(z);
          i++;
        }
        sichtbar.appendChild(w);
        if (nr < alle.length - 1) sichtbar.appendChild(document.createTextNode(' '));
      });
      ziel.append(vorlesen, sichtbar);
      return start + i * takt;
    };

    formular.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = namensfeld.value.replace(/\s+/g, ' ').trim().slice(0, 24);
      if (!name) {
        namensfeld.placeholder = 'Erst ein Vorname, bitte';
        namensfeld.focus();
        return;
      }
      const lob = new FormData(formular).get('lob');
      const meiner = ++lauf;

      const eintragen = () => {
        if (meiner !== lauf) return;
        let t = schreibe(eName, `${name},`, 0, 60);
        t = schreibe(eText, `ich habe gehört, du hast dieses Jahr ${lob}. Darüber habe ich mich ganz besonders gefreut.`, t + 260, 24);
        schreibe(eGruss, 'Dein Weihnachtsmann', t + 320, 42);
        danach.hidden = false;
      };

      const r = buch.getBoundingClientRect();
      if (r.top < 80 || r.bottom > innerHeight) buch.scrollIntoView({ block: 'center', behavior: ruhig ? 'auto' : 'smooth' });

      if (ruhig) { eintragen(); return; }
      buch.classList.remove('buch--blaettert');
      void buch.offsetWidth;
      eName.textContent = '';
      eText.textContent = '';
      eGruss.textContent = '';
      buch.classList.add('buch--blaettert');
      setTimeout(eintragen, 950);
    });

    buch.addEventListener('animationend', (e) => {
      if (e.animationName === 'blaettern') buch.classList.remove('buch--blaettert');
    });
  })();

  /* ---------- Filmstreifen mit der Maus ziehen ---------- */
  (() => {
    const film = $('#film');
    if (!film) return;
    let zug = null;
    film.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      zug = { x: e.clientX, links: film.scrollLeft, bewegt: false };
    });
    addEventListener('pointermove', (e) => {
      if (!zug) return;
      const dx = e.clientX - zug.x;
      if (!zug.bewegt && Math.abs(dx) > 4) { zug.bewegt = true; film.classList.add('film--zieht'); }
      if (zug.bewegt) film.scrollLeft = zug.links - dx;
    });
    const ende = () => { if (zug) { film.classList.remove('film--zieht'); zug = null; } };
    addEventListener('pointerup', ende);
    addEventListener('pointercancel', ende);
  })();

  /* ---------- Wunschzettel ---------- */
  (() => {
    const zettel = $('#zettel');
    if (!zettel) return;
    const wunsch = $('#z-wunsch');
    const datum = $('#z-datum');
    const datumLabel = $('#z-datum-label');
    const ort = $('#z-ort');
    const ortStueck = $('#z-ort-stueck');
    const notiz = $('#z-notiz');
    const name = $('#z-name');
    const fehler = $('#z-fehler');
    const perWhatsapp = $('#z-whatsapp');
    const perMail = $('#z-mail');

    const heute = new Date();
    datum.min = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, '0')}-${String(heute.getDate()).padStart(2, '0')}`;

    const sauber = (wert) => wert.replace(/\s+/g, ' ').trim();

    const aktualisieren = () => {
      const wahl = wunsch.selectedOptions[0];
      const vorOrt = wahl.dataset.ort === '1';
      ortStueck.hidden = !vorOrt;
      datumLabel.textContent = vorOrt ? 'am' : 'bis zum';

      let satz = `wir wünschen uns ${wahl.dataset.satz}`;
      if (datum.value) {
        const tag = new Date(`${datum.value}T12:00:00`);
        if (!Number.isNaN(tag.getTime())) {
          satz += `${vorOrt ? ' am ' : ' bis zum '}${tag.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
        }
      }
      if (vorOrt && sauber(ort.value)) satz += ` in ${sauber(ort.value)}`;

      const zeilen = ['Lieber Weihnachtsmann, liebes Engelchen,', '', `${satz}.`];
      if (sauber(notiz.value)) zeilen.push('', `Das solltet ihr noch wissen: ${notiz.value.trim()}`);
      zeilen.push('', 'Herzliche Grüße', sauber(name.value));
      const text = zeilen.join('\n');

      perWhatsapp.href = `https://wa.me/${TELEFON}?text=${encodeURIComponent(text)}`;
      perMail.href = `mailto:${MAIL}?subject=${encodeURIComponent(`Wunschzettel: ${wahl.textContent.trim()}`)}&body=${encodeURIComponent(text)}`;
      if (sauber(name.value)) fehler.hidden = true;
    };

    zettel.addEventListener('input', aktualisieren);
    zettel.addEventListener('change', aktualisieren);
    zettel.addEventListener('submit', (e) => e.preventDefault());
    aktualisieren();

    [perWhatsapp, perMail].forEach((link) => {
      link.addEventListener('click', (e) => {
        aktualisieren();
        if (sauber(name.value)) return;
        e.preventDefault();
        fehler.hidden = false;
        name.focus();
      });
    });

    // Klick auf ein Angebot wählt es im Wunschzettel vor
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-wunsch]');
      if (!link) return;
      wunsch.value = link.dataset.wunsch;
      aktualisieren();
    });
  })();
})();
