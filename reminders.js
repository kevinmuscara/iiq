const follow_up_storage_key = 'iiqFollowUps';

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

const get_due_time = (follow_up) => (
  typeof follow_up.dueAt === 'number'
    ? follow_up.dueAt
    : new Date(`${follow_up.date}T00:00`).getTime()
);

const format_due_time = (follow_up) => {
  const due_time = new Date(get_due_time(follow_up));
  if (Number.isNaN(due_time.getTime())) return 'Date unavailable';

  return due_time.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const set_status = (message, is_error = false) => {
  const status = document.getElementById('status');
  status.textContent = message;
  status.classList.toggle('error', is_error);
};

const render_follow_ups = (follow_ups) => {
  const list = document.getElementById('reminder-list');
  list.replaceChildren();

  if (follow_ups.length === 0) {
    set_status('You have no follow up reminders.');
    return;
  }

  const now = Date.now();
  const ordered_follow_ups = [...follow_ups].sort((left, right) =>
    get_due_time(left) - get_due_time(right)
  );

  ordered_follow_ups.forEach((follow_up) => {
    const card = document.createElement('article');
    card.className = 'reminder-card';

    const heading = document.createElement('h2');
    const due_time = get_due_time(follow_up);
    heading.textContent = due_time <= now ? 'Due reminder' : 'Upcoming reminder';

    const meta = document.createElement('p');
    meta.className = 'reminder-meta';
    meta.textContent = format_due_time(follow_up);

    const reason = document.createElement('p');
    reason.className = 'reminder-reason';
    reason.textContent = follow_up.reason || '';

    const actions = document.createElement('div');
    actions.className = 'reminder-actions';

    const link = document.createElement('a');
    link.href = follow_up.url;
    link.textContent = 'Goto Page';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    const delete_button = document.createElement('button');
    delete_button.type = 'button';
    delete_button.className = 'delete-button';
    delete_button.textContent = 'Delete';
    delete_button.addEventListener('click', async () => {
      delete_button.disabled = true;
      set_status('Deleting reminder…');

      try {
        const current_follow_ups = await get_follow_ups();
        await save_follow_ups(current_follow_ups.filter((item) => item.id !== follow_up.id));
        render_follow_ups(await get_follow_ups());
      } catch (error) {
        console.error('iiq: failed to delete follow-up reminder', error);
        delete_button.disabled = false;
        set_status('Could not delete the reminder. Please try again.', true);
      }
    });

    actions.append(link, delete_button);
    card.append(heading, meta, reason, actions);
    list.appendChild(card);
  });

  set_status(`${follow_ups.length} reminder${follow_ups.length === 1 ? '' : 's'}`);
};

const load_follow_ups = async () => {
  set_status('Loading reminders…');
  try {
    render_follow_ups(await get_follow_ups());
  } catch (error) {
    console.error('iiq: failed to load follow-up reminders', error);
    set_status('Could not load reminders. Please reload this page.', true);
  }
};

chrome.storage.onChanged.addListener((changes, area_name) => {
  if (area_name === 'local' && changes[follow_up_storage_key]) {
    load_follow_ups();
  }
});

load_follow_ups();
