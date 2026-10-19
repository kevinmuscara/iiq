const debounce = (func, wait) => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  }
}

const copy_observer = new MutationObserver(debounce(asset_and_serial, 250));
copy_observer.observe(document.body, { childList: true, subtree: true });

const title_observer = new MutationObserver(debounce(change_title, 250));
title_observer.observe(document.body, { childList: true, subtree: true });

const follow_up_observer = new MutationObserver(debounce(follow_up, 250));
follow_up_observer.observe(document.body, { childList: true, subtree: true });

const on_page_load = () => {
  setTimeout(asset_and_serial, 1000);
  setTimeout(change_title, 1000);
  setTimeout(follow_up, 1000);

  setTimeout(close_sidebar, 1500);
};

if (document.readyState === 'complete') {
  on_page_load();
} else {
  window.addEventListener('load', on_page_load, { once: true });
}
