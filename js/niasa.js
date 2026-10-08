/* Niasa México — home «Capa por capa» */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Header ---------- */
  var header = $("#header");
  var wa = $(".wa");
  var lastY = 0;
  function onScrollHeader() {
    var y = window.scrollY;
    header.classList.toggle("is-solid", y > 40);
    var menuOpen = $("#movil").classList.contains("is-open");
    header.classList.toggle("is-hidden", !menuOpen && y > 700 && y > lastY + 4);
    if (y < lastY - 4 || y < 700) header.classList.remove("is-hidden");
    if (wa) wa.classList.toggle("is-on", y > window.innerHeight * 0.75);
    lastY = y;
  }

  /* ---------- Menú móvil ---------- */
  var burger = $(".burger");
  var movil = $("#movil");
  function setMovil(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    movil.hidden = !open;
    movil.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) header.classList.add("is-solid"); else onScrollHeader();
  }
  burger.addEventListener("click", function () { setMovil(burger.getAttribute("aria-expanded") !== "true"); });
  $$("a", movil).forEach(function (a) { a.addEventListener("click", function () { setMovil(false); }); });

  /* ---------- Desplegable Herramientas ---------- */
  var drop = $(".nav__drop");
  var dropBtn = $("button", drop);
  function setDrop(open) {
    if (open) drop.setAttribute("data-open", ""); else drop.removeAttribute("data-open");
    dropBtn.setAttribute("aria-expanded", String(open));
  }
  dropBtn.addEventListener("click", function (e) { e.stopPropagation(); setDrop(!drop.hasAttribute("data-open")); });
  drop.addEventListener("mouseenter", function () { if (window.matchMedia("(hover:hover)").matches) setDrop(true); });
  drop.addEventListener("mouseleave", function () { if (window.matchMedia("(hover:hover)").matches) setDrop(false); });
  document.addEventListener("click", function (e) { if (!drop.contains(e.target)) setDrop(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (drop.hasAttribute("data-open")) { setDrop(false); dropBtn.focus(); }
    if (movil.classList.contains("is-open")) { setMovil(false); burger.focus(); }
  });

  /* ---------- Estratos (acordeón) ---------- */
  var estratos = $$(".estrato");
  function setCapa(li, open) {
    var btn = $(".estrato__cab", li);
    li.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
  }
  estratos.forEach(function (li) {
    $(".estrato__cab", li).addEventListener("click", function () {
      var open = !li.classList.contains("is-open");
      estratos.forEach(function (o) { if (o !== li) setCapa(o, false); });
      setCapa(li, open);
    });
  });

  /* ---------- «¿Qué vas a hacer?» ---------- */
  $$(".tarea").forEach(function (b) {
    b.addEventListener("click", function () {
      var li = document.getElementById("capa-" + b.getAttribute("data-capa"));
      if (!li) return;
      estratos.forEach(function (o) { setCapa(o, o === li); });
      li.classList.add("is-in");
      var top = li.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 8);
      window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
      li.classList.remove("is-flash"); void li.offsetWidth; li.classList.add("is-flash");
      setTimeout(function () { $(".estrato__cab", li).focus({ preventScroll: true }); }, reduce ? 0 : 700);
    });
  });

  /* ---------- A.Plana: 4 capas que se vuelven una ---------- */
  var pista = $(".aplana__pista");
  var capas4 = $(".capas4");
  var wide = window.matchMedia("(min-width:961px)");
  function onScrollAplana() {
    if (!capas4) return;
    if (reduce) { capas4.style.setProperty("--p", 1); return; }
    var vh = window.innerHeight, p;
    if (wide.matches) {
      var r = pista.getBoundingClientRect();
      var total = r.height - vh;
      var t = total > 0 ? -r.top / total : 0;   // 0 → 1 mientras la sección está fija
      p = (t - 0.18) / 0.5;
    } else {
      var rc = capas4.getBoundingClientRect();
      p = (vh * 0.75 - rc.top) / (vh * 0.4);
    }
    p = Math.max(0, Math.min(1, p));
    capas4.style.setProperty("--p", p.toFixed(3));
  }

  /* ---------- Calculadora (fórmula de la calculadora oficial Niasa) ---------- */
  var cL = $("#c-largo"), cA = $("#c-ancho"), cM = $("#c-m2");
  function rendimiento(cm2) {            // m² por saco de 20 kg según el tamaño de la pieza
    if (cm2 < 1600) return 2.5;
    if (cm2 < 2500) return 2.2;
    if (cm2 < 3600) return 2.1;
    if (cm2 < 8100) return 2;
    return 1.4;
  }
  function fmt(n) { return String(n).replace(".", ","); }
  function calcular() {
    var L = parseFloat(cL.value), A = parseFloat(cA.value), M = parseFloat(cM.value);
    var ok = L > 0 && A > 0 && M > 0;
    [cL, cA, cM].forEach(function (i) { i.setAttribute("aria-invalid", String(!(parseFloat(i.value) > 0) && i.value !== "")); });
    if (!ok) {
      $("#c-sacos").textContent = "—";
      $("#c-unidad").textContent = "sacos de 20 kg";
      $("#c-nota").textContent = "Completa largo, ancho y m² a instalar.";
      return;
    }
    var y = rendimiento(L * A);
    var s = Math.ceil(M / y);
    $("#c-sacos").textContent = s;
    $("#c-unidad").textContent = s === 1 ? "saco de 20 kg" : "sacos de 20 kg";
    $("#c-nota").textContent = "Para piezas de " + fmt(L) + " × " + fmt(A) + " cm se estima un rendimiento de " + fmt(y) + " m² por saco.";
  }
  if (cL) {
    [cL, cA, cM].forEach(function (i) { i.addEventListener("input", calcular); });
    $("#calc").addEventListener("submit", function (e) { e.preventDefault(); calcular(); });
    calcular();
  }

  /* ---------- Mapa de plantas (matriz de puntos) ---------- */
  var MX = [[32.53,-117.12],[32.72,-114.72],[32.49,-114.81],[31.33,-111.07],[31.33,-108.21],[31.78,-108.21],[31.78,-106.53],[31.0,-105.6],[30.63,-104.98],[29.56,-104.41],[28.98,-103.15],[29.6,-102.4],[29.77,-101.4],[29.32,-100.93],[28.7,-100.52],[27.5,-99.51],[26.4,-99.1],[26.08,-98.3],[25.87,-97.5],[25.95,-97.15],[24.6,-97.7],[23.8,-97.75],[22.25,-97.8],[21.5,-97.4],[20.95,-97.35],[20.2,-96.65],[19.2,-96.12],[18.78,-95.75],[18.4,-94.9],[18.15,-94.42],[18.35,-93.6],[18.45,-92.7],[18.65,-91.83],[19.35,-90.72],[19.85,-90.53],[20.5,-90.45],[20.86,-90.4],[21.28,-89.66],[21.42,-88.5],[21.55,-87.5],[21.6,-87.08],[21.15,-86.8],[20.63,-87.07],[20.2,-87.43],[19.6,-87.45],[18.9,-87.65],[18.27,-87.83],[18.48,-88.3],[17.85,-89.15],[17.82,-90.98],[17.25,-90.98],[17.25,-91.44],[16.75,-91.0],[16.08,-90.44],[16.07,-91.73],[15.25,-92.07],[14.53,-92.23],[14.68,-92.4],[15.35,-93.2],[15.95,-94.2],[16.2,-94.8],[16.17,-95.2],[15.75,-96.1],[15.66,-96.5],[15.86,-97.07],[16.2,-98.1],[16.55,-99.0],[16.85,-99.88],[17.3,-101.0],[17.64,-101.55],[17.95,-102.2],[18.3,-103.2],[18.75,-103.75],[19.05,-104.32],[19.35,-104.9],[20.4,-105.7],[20.65,-105.25],[21.0,-105.3],[21.54,-105.29],[22.5,-105.75],[23.2,-106.42],[24.0,-107.1],[24.63,-107.92],[25.3,-108.5],[25.6,-109.05],[26.3,-109.25],[27.0,-109.95],[27.92,-110.9],[28.82,-111.94],[29.8,-112.6],[31.3,-113.55],[31.6,-114.1],[31.8,-114.75],[31.03,-114.84],[30.0,-114.6],[28.95,-113.55],[28.0,-112.8],[27.34,-112.27],[26.9,-111.98],[26.01,-111.35],[25.0,-110.7],[24.14,-110.31],[24.0,-109.85],[23.4,-109.42],[23.06,-109.68],[22.88,-109.91],[23.45,-110.22],[24.3,-111.4],[24.6,-112.1],[25.4,-112.15],[26.0,-112.6],[26.72,-113.57],[27.14,-114.3],[27.85,-115.08],[28.0,-114.1],[28.6,-114.25],[29.3,-114.85],[30.06,-115.73],[30.48,-115.95],[31.2,-116.4],[31.86,-116.62]];
  var SITIOS = [
    { id: "tijuana", n: "Tijuana", lat: 32.52, lon: -116.95, dx: 13, dy: 4, a: "start" },
    { id: "juarez", n: "Cd. Juárez", lat: 31.69, lon: -106.42, dx: 13, dy: 4, a: "start", b: 1 },
    { id: "chihuahua", n: "Chihuahua", lat: 28.63, lon: -106.08, dx: 13, dy: 4, a: "start" },
    { id: "navojoa", n: "Navojoa", lat: 27.07, lon: -109.44, dx: 13, dy: 5, a: "start" },
    { id: "culiacan", n: "Culiacán · CEN", lat: 24.81, lon: -107.39, dx: 13, dy: 5, a: "start", b: 1 },
    { id: "guadalajara", n: "Guadalajara", lat: 20.72, lon: -103.40, dx: -13, dy: 4, a: "end" },
    { id: "tizayuca", n: "Tizayuca", lat: 19.84, lon: -98.98, dx: 13, dy: -2, a: "start" }
  ];
  function dibujaMapa() {
    var svg = $("#mapa-svg");
    if (!svg) return;
    var NS = "http://www.w3.org/2000/svg";
    var LON0 = -118, LAT0 = 33.2, K = Math.cos(23.5 * Math.PI / 180), S = 20.5;
    function px(lat, lon) { return [(lon - LON0) * K * S, (LAT0 - lat) * S]; }
    var W = (-86 - LON0) * K * S, H = (LAT0 - 14) * S;
    svg.setAttribute("viewBox", "-6 -6 " + (W + 12) + " " + (H + 12));
    function el(tag, attrs, parent) {
      var e = document.createElementNS(NS, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(e);
      return e;
    }
    // retícula
    var g0 = el("g", {});
    [15, 20, 25, 30].forEach(function (lat) {
      var y = px(lat, 0)[1];
      el("line", { x1: 0, x2: W, y1: y, y2: y, class: "grat" }, g0);
      el("text", { x: W - 2, y: y - 4, "text-anchor": "end", class: "grat-t" }, g0).textContent = lat + "°N";
    });
    [-115, -110, -105, -100, -95, -90].forEach(function (lon) {
      var x = px(0, lon)[0];
      el("line", { x1: x, x2: x, y1: 0, y2: H, class: "grat" }, g0);
      el("text", { x: x + 4, y: H - 4, class: "grat-t" }, g0).textContent = Math.abs(lon) + "°O";
    });
    // puntos dentro del polígono
    var poly = MX.map(function (p) { return [p[1], p[0]]; });
    function dentro(x, y) {
      var c = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
      }
      return c;
    }
    var paso = 8.6, g1 = el("g", {}), d = "";
    for (var yy = paso / 2; yy < H; yy += paso) {
      for (var xx = paso / 2; xx < W; xx += paso) {
        var lon = xx / (K * S) + LON0, lat = LAT0 - yy / S;
        if (dentro(lon, lat)) d += "M" + (xx - 2.3).toFixed(1) + " " + yy.toFixed(1) + "a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0-4.6 0";
      }
    }
    el("path", { d: d, class: "pt" }, g1);
    // corporativo CDMX
    var c = px(19.43, -99.13), gc = el("g", { class: "cdmx" });
    el("rect", { x: c[0] - 3.5, y: c[1] - 3.5, width: 7, height: 7 }, gc);
    el("text", { x: c[0] + 12, y: c[1] + 16 }, gc).textContent = "CDMX · CORPORATIVO";
    // plantas y bodegas
    SITIOS.forEach(function (s) {
      var p = px(s.lat, s.lon);
      var g = el("g", { class: "sitio" + (s.b ? " is-bodega" : ""), "data-sitio": s.id });
      el("circle", { cx: p[0], cy: p[1], r: 9, class: "halo" }, g);
      el("circle", { cx: p[0], cy: p[1], r: 5.5, class: "dot" }, g);
      el("text", { x: p[0] + s.dx, y: p[1] + s.dy, "text-anchor": s.a }, g).textContent = s.n;
    });
    // lista ↔ mapa
    $$("#sitios li").forEach(function (li) {
      var id = li.getAttribute("data-sitio");
      var g = svg.querySelector('[data-sitio="' + id + '"]');
      function on(v) { li.classList.toggle("is-on", v); if (g) g.classList.toggle("is-on", v); }
      li.addEventListener("mouseenter", function () { on(true); });
      li.addEventListener("mouseleave", function () { on(false); });
      if (g) {
        g.addEventListener("mouseenter", function () { on(true); });
        g.addEventListener("mouseleave", function () { on(false); });
      }
    });
  }
  dibujaMapa();

  /* ---------- Blog: vista previa que sigue al cursor ---------- */
  var prev = $("#blog-prev");
  if (prev && window.matchMedia("(hover:hover) and (min-width:901px)").matches) {
    var img = $("img", prev), tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function mover() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      prev.style.left = cx + "px"; prev.style.top = cy + "px";
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(mover) : 0;
    }
    $$(".nota a").forEach(function (a) {
      a.addEventListener("mouseenter", function (e) {
        img.src = a.getAttribute("data-prev");
        cx = tx = e.clientX + 170; cy = ty = e.clientY;
        prev.style.left = cx + "px"; prev.style.top = cy + "px";
        prev.classList.add("is-on");
      });
      a.addEventListener("mousemove", function (e) {
        tx = e.clientX + 170; ty = e.clientY;
        if (!raf) raf = requestAnimationFrame(mover);
      });
      a.addEventListener("mouseleave", function () { prev.classList.remove("is-on"); });
    });
  }

  /* ---------- Revelado al hacer scroll ---------- */
  var rv = $$(".sec__cab, .servicio, .ayuda, .calc, .nota, .toluca, .mx__txt, .mapa, .distrib__txt, .contacto__info, .form, .corte__pie");
  estratos.forEach(function (li, i) { li.style.setProperty("--lado", i % 2 ? -1 : 1); rv.push(li); });
  rv.forEach(function (n) { n.classList.add("rv"); });
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (n) { io.observe(n); });
    // escalonado de los estratos
    estratos.forEach(function (li, i) { li.style.transitionDelay = (i % 5) * 60 + "ms"; });
  } else {
    rv.forEach(function (n) { n.classList.add("is-in"); });
  }

  /* ---------- Diálogo ---------- */
  $$("[data-abre]").forEach(function (b) {
    b.addEventListener("click", function () {
      var d = document.getElementById(b.getAttribute("data-abre"));
      if (d && d.showModal) { d.showModal(); var f = $("input", d); if (f) f.focus(); }
    });
  });
  $$("dialog").forEach(function (d) {
    $$("[data-cierra]", d).forEach(function (b) { b.addEventListener("click", function () { d.close(); }); });
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  });

  /* ---------- Formularios → página de gracias ---------- */
  var reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function valida(form, errEl) {
    var malo = null;
    $$("[required]", form).forEach(function (i) {
      var bad = i.type === "checkbox" ? !i.checked : (!i.value.trim() || (i.type === "email" && !reEmail.test(i.value.trim())));
      i.setAttribute("aria-invalid", String(bad));
      if (bad && !malo) malo = i;
    });
    if (malo) {
      errEl.textContent = malo.type === "checkbox" ? "Acepta el aviso de privacidad para continuar." :
        (malo.type === "email" && malo.value ? "Revisa tu correo electrónico." : "Completa los campos marcados.");
      malo.focus();
      return false;
    }
    errEl.textContent = "";
    return true;
  }
  function envia(id, errId, origen) {
    var f = document.getElementById(id);
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!valida(f, document.getElementById(errId))) return;
      // Prototipo: aquí se conectaría el envío real (CRM / Elementor Forms).
      window.location.href = "gracias/?f=" + origen;
    });
    $$("[required]", f).forEach(function (i) {
      i.addEventListener("input", function () { if (i.getAttribute("aria-invalid") === "true") i.setAttribute("aria-invalid", "false"); });
    });
  }
  envia("form-contacto", "f-error", "contacto");
  envia("form-boletin", "b-error", "boletin");
  envia("form-muestra", "m-error", "muestra");

  /* ---------- Bucle de scroll ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScrollHeader(); onScrollAplana(); ticking = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScrollHeader(); onScrollAplana();
})();
