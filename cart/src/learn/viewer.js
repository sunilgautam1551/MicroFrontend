// Code walkthrough viewer used by the learning panel.
// Each microfrontend keeps its own copy of this file (there is no shared library on purpose),
// so every app can still be built, deployed and run completely on its own.

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// A very small highlighter: comments, strings and a few keywords. Good enough for teaching.
const TOKEN =
  /(\/\/.*$|<!--.*?-->)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(const|let|import|from|export|require|module|new|if|return|for)\b/g;

const highlight = (line, ns) => {
  let html = "";
  let last = 0;
  line.replace(TOKEN, (match, comment, string, keyword, offset) => {
    const kind = comment ? "comment" : string ? "string" : "keyword";
    html += escapeHtml(line.slice(last, offset));
    html += `<span class="${ns}__${kind}">${escapeHtml(match)}</span>`;
    last = offset + match.length;
    return match;
  });
  return html + escapeHtml(line.slice(last));
};

// Notes point at lines by text ("match"), not by line number, so they survive code edits.
// Notes are matched in order, each one searching after the line of the previous note.
const attachNotes = (lines, notes, fileName) => {
  const steps = [];
  let from = 0;
  notes.forEach(({ match, note }) => {
    const line = lines.findIndex((text, i) => i >= from && text.includes(match));
    if (line === -1) {
      console.warn(`[learn] ${fileName}: no line contains "${match}"`);
      return;
    }
    steps.push({ line, note });
    from = line + 1;
  });
  return steps;
};

const css = (ns) => `
  .${ns} {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-top: 4px solid var(--accent);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
    padding: 20px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #1f2937;
  }
  .${ns} *, .${ns} *::before { box-sizing: border-box; }
  .${ns} code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12.5px;
    background: #f1f5f9;
    padding: 1px 5px;
    border-radius: 4px;
  }
  .${ns}__badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent);
    background: var(--accent-soft);
    padding: 4px 10px;
    border-radius: 999px;
  }
  .${ns}__title { margin: 10px 0 4px; font-size: 20px; }
  .${ns}__subtitle { margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5; }
  .${ns}__intro {
    margin-top: 16px;
    padding: 14px 16px;
    background: var(--accent-soft);
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.65;
  }
  .${ns}__intro p { margin: 0 0 8px; }
  .${ns}__intro p:last-child { margin: 0; }
  .${ns}__tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 18px; }
  .${ns}__tab {
    font: 500 12.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    padding: 6px 12px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #374151;
    border-radius: 999px;
    cursor: pointer;
  }
  .${ns}__tab:hover { border-color: var(--accent); }
  .${ns}__tab--active, .${ns}__tab--active:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: #ffffff;
  }
  .${ns}__about { margin: 14px 0; font-size: 14px; color: #4b5563; line-height: 1.65; }
  .${ns}__body {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
    gap: 16px;
    align-items: start;
  }
  @media (max-width: 760px) {
    .${ns}__body { grid-template-columns: minmax(0, 1fr); }
  }
  .${ns}__code {
    position: relative;
    max-height: 480px;
    overflow: auto;
    background: #0f172a;
    border-radius: 8px;
    padding: 10px 0;
    font: 12.5px/1.7 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    color: #e2e8f0;
  }
  .${ns}__lines { display: inline-block; min-width: 100%; }
  .${ns}__line { display: flex; padding-right: 16px; border-left: 3px solid transparent; }
  .${ns}__ln {
    flex: none;
    width: 52px;
    padding-right: 14px;
    text-align: right;
    color: #475569;
    user-select: none;
  }
  .${ns}__src { white-space: pre; }
  .${ns}__line--note { cursor: pointer; }
  .${ns}__line--note .${ns}__ln::before {
    content: "●";
    margin-right: 6px;
    font-size: 8px;
    vertical-align: middle;
    color: var(--accent-bright);
  }
  .${ns}__line--note:hover, .${ns}__line--note:focus-visible {
    background: rgba(148, 163, 184, 0.1);
    outline: none;
  }
  .${ns}__line--active, .${ns}__line--active:hover {
    background: rgba(148, 163, 184, 0.2);
    border-left-color: var(--accent-bright);
  }
  .${ns}__comment { color: #64748b; font-style: italic; }
  .${ns}__string { color: #86efac; }
  .${ns}__keyword { color: #c4b5fd; }
  .${ns}__explain {
    position: sticky;
    top: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    background: #fafafa;
  }
  .${ns}__step {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .${ns}__note { margin-top: 8px; font-size: 14px; line-height: 1.65; min-height: 120px; }
  .${ns}__note p { margin: 0 0 8px; }
  .${ns}__note p:last-child { margin: 0; }
  .${ns}__nav { display: flex; gap: 8px; margin-top: 16px; }
  .${ns}__btn {
    flex: 1;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #1f2937;
    font: 500 13px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    cursor: pointer;
  }
  .${ns}__btn--primary { background: var(--accent); border-color: var(--accent); color: #ffffff; }
  .${ns}__btn:disabled { opacity: 0.4; cursor: default; }
  .${ns}__hint { margin: 12px 0 0; font-size: 12px; color: #9ca3af; }
`;

const injectStyles = (ns) => {
  if (document.getElementById(`${ns}-styles`)) return;
  const style = document.createElement("style");
  style.id = `${ns}-styles`;
  style.textContent = css(ns);
  document.head.appendChild(style);
};

// files: [{ name, about, code, notes: [{ match, note }] }]
export const createLearnPanel = (el, { ns, theme, badge, title, subtitle, intro, files }) => {
  injectStyles(ns);

  const prepared = files.map((file) => {
    const lines = file.code.replace(/\n$/, "").split("\n");
    return { ...file, lines, steps: attachNotes(lines, file.notes, file.name) };
  });

  el.innerHTML = `
    <section class="${ns}" style="--accent: ${theme.accent}; --accent-soft: ${theme.soft}; --accent-bright: ${theme.bright}">
      <span class="${ns}__badge">${badge}</span>
      <h2 class="${ns}__title">${title}</h2>
      <p class="${ns}__subtitle">${subtitle}</p>
      ${intro ? `<div class="${ns}__intro">${intro}</div>` : ""}
      <div class="${ns}__tabs" role="tablist">
        ${prepared
          .map((file, i) => `<button type="button" role="tab" class="${ns}__tab" data-file="${i}">${file.name}</button>`)
          .join("")}
      </div>
      <p class="${ns}__about"></p>
      <div class="${ns}__body">
        <div class="${ns}__code"></div>
        <aside class="${ns}__explain" aria-live="polite">
          <div class="${ns}__step"></div>
          <div class="${ns}__note"></div>
          <div class="${ns}__nav">
            <button type="button" class="${ns}__btn" data-nav="prev">← Previous</button>
            <button type="button" class="${ns}__btn ${ns}__btn--primary" data-nav="next">Next →</button>
          </div>
          <p class="${ns}__hint">Lines with a dot have an explanation. Click one to jump to it.</p>
        </aside>
      </div>
    </section>`;

  const codeBox = el.querySelector(`.${ns}__code`);
  const tabs = [...el.querySelectorAll(`.${ns}__tab`)];
  const about = el.querySelector(`.${ns}__about`);
  const stepLabel = el.querySelector(`.${ns}__step`);
  const noteBox = el.querySelector(`.${ns}__note`);
  const prevBtn = el.querySelector('[data-nav="prev"]');
  const nextBtn = el.querySelector('[data-nav="next"]');

  let fileIndex = 0;
  let stepIndex = 0;

  const showStep = (scroll) => {
    const file = prepared[fileIndex];
    const step = file.steps[stepIndex];
    const isLastStep = stepIndex === file.steps.length - 1;
    const hasNextFile = fileIndex < prepared.length - 1;

    codeBox
      .querySelectorAll(`.${ns}__line--active`)
      .forEach((row) => row.classList.remove(`${ns}__line--active`));

    if (!step) {
      stepLabel.textContent = "";
      noteBox.textContent = "";
    } else {
      const row = codeBox.querySelector(`[data-line="${step.line}"]`);
      row.classList.add(`${ns}__line--active`);
      stepLabel.textContent = `Step ${stepIndex + 1} of ${file.steps.length} · line ${step.line + 1}`;
      noteBox.innerHTML = step.note;
      if (scroll) {
        codeBox.scrollTo({ top: row.offsetTop - codeBox.clientHeight / 3, behavior: "smooth" });
      }
    }

    prevBtn.disabled = stepIndex === 0;
    nextBtn.disabled = (isLastStep || !step) && !hasNextFile;
    nextBtn.textContent = (isLastStep || !step) && hasNextFile ? "Next file →" : "Next →";
  };

  const showFile = (index) => {
    fileIndex = index;
    stepIndex = 0;
    const file = prepared[index];
    const stepByLine = new Map(file.steps.map((step, i) => [step.line, i]));

    tabs.forEach((tab, i) => {
      tab.classList.toggle(`${ns}__tab--active`, i === index);
      tab.setAttribute("aria-selected", String(i === index));
    });
    about.innerHTML = file.about;

    const rows = file.lines.map((text, n) => {
      const step = stepByLine.get(n);
      const noteAttrs =
        step === undefined ? "" : ` data-step="${step}" tabindex="0" role="button" aria-label="Explain line ${n + 1}"`;
      const noteClass = step === undefined ? "" : ` ${ns}__line--note`;
      return `<div class="${ns}__line${noteClass}" data-line="${n}"${noteAttrs}><span class="${ns}__ln">${n + 1}</span><span class="${ns}__src">${highlight(text, ns) || " "}</span></div>`;
    });
    codeBox.innerHTML = `<div class="${ns}__lines">${rows.join("")}</div>`;
    codeBox.scrollTop = 0;
    showStep(false);
  };

  const goToStep = (index) => {
    stepIndex = index;
    showStep(true);
  };

  el.addEventListener("click", (event) => {
    const tab = event.target.closest(`.${ns}__tab`);
    const line = event.target.closest("[data-step]");
    const nav = event.target.closest("[data-nav]");

    if (tab) showFile(Number(tab.dataset.file));
    if (line) {
      stepIndex = Number(line.dataset.step);
      showStep(false);
    }
    if (nav && !nav.disabled) {
      const file = prepared[fileIndex];
      if (nav.dataset.nav === "prev") goToStep(stepIndex - 1);
      else if (stepIndex < file.steps.length - 1) goToStep(stepIndex + 1);
      else showFile(fileIndex + 1);
    }
  });

  el.addEventListener("keydown", (event) => {
    const line = event.target.closest("[data-step]");
    if (line && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      line.click();
    }
  });

  showFile(0);
};
