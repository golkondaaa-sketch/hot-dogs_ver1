(function () {
  "use strict";

  var TITLE = "Мастера хот-догов";
  var waveContainer = document.getElementById("waveTitle");
  var hero = document.getElementById("hero");

  function buildWaveTitle() {
    if (!waveContainer) return;
    var frag = document.createDocumentFragment();
    var index = 0;
    for (var i = 0; i < TITLE.length; i++) {
      var ch = TITLE[i];
      if (ch === " ") {
        frag.appendChild(document.createTextNode("\u00A0"));
        continue;
      }
      var span = document.createElement("span");
      span.className = "wave-char";
      span.textContent = ch;
      span.style.setProperty("--wave-i", String(index));
      index++;
      frag.appendChild(span);
    }
    waveContainer.appendChild(frag);
  }

  function initReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    nodes.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initHeroCursorTrail() {
    if (!hero) return;

    var throttleMs = 32;
    var last = 0;

    hero.addEventListener(
      "mousemove",
      function (e) {
        var now = performance.now();
        if (now - last < throttleMs) return;
        last = now;

        var rect = hero.getBoundingClientRect();
        var x = e.clientX - rect.left - 4;
        var y = e.clientY - rect.top - 4;

        var dot = document.createElement("span");
        dot.className = "cursor-dot";
        dot.style.setProperty("--tx", String(x));
        dot.style.setProperty("--ty", String(y));
        hero.appendChild(dot);

        window.setTimeout(function () {
          if (dot.parentNode) dot.parentNode.removeChild(dot);
        }, 520);
      },
      { passive: true }
    );
  }

  buildWaveTitle();
  initReveal();
  initHeroCursorTrail();
})();

// ===================== SLIDER =====================
(function () {
  const track   = document.getElementById('sliderTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dots    = document.querySelectorAll('.dot');
  const total   = document.querySelectorAll('.slide').length;
  let current   = 0;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
  });
})();
// ===================== /SLIDER =====================

// ===================== HOTDOG DRAGGABLE =====================
document.addEventListener('DOMContentLoaded', function () {
  var el = document.getElementById('hotdogEmoji');
  if (!el) return;

  var offsetX = 0;
  var offsetY = 0;
  var active  = false;

  /* ——— начало перетаскивания ——— */
  function startDrag(clientX, clientY) {
    var rect = el.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    active  = true;
    el.classList.add('dragging');
  }

  /* ——— движение ——— */
  function duringDrag(clientX, clientY) {
    if (!active) return;
    var x = clientX - offsetX;
    var y = clientY - offsetY;
    var maxX = window.innerWidth  - el.offsetWidth;
    var maxY = window.innerHeight - el.offsetHeight;
    el.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    el.style.top  = Math.max(0, Math.min(y, maxY)) + 'px';
  }

  /* ——— конец перетаскивания ——— */
  function endDrag() {
    active = false;
    el.classList.remove('dragging');
  }

  /* ——— Мышь ——— */
  el.addEventListener('mousedown', function (e) {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });

  document.addEventListener('mousemove', function (e) {
    duringDrag(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', endDrag);

  /* ——— Тач ——— */
  el.addEventListener('touchstart', function (e) {
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!active) return;
    e.preventDefault();
    duringDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  document.addEventListener('touchend', endDrag);
});
// ===================== /HOTDOG DRAGGABLE =====================

// ===================== ORDER FORM =====================
(function () {

  // ——— НАСТРОЙКИ SUPABASE — замени ТВОЙ_ANON_KEY на свой ключ ———
  var SUPABASE_URL = 'https://onpajtjszwwktrlqqsbc.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucGFqdGpzend3a3RybHFxc2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjk5NjMsImV4cCI6MjA5MDY0NTk2M30.eQR2G3ZVUnlx_-EZkm8BYertiTvclo5r7UUIhxohdF0';
  var TABLE        = 'results';
  // ———————————————————————————————————————————————————————————————

  var form        = document.getElementById('orderForm');
  var submitBtn   = document.getElementById('formSubmit');
  var submitText  = submitBtn ? submitBtn.querySelector('.form-submit-text') : null;
  var submitLoad  = submitBtn ? submitBtn.querySelector('.form-submit-loading') : null;
  var errorBox    = document.getElementById('formError');
  var overlay     = document.getElementById('popupOverlay');
  var closeBtn    = document.getElementById('popupClose');

  if (!form) return;

  /* ——— Попап ——— */
  function showPopup() {
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
  }

  function hidePopup() {
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
  }

  closeBtn.addEventListener('click', hidePopup);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) hidePopup();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hidePopup();
  });

  /* ——— Состояние кнопки ——— */
  function setLoading(on) {
    submitBtn.disabled = on;
    submitText.hidden  = on;
    submitLoad.hidden  = !on;
  }

  function showError(msg) {
    errorBox.textContent = msg;
  }

  function clearError() {
    errorBox.textContent = '';
  }

  /* ——— Валидация ——— */
  function validate(data) {
    if (!data.full_name) return 'Имя забыл';
    if (!data.hot_dog || data.hot_dog < 1) return 'Укажите количество хот-догов';
    if (data.sauce === null) return 'а соус?';
    if (!data.phone)     return 'Укажите номер телефона';
    return null;
  }

  /* ——— Отправка в Supabase ——— */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    var sauceInput = form.querySelector('input[name="sauce"]:checked');

    var data = {
      full_name: form.elements['full_name'].value.trim(),
      hot_dog:   parseInt(form.elements['hot_dog'].value, 10) || 0,
      sauce:     sauceInput ? sauceInput.value === 'true' : null,
      comm:      form.elements['comm'].value.trim(),
      phone:     form.elements['phone'].value.trim()
    };

    var err = validate(data);
    if (err) { showError(err); return; }

    setLoading(true);

    fetch(SUPABASE_URL + '/rest/v1/' + TABLE, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(data)
    })
    .then(function (res) {
      if (!res.ok) {
        return res.json().then(function (body) {
          throw new Error(body.message || 'Ошибка сервера: ' + res.status);
        });
      }
      form.reset();
      showPopup();
    })
    .catch(function (error) {
      showError('Не удалось отправить заказ. Попробуйте ещё раз.');
      console.error('Supabase error:', error);
    })
    .finally(function () {
      setLoading(false);
    });
  });

})();
// ===================== /ORDER FORM =====================
