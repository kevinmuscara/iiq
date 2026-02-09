chrome.storage.sync.get({
  ctrlKEnabled: true,
  disableFlyoutsEnabled: true,
  altSEnabled: true,
  altREnabled: true,
  altCEndabled: true,
  altAEnabled: true,
  copyButtonEnabled: true,
  titleUpdaterEnabled: true
}, function(items) {
  document.getElementById('ctrlKToggle').checked = items.ctrlKEnabled;
  document.getElementById('disableFlyoutsToggle').checked = items.disableFlyoutsEnabled;
  document.getElementById('altSToggle').checked = items.altSEnabled;
  document.getElementById('altRToggle').checked = items.altREnabled;
  document.getElementById('altCEToggle').checked = items.altCEndabled;
  document.getElementById('altAToggle').checked = items.altAEnabled;
  document.getElementById('copyButtonToggle').checked = items.copyButtonEnabled;
  document.getElementById('titleUpdaterToggle').checked = items.titleUpdaterEnabled;
});

document.getElementById('ctrlKToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ ctrlKEnabled: this.checked });
});

document.getElementById('disableFlyoutsToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ disableFlyoutsEnabled: this.checked });
});

document.getElementById('altSToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ altSEnabled: this.checked });
});

document.getElementById('altRToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ altREnabled: this.checked });
});

document.getElementById('altCEToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ altCEndabled: this.checked });
});

document.getElementById('altAToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ altAEnabled: this.checked });
});

document.getElementById('copyButtonToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ copyButtonEnabled: this.checked });
});

document.getElementById('titleUpdaterToggle').addEventListener('change', function() {
  chrome.storage.sync.set({ titleUpdaterEnabled: this.checked });
});