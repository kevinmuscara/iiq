let settings = { 
  disableFlyoutsEnabled: true,
  copyButtonEnabled: true,
  titleUpdaterEnabled: true,
  shortcutEnabled: true,
  autoCloseSidebarEnabled: true,
  ticketPreviewEnabled: true,
  followUpEnabled: true
};

const settings_loaded = new Promise((resolve) => {
  chrome.storage.sync.get({
    disableFlyoutsEnabled: true,
    copyButtonEnabled: true,
    titleUpdaterEnabled: true,
    shortcutEnabled: true,
    autoCloseSidebarEnabled: true,
    ticketPreviewEnabled: true,
    followUpEnabled: true
  }, (items) => {
    settings = items;
    resolve();
  });
});
