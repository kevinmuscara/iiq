const close_sidebar = async () => {
  await settings_loaded;
  if (!settings.autoCloseSidebarEnabled) return;

  const toggle_sidebar = () => {
    const toggle = document.querySelector(`[ng-click="$ctrl.ToggleMode()"]`);
    if (!toggle) return false;

    toggle.click();
    return true;
  };

  if (toggle_sidebar()) return;

  const sidebar_observer = new MutationObserver(() => {
    if (toggle_sidebar()) sidebar_observer.disconnect();
  });
  sidebar_observer.observe(document.body, { childList: true, subtree: true });
}
