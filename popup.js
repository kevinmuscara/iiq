chrome.storage.sync.get({
  disableFlyoutsEnabled: true,
  copyButtonEnabled: true,
  titleUpdaterEnabled: true,
  shortcutEnabled: true,
  autoCloseSidebarEnabled: true,
  ticketPreviewEnabled: true,
  followUpEnabled: true
}, function(items) {
  document.getElementById('disableFlyoutsToggle').checked = items.disableFlyoutsEnabled;
  document.getElementById('copyButtonToggle').checked = items.copyButtonEnabled;
  document.getElementById('titleUpdaterToggle').checked = items.titleUpdaterEnabled;
  document.getElementById('shortcutToggle').checked = items.shortcutEnabled;
  document.getElementById('autoCloseSidebarToggle').checked = items.autoCloseSidebarEnabled;
  document.getElementById('ticketPreviewToggle').checked = items.ticketPreviewEnabled;
  document.getElementById('followUpToggle').checked = items.followUpEnabled;
});

document.getElementById('disableFlyoutsToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ disableFlyoutsEnabled: this.checked });
});

document.getElementById('copyButtonToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ copyButtonEnabled: this.checked });
});

document.getElementById('titleUpdaterToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ titleUpdaterEnabled: this.checked });
});

document.getElementById('shortcutToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ shortcutEnabled: this.checked });
});

document.getElementById('autoCloseSidebarToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ autoCloseSidebarEnabled: this.checked });
});

document.getElementById('ticketPreviewToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ ticketPreviewEnabled: this.checked });
});

document.getElementById('followUpToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ followUpEnabled: this.checked });
});