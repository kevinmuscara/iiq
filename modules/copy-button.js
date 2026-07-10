const add_copy_button = (element) => {
  if (element.classList.contains('copied-button-added')) {
    return;
  }

  const anchor = document.createElement('a');
  anchor.className = 'btn btn-default btn-xs margin-left-10 top-n3 position-relative copied-button';
  anchor.innerHTML = '<i class="fa fa-copy"></i><span class="copied-text">Copied!</span>';
  anchor.setAttribute('uib-tooltip', 'Copy');

  anchor.style.display = 'inline-flex';
  anchor.style.alignItems = 'center';
  anchor.style.overflow = 'hidden';
  anchor.style.whiteSpace = 'nowrap';
  anchor.style.maxWidth = '34px';
  anchor.style.transition = 'max-width 0.3s ease';
  anchor.style.minWidth = '14.125px';

  const copiedText = anchor.querySelector('.copied-text');
  copiedText.style.opacity = '0';
  copiedText.style.transition = 'opacity 0.3s ease, padding-left 0.3s ease';
  copiedText.style.paddingLeft = '0';
  copiedText.style.textTransform = 'none';

  anchor.addEventListener('click', () => {
    const value = element.textContent;
    navigator.clipboard.writeText(value);

    anchor.style.maxWidth = '120px';
    copiedText.style.opacity = '1';
    copiedText.style.paddingLeft = '5px';

    setTimeout(() => {
      copiedText.style.opacity = '0';
      copiedText.style.paddingLeft = '0px';
      anchor.style.maxWidth = '34px';
    }, 3000);
  });

  element.parentNode.insertBefore(anchor, element.nextSibling);
  element.classList.add('copied-button-added');
}

const asset_and_serial = () => {
   const elements = document.querySelectorAll('span[ng-bind="$ctrl.Asset.AssetTag"]:not(.copied-button-added), span[ng-bind="$ctrl.Asset.SerialNumber"]:not(.copied-button-added)');
   if(settings.copyButtonEnabled) {
     elements.forEach(add_copy_button);
   }
}