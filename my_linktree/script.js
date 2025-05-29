const widthTester = document.createElement('span');
widthTester.style.position = 'absolute';
widthTester.style.visibility = 'hidden';
widthTester.style.whiteSpace = 'nowrap';
widthTester.style.pointerEvents = 'none';
widthTester.style.padding = '3px';
widthTester.style.fontSize = '0.7em';
widthTester.style.fontStyle = 'italic';
document.body.appendChild(widthTester);

document.addEventListener('DOMContentLoaded', () => {

  // ======================
  // 🔁 Basic Initialization
  // ======================
  const buttonControls = document.getElementById('buttonControls');
  const previewEl = document.getElementById('previewSummary');


  // 📅 Update Year
  document.querySelector('.year').textContent = new Date().getFullYear();

  // ========================
  // 🌗 Dark Mode Toggle (UI)
  // ========================
  document.getElementById('darkModeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // ========================
  // 🌈 Background Toggles
  // ========================
  const solidToggle = document.getElementById('solidToggle');
  const gradientToggle = document.getElementById('gradientToggle');
  const solidControls = document.getElementById('solidControls');
  const gradientControls = document.getElementById('gradientControls');

  solidToggle.addEventListener('click', () => {
    solidToggle.classList.add('active');
    gradientToggle.classList.remove('active');
    solidControls.style.display = 'block';
    gradientControls.style.display = 'none';
    applySolidBackground();
    updateSummary();
  });

  gradientToggle.addEventListener('click', () => {
    gradientToggle.classList.add('active');
    solidToggle.classList.remove('active');
    solidControls.style.display = 'none';
    gradientControls.style.display = 'block';
    applyGradientBackground();
    updateSummary();
  });

  // ======================
  // 🧩 Style Sync from :root
  // ======================
  const cssVarsToPickers = {
    '--card-bg': 'cardBgColor',
    '--border-color': 'cardBorderColor',
    '--text-color': 'textColor',
    '--solid-bg': 'solidBgColor',
    '--gradient-color1': 'gradientColor1',
    '--gradient-color2': 'gradientColor2',
    '--header-color': 'headerColor',
    '--username-color': 'usernameColor',
    '--btn-bg': 'btnBgColor',
    '--btn-text-color': 'btnTextColor'
  };

  const styles = getComputedStyle(document.documentElement);
  for (const [cssVar, inputId] of Object.entries(cssVarsToPickers)) {
    const input = document.getElementById(inputId);
    const value = styles.getPropertyValue(cssVar).trim();
    if (input && (value.startsWith('#') || value.startsWith('rgb'))) {
      input.value = rgbToHex(value);
    }
  }

  document.getElementById('iconColor').value = '#4e4436';

  // ======================
  // 🎨 Input Events
  // ======================
  const inputMappings = [
    ['cardBgColor', val => document.querySelector('.content-container').style.backgroundColor = val],
    ['cardBorderColor', val => document.querySelector('.content-container').style.borderColor = val],
    ['textColor', val => document.body.style.setProperty('--text-color', val)],
    ['headerColor', val => {
      document.getElementById('titleText').style.color = val;
      document.body.style.setProperty('--header-color', val);
    }],
    ['usernameColor', val => {
      document.getElementById('usernameText').style.color = val;
      document.body.style.setProperty('--username-color', val);
    }],
    ['btnBgColor', val => document.body.style.setProperty('--btn-bg', val)],
    ['btnTextColor', val => {
      document.body.style.setProperty('--btn-text-color', val);
      document.querySelectorAll('.button').forEach(btn => {
        btn.style.color = val;
      });
    }],
    
    ['iconColor', val => {
      document.body.style.setProperty('--icon-color', val);
      const icons = document.querySelector('.icons');
      if (icons) icons.style.backgroundColor = val;  // force update
    }],
    
    ['solidBgColor', applySolidBackground],
    
    ['gradientColor1', applyGradientBackground],
    ['gradientColor2', applyGradientBackground],
    ['gradientType', applyGradientBackground],
    ['fontStyle', val => document.body.style.fontFamily = val]
  ];

  inputMappings.forEach(([id, handler]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', e => {
      handler(e.target.value);
      updateSummary();
    });
  });

// ======================
// 💸 Premium Checkbox Sync
// ======================
['darkModeCheck', 'fullFontCheck'].forEach(id => {
  const checkbox = document.getElementById(id);
  if (checkbox) {
    checkbox.addEventListener('change', updateSummary);
  }
});


  // ======================
  // ✎ Content Editing
  // ======================
  document.querySelectorAll('.editable').forEach(el => {
    el.addEventListener('input', updateSummary);
  });

// ======================
// Button & Social Panel Toggles
// ======================
const btnPanel = document.getElementById('buttonControls');
const socialPanel = document.getElementById('socialControls');
const btnToggle = document.getElementById('toggleBtnPanel');
const socialToggle = document.getElementById('toggleSocialPanel');

// ⏱️ Delayed version: waits for panel animation to finish
function showBothTogglesDelayed(ms = 400) {
  setTimeout(() => {
    btnToggle.style.display = 'inline-block';
    socialToggle.style.display = 'inline-block';
  }, ms);
}


btnToggle?.addEventListener('click', () => {
  const isOpen = btnPanel.classList.contains('open');
  btnPanel.classList.toggle('open', !isOpen);
  socialPanel.classList.remove('open');

  if (!isOpen) {
    socialToggle.style.display = 'none'; // only show buttons toggle
  } else {
    showBothTogglesDelayed(); // panel just closed, show both again after animation
  }
});

socialToggle?.addEventListener('click', () => {
  const isOpen = socialPanel.classList.contains('open');
  socialPanel.classList.toggle('open', !isOpen);
  btnPanel.classList.remove('open');

  if (!isOpen) {
    btnToggle.style.display = 'none';
  } else {
    showBothTogglesDelayed();
  }
});

// Reset on preview toggle
document.getElementById('togglePreview')?.addEventListener('click', () => {
  const isPreview = document.body.classList.toggle('preview-only');

  btnPanel.classList.remove('open');
  socialPanel.classList.remove('open');

  if (!isPreview) showBothTogglesDelayed();
});


  // ======================
  // 💡 Tooltip Hover Logic
  // ======================
  attachFloatingTooltip('fontControlLabel', 'fontTooltip');
  attachFloatingTooltip('darkModeLabel', 'darkModeTooltip');
  

  function hookStaticButtons() {
    document.querySelectorAll('li.is-hover .hover-text').forEach((span) => {
      const parentButton = span.closest('a');
      const maxWidth = parentButton.offsetWidth - 20;
  
      const getTextWidth = (text) => {
        const style = getComputedStyle(span);
        widthTester.style.font = style.font;
        widthTester.style.fontSize = style.fontSize;
        widthTester.style.fontFamily = style.fontFamily;
        widthTester.style.fontStyle = style.fontStyle;
        widthTester.style.fontWeight = style.fontWeight;
        widthTester.innerText = text;
        return widthTester.offsetWidth;
      };
  
      span.addEventListener('beforeinput', (e) => {
        if (e.inputType === 'insertParagraph') return e.preventDefault();
        const incoming = e.data || '';
        const futureText = span.innerText + incoming;
        if (getTextWidth(futureText) > maxWidth) e.preventDefault();
      });
  
      span.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        let accepted = '';
        for (let char of paste) {
          if (getTextWidth(span.innerText + accepted + char) > maxWidth) break;
          accepted += char;
        }
        document.execCommand('insertText', false, accepted);
      });
  
      span.addEventListener('input', () => {
        span.innerText = span.innerText.replace(/\n/g, '');
      });
    });
    
  }
  
// ======================
// ➕ Sync Button Types + Controls
// ======================
function syncButtonControls() {
  const controlPanel = document.getElementById('buttonControls');
  const ul = document.querySelector('.content-container ul');

  // Clear existing controls (except the +add button itself)
  controlPanel.querySelectorAll('.button-control-row').forEach(el => el.remove());

  // Inject dropdown controls for each button
  ul.querySelectorAll('li').forEach((li, i) => {
    const row = document.createElement('div');
    row.className = 'button-control-row row-field';

    const label = document.createElement('label');
    label.textContent = `Button ${i + 1}`;

    const select = document.createElement('select');
    ['default', 'hover', 'dropdown'].forEach(type => {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type;
      select.appendChild(opt);
    });

    if (li.classList.contains('is-hover')) select.value = 'hover';
    else if (li.classList.contains('is-dropdown')) select.value = 'dropdown';
    else select.value = 'default';

    select.addEventListener('change', () => {
      li.classList.remove('is-hover', 'is-dropdown');
      if (select.value === 'hover') {
        li.classList.add('is-hover');
        if (!li.querySelector('.hover-text')) {
          const hoverSpan = document.createElement('span');
          hoverSpan.className = 'hover-text';
          hoverSpan.contentEditable = 'true';
          hoverSpan.innerText = 'hover text';
          li.querySelector('a.button')?.appendChild(hoverSpan);
        }
      } else if (select.value === 'dropdown') {
        li.classList.add('is-dropdown');
        if (!li.querySelector('.sub-buttons')) {
          const subText = document.createElement('div');
          subText.className = 'sub-text editable';
          subText.contentEditable = 'true';
          subText.innerText = 'extra texty text';

          const subWrap = document.createElement('div');
          subWrap.className = 'sub-buttons';
          subWrap.innerHTML = `
            <a class="button editable" contenteditable="true">option 1</a>
            <a class="button editable" contenteditable="true">option 2</a>
          `;

          li.append(subText, subWrap);
        }
      } else {
        li.querySelector('.hover-text')?.remove();
        li.querySelector('.sub-text')?.remove();
        li.querySelector('.sub-buttons')?.remove();
      }
      hookStaticButtons();
      updateSummary();
    });

    // ➖ Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '−';
    deleteBtn.setAttribute('aria-label', `Remove button ${i + 1}`);
    deleteBtn.style.marginLeft = '8px';
    deleteBtn.style.padding = '2px 6px';
    deleteBtn.style.fontFamily = 'monospace';
    deleteBtn.style.cursor = 'pointer';

    deleteBtn.addEventListener('click', () => {
      li.remove(); // remove the actual button from preview
      syncButtonControls(); // rebuild the dropdowns
      updateSummary();      // refresh total and summary
    });
 
    row.append(label, select, deleteBtn);
    controlPanel.insertBefore(row, document.getElementById('addButton'));
  });
}


// ======================
// ➕ Add Button Logic
// ======================
document.getElementById('addButton')?.addEventListener('click', () => {
  const ul = document.querySelector('.content-container ul');
  const li = document.createElement('li');
  li.innerHTML = `<a class="button editable" contenteditable="true" role="button">new button</a>`;
  li.setAttribute('data-static', '');
  ul.appendChild(li);
  hookStaticButtons();
  updateSummary();
  syncButtonControls();
});

// Initial sync on load
syncButtonControls();



  // ======================
  // 🧾 Preview Update
  // ======================
  hookStaticButtons();
  updateSummary();
});

// ======================
// 🧰 Utility Functions
// ======================
function applySolidBackground() {
  const color = document.getElementById('solidBgColor').value;
  document.body.style.background = color;
}

function applyGradientBackground() {
  const type = document.getElementById('gradientType').value;
  const c1 = document.getElementById('gradientColor1').value;
  const c2 = document.getElementById('gradientColor2').value;
  document.body.style.background = type === 'radial'
    ? `radial-gradient(circle, ${c1}, ${c2})`
    : `linear-gradient(to right, ${c1}, ${c2})`;
}

function rgbToHex(rgb) {
  if (rgb.startsWith('#')) return rgb;
  const nums = rgb.match(/\d+/g);
  return '#' + nums.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}

function attachFloatingTooltip(labelId, tooltipId, offsetX = 12, offsetY = 28) {
  const label = document.getElementById(labelId);
  const tooltip = document.getElementById(tooltipId);
  if (!label || !tooltip) return;
  label.addEventListener('mousemove', e => {
    tooltip.style.left = `${e.clientX + offsetX}px`;
    tooltip.style.top = `${e.clientY - offsetY}px`;
    tooltip.style.opacity = '1';
  });
  label.addEventListener('mouseleave', () => tooltip.style.opacity = '0');
}

// ======================
// 🧾 Summary Text Builder
// ======================
function updateSummary() {
  const previewEl = document.getElementById('previewSummary');
  if (!previewEl) return;

  const title = document.getElementById('titleText')?.innerText.trim() || '[no title]';
  const username = document.getElementById('usernameText')?.innerText.trim() || '[no username]';
  const desc = document.getElementById('descText')?.innerText.trim() || '[no description]';
  const font = getComputedStyle(document.body).getPropertyValue('font-family');
  const bg = getComputedStyle(document.body).getPropertyValue('background');
  const fg = getComputedStyle(document.body).getPropertyValue('color');
  const iconColor = getComputedStyle(document.body).getPropertyValue('--icon-color').trim();

  let total = 22;
  const addons = [];

  if (document.getElementById('darkModeCheck')?.checked) {
    total += 12;
    addons.push('+ Dark/Light mode: $12');
  }

  if (document.getElementById('fullFontCheck')?.checked) {
    total += 5;
    addons.push('+ Full Font Control: $5');
  }

  document.querySelectorAll('ul > li').forEach((li, i) => {
    const btnEl = li.querySelector('a.button');
    const label = btnEl?.innerText.trim() || `Button ${i + 1}`;
    const isHover = li.classList.contains('is-hover');
    const isDropdown = li.classList.contains('is-dropdown');
  
    if (isHover) {
      total += 2;
      addons.push(`+ "${label}" (Hover): $2`);
    } else if (isDropdown) {
      total += 4;
      addons.push(`+ "${label}" (Dropdown): $4`);
    }
  });
  
  

  const addonSummary = addons.length > 0 ? `Add-ons:\n  ${addons.join('\n  ')}` : '';

  previewEl.innerText = `✧ Preview ✧
Title: ${title}
Username: ${username}
Description: ${desc}
Font: ${font}
BG: ${bg.trim()}
Text: ${fg.trim()}
Icons: ${iconColor}
${addonSummary}
—
Total: $${total}`;
}
