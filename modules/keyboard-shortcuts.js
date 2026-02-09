document.addEventListener('keydown', function(event) {
  if (settings.ctrlKEnabled && (event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    document.querySelector('[data-testid=btn-global-search]').click();
  }

  if(settings.altAEnabled && (event.altKey && event.key == 'a')) {
    event.preventDefault();

    let assigned = document.querySelector(`[ng-bind="$ctrl.Ticket.AssignedToUser.Name || 'Not Assigned'"]`);
    if(assigned) {
      assigned.click();
    }
  }

  if(settings.altSEnabled && (event.altKey && event.key == 's')) {
    event.preventDefault();

    let issue_spare = document.querySelector(`[ng-click="$ctrl.IssueSpare()"]`);
    let return_spare = document.querySelector(`[ng-click="$ctrl.ReturnSpare()"]`);

    if(issue_spare) {
      issue_spare.click();
      setTimeout(() => {
        document.querySelector(`[ng-click="$select.clear($event)"]`).click();
      }, 1500);
    } else if(return_spare) { 
      return_spare.click();
    }
  }

  if(settings.altREnabled && (event.altKey && event.key == 'r')) {
    event.preventDefault();

    let confirm_button = document.querySelector(`[ng-click="$ctrl.onConfirmIssueClick($ctrl.SetIssueConfirmed)"]`);
    if(confirm_button == null) {
      document.querySelector(`[class="btn-resolve-ticket btn btn-primary"]`).click();
    } else {
      confirm_button.click();
      document.querySelector(`[class="btn-resolve-ticket btn btn-primary"]`).click();
    }
  }

  if(settings.altCEndabled && (event.altKey && event.key == 'c')) {
    event.preventDefault();
    document.querySelector(`[ng-click="$ctrl.onConfirmIssueClick($ctrl.SetIssueConfirmed)"]`).click();
  }
});
