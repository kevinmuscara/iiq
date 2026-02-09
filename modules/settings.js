let settings = { 
  ctrlKEnabled: true,
  disableFlyoutsEnabled: true,
  altSEnabled: true,
  altREnabled: true,
  altCEndabled: true,
  altAEnabled: true,
  copyButtonEnabled: true,
  titleUpdaterEnabled: true
};

chrome.storage.sync.get({
  ctrlKEnabled: true,
  disableFlyoutsEnabled: true,
  altSEnabled: true, 
  altREnabled: true, 
  altCEndabled: true,
  altAEnabled: true,
  copyButtonEnabled: true,
  titleUpdaterEnabled: true
}, (items) => settings = items);
