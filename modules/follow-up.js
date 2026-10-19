const follow_up_storage_key = 'iiqFollowUps';
const follow_up_panel_id = 'iiq-follow-up-panel';
const follow_up_toggle_id = 'iiq-follow-up-toggle';
const follow_up_dialog_id = 'iiq-follow-up-dialog';

const get_follow_ups = () => new Promise((resolve, reject) => {
  chrome.storage.local.get({ [follow_up_storage_key]: [] }, (result) => {
    if (chrome.runtime.lastError) {
      reject(new Error(chrome.runtime.lastError.message));
      return;
    }

    resolve(result[follow_up_storage_key]);
  });
});

const save_follow_ups = (follow_ups) => new Promise((resolve, reject) => {
  chrome.storage.local.set({ [follow_up_storage_key]: follow_ups }, () => {
    if (chrome.runtime.lastError) {
      reject(new Error(chrome.runtime.lastError.message));
      return;
    }

    resolve();
  });
});

const get_local_date = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const get_default_follow_up_time = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1, 0, 0);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const get_follow_up_due_time = (follow_up) => (
  typeof follow_up.dueAt === 'number'
    ? follow_up.dueAt
    : new Date(`${follow_up.date}T00:00`).getTime()
);

const refresh_follow_up_alert = async () => {
  try {
    const follow_ups = await get_follow_ups();
    const now = Date.now();
    const due_follow_ups = follow_ups.filter((follow_up) =>
      get_follow_up_due_time(follow_up) <= now
    );
    render_follow_up_alert(due_follow_ups);
  } catch (error) {
    console.error('iiq: failed to load follow-up reminders', error);
  }
};

const render_follow_up_alert = (follow_ups) => {
  let panel = document.getElementById(follow_up_panel_id);
  let toggle = document.getElementById(follow_up_toggle_id);
  if (follow_ups.length === 0) {
    panel?.remove();
    toggle?.remove();
    return;
  }

  if (!toggle) {
    toggle = document.createElement('button');
    toggle.id = follow_up_toggle_id;
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', follow_up_panel_id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:2147483647;padding:10px 14px;border:1px solid #b54708;border-radius:999px;background:#f79009;color:#fff;box-shadow:0 4px 14px rgba(16,24,40,.2);font:600 14px Arial,Helvetica,sans-serif;cursor:pointer;';
    document.body.appendChild(toggle);

    toggle.addEventListener('click', () => {
      const is_open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!is_open));
      panel.hidden = is_open;
    });
  }

  if (!panel) {
    panel = document.createElement('section');
    panel.id = follow_up_panel_id;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Your Reminders');
    panel.style.cssText = 'position:fixed;left:16px;bottom:66px;z-index:2147483647;width:min(420px,calc(100vw - 32px));max-height:min(60vh,520px);overflow:auto;box-sizing:border-box;padding:16px;background:#fff;border:1px solid #d0d5dd;border-left:5px solid #f79009;border-radius:8px;box-shadow:0 8px 28px rgba(16,24,40,.24);font:14px/1.45 Arial,Helvetica,sans-serif;color:#101828;';
    panel.hidden = toggle.getAttribute('aria-expanded') !== 'true';
    document.body.appendChild(panel);
  }

  toggle.textContent = `Follow Ups (${follow_ups.length})`;
  panel.replaceChildren();

  const panel_header = document.createElement('div');
  panel_header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;';

  const heading = document.createElement('h2');
  heading.textContent = 'Your Reminders';
  heading.style.cssText = 'margin:0;font-size:16px;';

  const close_panel = document.createElement('button');
  close_panel.type = 'button';
  close_panel.textContent = '×';
  close_panel.setAttribute('aria-label', 'Close reminders');
  close_panel.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:1px solid #d0d5dd;border-radius:50%;background:#fff;color:#344054;font:20px/1 Arial,Helvetica,sans-serif;cursor:pointer;';
  close_panel.addEventListener('click', () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  });

  panel_header.append(heading, close_panel);
  panel.appendChild(panel_header);

  follow_ups.forEach((follow_up) => {
    const item = document.createElement('div');
    item.style.cssText = 'padding:10px 0;border-top:1px solid #eaecf0;';

    const due_date = document.createElement('p');
    const scheduled_time = new Date(get_follow_up_due_time(follow_up));
    due_date.textContent = scheduled_time.toLocaleString();
    due_date.style.cssText = 'margin:0 0 4px;font-size:12px;color:#475467;';

    const reason = document.createElement('p');
    reason.textContent = follow_up.reason;
    reason.style.cssText = 'margin:0 0 6px;white-space:pre-wrap;overflow-wrap:anywhere;';

    const link = document.createElement('a');
    link.href = follow_up.url;
    link.textContent = 'Goto page';
    link.style.cssText = 'color:#175cd3;text-decoration:underline;';

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.textContent = 'Dismiss';
    dismiss.style.cssText = 'margin-left:12px;padding:4px 8px;border:1px solid #d0d5dd;border-radius:4px;background:#fff;color:#344054;cursor:pointer;';
    dismiss.addEventListener('click', async () => {
      try {
        const saved_follow_ups = await get_follow_ups();
        await save_follow_ups(saved_follow_ups.filter((saved) => saved.id !== follow_up.id));
        await refresh_follow_up_alert();
      } catch (error) {
        console.error('iiq: failed to dismiss follow-up reminder', error);
      }
    });

    item.append(due_date, reason);
    item.appendChild(link);
    item.appendChild(dismiss);
    panel.appendChild(item);
  });
};

const open_follow_up_dialog = () => {
  let dialog = document.getElementById(follow_up_dialog_id);
  if (dialog) {
    dialog.showModal();
    return;
  }

  dialog = document.createElement('dialog');
  dialog.id = follow_up_dialog_id;
  dialog.setAttribute('aria-labelledby', `${follow_up_dialog_id}-title`);
  dialog.style.cssText = 'width:min(440px,calc(100vw - 40px));box-sizing:border-box;padding:24px;border:0;border-radius:10px;box-shadow:0 16px 48px rgba(16,24,40,.3);font:14px/1.45 Arial,Helvetica,sans-serif;color:#101828;';

  const title = document.createElement('h2');
  title.id = `${follow_up_dialog_id}-title`;
  title.textContent = 'Schedule a follow up';
  title.style.cssText = 'margin:0 0 18px;font-size:20px;';

  const form = document.createElement('form');
  const date_label = document.createElement('label');
  date_label.htmlFor = `${follow_up_dialog_id}-date`;
  date_label.textContent = 'Reminder date';
  date_label.style.cssText = 'display:block;margin-bottom:6px;font-weight:600;';

  const date_input = document.createElement('input');
  date_input.id = `${follow_up_dialog_id}-date`;
  date_input.type = 'date';
  date_input.required = true;
  date_input.value = get_local_date();
  date_input.min = get_local_date();
  date_input.style.cssText = 'display:block;width:100%;box-sizing:border-box;margin-bottom:16px;padding:9px;border:1px solid #d0d5dd;border-radius:5px;appearance:auto;color-scheme:light;font:inherit;';

  const time_label = document.createElement('label');
  time_label.htmlFor = `${follow_up_dialog_id}-time`;
  time_label.textContent = 'Reminder time';
  time_label.style.cssText = 'display:block;margin-bottom:6px;font-weight:600;';

  const time_input = document.createElement('input');
  time_input.id = `${follow_up_dialog_id}-time`;
  time_input.type = 'time';
  time_input.required = true;
  time_input.value = get_default_follow_up_time();
  time_input.step = '60';
  time_input.min = date_input.value === get_local_date() ? get_default_follow_up_time() : '00:00';
  time_input.style.cssText = 'display:block;width:100%;box-sizing:border-box;margin-bottom:16px;padding:9px;border:1px solid #d0d5dd;border-radius:5px;appearance:auto;color-scheme:light;font:inherit;';
  date_input.addEventListener('change', () => {
    time_input.min = date_input.value === get_local_date() ? get_default_follow_up_time() : '00:00';
  });

  const reason_label = document.createElement('label');
  reason_label.htmlFor = `${follow_up_dialog_id}-reason`;
  reason_label.textContent = 'Reason';
  reason_label.style.cssText = 'display:block;margin-bottom:6px;font-weight:600;';

  const reason_input = document.createElement('textarea');
  reason_input.id = `${follow_up_dialog_id}-reason`;
  reason_input.required = true;
  reason_input.rows = 4;
  reason_input.style.cssText = 'display:block;width:100%;box-sizing:border-box;margin-bottom:12px;padding:9px;border:1px solid #d0d5dd;border-radius:5px;resize:vertical;font:inherit;';

  const error_message = document.createElement('p');
  error_message.setAttribute('role', 'alert');
  error_message.style.cssText = 'display:none;margin:0 0 12px;color:#b42318;';

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:16px;';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  cancel.style.cssText = 'padding:8px 12px;border:1px solid #d0d5dd;border-radius:5px;background:#fff;color:#344054;cursor:pointer;';
  cancel.addEventListener('click', () => dialog.close());

  const save = document.createElement('button');
  save.type = 'submit';
  save.textContent = 'Save';
  save.style.cssText = 'padding:8px 12px;border:1px solid #29b622;border-radius:5px;background:#29b622;color:#fff;cursor:pointer;';

  actions.appendChild(cancel);
  actions.appendChild(save);
  form.append(date_label, date_input, time_label, time_input, reason_label, reason_input, error_message, actions);
  dialog.append(title, form);
  document.body.appendChild(dialog);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error_message.style.display = 'none';

    if (!form.reportValidity()) return;
    if (!reason_input.value.trim()) {
      error_message.textContent = 'Enter a reason for this reminder.';
      error_message.style.display = 'block';
      reason_input.focus();
      return;
    }
    const due_at = new Date(`${date_input.value}T${time_input.value}`).getTime();
    if (due_at <= Date.now()) {
      error_message.textContent = 'Choose a reminder time in the future.';
      error_message.style.display = 'block';
      time_input.focus();
      return;
    }

    save.disabled = true;
    try {
      const follow_ups = await get_follow_ups();
      follow_ups.push({
        id: crypto.randomUUID(),
        dueAt: due_at,
        reason: reason_input.value.trim(),
        url: window.location.href
      });
      await save_follow_ups(follow_ups);
      dialog.close();
      await refresh_follow_up_alert();
    } catch (error) {
      console.error('iiq: failed to save reminder', error);
      error_message.textContent = 'The reminder could not be saved. Please try again.';
      error_message.style.display = 'block';
      save.disabled = false;
    }
  });

  dialog.showModal();
};

const add_follow_up_button = (buttonMenu) => {
  if (buttonMenu.classList.contains('follow-up-button-added')) return;

  buttonMenu.classList.add('follow-up-button-added');
  const child_div = document.createElement('div');
  child_div.className = 'ticket-detail';

  const button = document.createElement('a');
  button.href = '#';
  button.className = 'label label-default priority_High';
  button.innerHTML = '<i class="fa fa-clock"></i><span class="follow-up-text">Follow Up</span>';
  button.setAttribute('uib-tooltip', 'Follow Up');
  button.setAttribute('aria-haspopup', 'dialog');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    open_follow_up_dialog();
  });

  child_div.appendChild(button);
  buttonMenu.append(child_div);
};

const follow_up = () => {
  settings_loaded.then(() => {
    const button_menu = document.querySelector('.ibox-title.border-bottom');
    if (settings.followUpEnabled && button_menu) {
      add_follow_up_button(button_menu);
    }
  });
};

chrome.storage.onChanged.addListener((changes, area_name) => {
  if (area_name === 'local' && changes[follow_up_storage_key]) {
    refresh_follow_up_alert();
  }
});

refresh_follow_up_alert();
setInterval(refresh_follow_up_alert, 60000);
