document.addEventListener('keydown', function(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    
    document.querySelector('[data-testid=btn-global-search]').click();
  }
});
