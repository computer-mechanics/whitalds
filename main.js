/* Whitalds — holding page background:
   scattered, randomly rotated line icons in two depths.
   Slow ambient drift + snappy mouse parallax per layer. */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICONS = [
    "i-house", "i-key", "i-door", "i-window", "i-bed", "i-sofa",
    "i-tub", "i-lamp", "i-plant", "i-calendar", "i-sign", "i-keytag",
  ];

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const layers = [
    {
      el: document.querySelector(".layer--far"),
      spacing: 105,        // px between icons on average
      sizeMin: 20,
      sizeMax: 30,
      strength: 26,        // parallax follow distance (px)
      driftAmp: 22,        // ambient drift amplitude (px)
      speed: 0.00013,      // drift angular speed
      phase: 0,
    },
    {
      el: document.querySelector(".layer--near"),
      spacing: 235,
      sizeMin: 30,
      sizeMax: 48,
      strength: 62,
      driftAmp: 30,
      speed: 0.000095,
      phase: 2.1,
    },
  ];

  const SVG_NS = "http://www.w3.org/2000/svg";
  const XLINK_NS = "http://www.w3.org/1999/xlink";

  /* Scatter icons: random position, random rotation, random size */
  function populate(layer) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const count = Math.ceil((w / layer.spacing) * (h / layer.spacing));

    for (let i = 0; i < count; i++) {
      const size = rand(layer.sizeMin, layer.sizeMax);
      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("width", size.toFixed(0));
      svg.setAttribute("height", size.toFixed(0));
      svg.setAttribute("class", "scatter-icon");
      svg.style.left = rand(0, 100).toFixed(2) + "%";
      svg.style.top = rand(0, 100).toFixed(2) + "%";
      svg.style.opacity = rand(0.45, 1).toFixed(2);
      svg.style.transform =
        "translate(-50%, -50%) rotate(" + rand(-32, 32).toFixed(1) + "deg)";

      const use = document.createElementNS(SVG_NS, "use");
      const icon = "#" + pick(ICONS);
      use.setAttribute("href", icon);
      use.setAttributeNS(XLINK_NS, "xlink:href", icon);
      svg.appendChild(use);
      layer.el.appendChild(svg);
    }
  }

  layers.forEach((layer) => {
    if (layer.el) populate(layer);
  });

  /* Pointer parallax: normalized -1..1, snappy follow */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  if (!reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    });
  }

  function frame(now) {
    // quick ease toward the pointer => fast parallax response
    pointer.x += (pointer.tx - pointer.x) * 0.14;
    pointer.y += (pointer.ty - pointer.y) * 0.14;

    for (const layer of layers) {
      if (!layer.el) continue;
      const driftX = Math.sin(now * layer.speed + layer.phase) * layer.driftAmp;
      const driftY = Math.cos(now * layer.speed * 0.77 + layer.phase) * layer.driftAmp;
      const px = pointer.x * layer.strength;
      const py = pointer.y * layer.strength;
      layer.el.style.transform =
        "translate3d(" + (driftX + px).toFixed(1) + "px, " +
        (driftY + py).toFixed(1) + "px, 0)";
    }
    requestAnimationFrame(frame);
  }

  if (!reduceMotion) {
    requestAnimationFrame(frame);
  }
})();

/* Assemble contact links at runtime so the raw address/number never
   appears in the page source (basic anti-scraper obfuscation) */
(() => {
  const email = document.getElementById("contact-email");
  if (email) {
    const addr = atob(email.getAttribute("data-e"));
    email.href = "mailto:" + addr;
    email.textContent = addr;
  }
  const phone = document.getElementById("contact-phone");
  if (phone) {
    const num = atob(phone.getAttribute("data-p"));
    phone.href = "tel:+44" + num.slice(1);
    phone.textContent = num.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
  }
})();
