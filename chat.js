/* Jana's Flowers chat assistant.
   Shows a small chat button on every page that loads this file.
   It stays hidden until "chatUrl" in data.json points to the proxy (see worker/README.md). */
(function () {
  "use strict";

  var MAX_TURNS = 12;      // messages kept in the conversation sent to the server
  var MAX_CHARS = 500;     // longest message a visitor can send
  var history = [];
  var busy = false;
  var chatUrl = "";
  var phone = "";
  var root, panel, list, input, sendBtn, launcher;

  function lang() {
    try { var v = localStorage.getItem("jf-lang"); if (v === "en" || v === "mn") return v; } catch (e) {}
    return document.documentElement.lang === "en" ? "en" : "mn";
  }
  var T = {
    mn: {
      title: "Жанагийн туслах", open: "Чатлах", close: "Хаах", send: "Илгээх",
      ph: "Асуултаа бичнэ үү...", hello: "Сайн байна уу! Би Jana's Flowers-ийн AI туслах. Цэцэг сонгох, цэцгийн утга, дэлгүүрийн мэдээллээр тусална. Юу хэрэгтэй вэ?",
      think: "Бичиж байна...", err: "Уучлаарай, одоогоор хариулж чадсангүй. Утсаар залгана уу: ",
      note: "AI хариулт алдаатай байж болно. Захиалгыг утсаар баталгаажуулна уу.",
      s1: "Төрсөн өдөрт ямар цэцэг тохиромжтой вэ?", s2: "Сарнайн утга юу вэ?", s3: "Хэдэн цагт нээлттэй вэ?"
    },
    en: {
      title: "Jana's assistant", open: "Chat", close: "Close", send: "Send",
      ph: "Type your question...", hello: "Hi! I'm the AI assistant for Jana's Flowers. I can help you pick flowers, explain what they mean, and share shop info. What do you need?",
      think: "Typing...", err: "Sorry, I couldn't answer just now. Please call us: ",
      note: "AI answers can be wrong. Please confirm orders by phone.",
      s1: "What flowers suit a birthday?", s2: "What does a rose mean?", s3: "What are your opening hours?"
    }
  };
  function t(k) { return T[lang()][k]; }

  var css = [
    "#jfc{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:90;font-family:var(--body,'Manrope','Segoe UI',system-ui,sans-serif);color:var(--fg,#19211D)}",
    "#jfc *{box-sizing:border-box}",
    "#jfc .jfc-btn{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:0 20px;border:0;border-radius:999px;background:var(--accent,#2E5B49);color:var(--on-accent,#F6F7F4);font-weight:600;font-size:15px;line-height:1;font-family:inherit;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.22)}",
    "#jfc .jfc-btn svg{width:20px;height:20px}",
    "#jfc .jfc-panel{position:absolute;right:0;bottom:60px;width:min(380px,calc(100vw - 32px));height:min(540px,calc(100vh - 110px));display:flex;flex-direction:column;background:var(--bg,#F6F7F4);border:1px solid var(--line,#D5DAD3);border-radius:12px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.28)}",
    "#jfc .jfc-panel[hidden]{display:none}",
    "#jfc .jfc-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:var(--accent,#2E5B49);color:var(--on-accent,#F6F7F4)}",
    "#jfc .jfc-head strong{font-family:var(--display,'Cormorant Garamond',Georgia,serif);font-size:22px;font-weight:600}",
    "#jfc .jfc-x{border:0;background:transparent;color:inherit;font-size:24px;line-height:1;cursor:pointer;padding:4px 8px;border-radius:6px}",
    "#jfc .jfc-list{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}",
    "#jfc .jfc-m{max-width:86%;padding:10px 14px;border-radius:14px;font-size:15px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}",
    "#jfc .jfc-m.bot{align-self:flex-start;background:var(--surface,#ECF0EA)}",
    "#jfc .jfc-m.me{align-self:flex-end;background:var(--accent,#2E5B49);color:var(--on-accent,#F6F7F4)}",
    "#jfc .jfc-m.wait{color:var(--muted,#5E6963);font-style:italic}",
    "#jfc .jfc-sugg{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px}",
    "#jfc .jfc-sugg button{font-weight:600;font-size:13px;line-height:1.2;font-family:inherit;padding:8px 12px;border-radius:999px;border:1px solid var(--line,#D5DAD3);background:transparent;color:var(--fg,#19211D);cursor:pointer;text-align:left}",
    "#jfc .jfc-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line,#D5DAD3)}",
    "#jfc .jfc-form input{flex:1;min-width:0;font-weight:400;font-size:16px;line-height:1;font-family:inherit;padding:12px 14px;border-radius:999px;border:1px solid var(--line,#D5DAD3);background:var(--surface,#ECF0EA);color:var(--fg,#19211D)}",
    "#jfc .jfc-form button{border:0;border-radius:999px;padding:0 16px;font-weight:600;font-size:14px;line-height:1;font-family:inherit;background:var(--accent,#2E5B49);color:var(--on-accent,#F6F7F4);cursor:pointer}",
    "#jfc .jfc-form button:disabled{opacity:.5;cursor:default}",
    "#jfc .jfc-note{margin:0;padding:0 16px 10px;font-size:11px;color:var(--muted,#5E6963)}",
    "#jfc :focus-visible{outline:2px solid var(--accent,#2E5B49);outline-offset:2px}",
    "@media (max-width:480px){#jfc .jfc-panel{position:fixed;left:8px;right:8px;bottom:8px;top:8px;width:auto;height:auto}}"
  ].join("\n");

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function addMsg(who, text) {
    var m = el("div", "jfc-m " + who, text);
    list.appendChild(m);
    list.scrollTop = list.scrollHeight;
    return m;
  }

  function send(text) {
    text = String(text || "").trim().slice(0, MAX_CHARS);
    if (!text || busy) return;
    var sugg = root.querySelector(".jfc-sugg");
    if (sugg) sugg.remove();
    addMsg("me", text);
    history.push({ role: "user", content: text });
    history = history.slice(-MAX_TURNS);
    input.value = "";
    busy = true; sendBtn.disabled = true;
    var wait = addMsg("bot wait", t("think"));

    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 30000);
    fetch(chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, lang: lang() }),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) { if (!r.ok) throw new Error("bad"); return r.json(); })
      .then(function (d) {
        var reply = d && typeof d.reply === "string" ? d.reply.trim() : "";
        if (!reply) throw new Error("empty");
        wait.className = "jfc-m bot";
        wait.textContent = reply;
        history.push({ role: "assistant", content: reply });
        history = history.slice(-MAX_TURNS);
      })
      .catch(function () {
        history.pop();
        wait.className = "jfc-m bot";
        wait.textContent = t("err") + phone;
      })
      .then(function () {
        clearTimeout(timer);
        busy = false; sendBtn.disabled = false;
        list.scrollTop = list.scrollHeight;
        input.focus();
      });
  }

  function build() {
    var style = el("style"); style.textContent = css; document.head.appendChild(style);
    root = el("div"); root.id = "jfc";

    launcher = el("button", "jfc-btn");
    launcher.type = "button";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "jfc-panel");
    launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span></span>';

    panel = el("div", "jfc-panel"); panel.id = "jfc-panel"; panel.hidden = true;
    panel.setAttribute("role", "dialog");

    var head = el("div", "jfc-head");
    var title = el("strong");
    var x = el("button", "jfc-x", "×"); x.type = "button";
    head.appendChild(title); head.appendChild(x);

    list = el("div", "jfc-list"); list.setAttribute("aria-live", "polite");
    var sugg = el("div", "jfc-sugg");
    ["s1", "s2", "s3"].forEach(function (k) {
      var b = el("button"); b.type = "button"; b.setAttribute("data-k", k);
      b.addEventListener("click", function () { send(b.textContent); });
      sugg.appendChild(b);
    });

    var form = el("form", "jfc-form");
    input = el("input"); input.type = "text"; input.maxLength = MAX_CHARS; input.autocomplete = "off";
    sendBtn = el("button"); sendBtn.type = "submit";
    form.appendChild(input); form.appendChild(sendBtn);
    var note = el("p", "jfc-note");

    panel.appendChild(head); panel.appendChild(list); panel.appendChild(sugg); panel.appendChild(form); panel.appendChild(note);
    root.appendChild(panel); root.appendChild(launcher);
    document.body.appendChild(root);

    function label() {
      launcher.querySelector("span").textContent = t("open");
      title.textContent = t("title");
      x.setAttribute("aria-label", t("close"));
      panel.setAttribute("aria-label", t("title"));
      input.placeholder = t("ph"); input.setAttribute("aria-label", t("ph"));
      sendBtn.textContent = t("send");
      note.textContent = t("note");
      Array.prototype.forEach.call(sugg.children, function (b) { b.textContent = t(b.getAttribute("data-k")); });
    }
    label();

    var greeted = false;
    function toggle(open) {
      panel.hidden = !open;
      launcher.setAttribute("aria-expanded", String(open));
      if (open) {
        label();
        if (!greeted) { greeted = true; addMsg("bot", t("hello")); }
        input.focus();
      } else { launcher.focus(); }
    }
    launcher.addEventListener("click", function () { toggle(panel.hidden); });
    x.addEventListener("click", function () { toggle(false); });
    root.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) toggle(false); });
    form.addEventListener("submit", function (e) { e.preventDefault(); send(input.value); });
  }

  fetch("data.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("bad"); return r.json(); })
    .then(function (d) {
      var u = String((d && d.chatUrl) || "");
      if (!/^https:\/\//i.test(u)) return;      // not set up yet: stay hidden
      chatUrl = u;
      phone = (d.shop && d.shop.phone) || "";
      if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
    })
    .catch(function () {});
})();
