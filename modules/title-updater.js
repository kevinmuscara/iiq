const change_title = () => {
  if(settings.titleUpdaterEnabled) {
    const ticket_number = document.querySelector('div.ticket-detail span[ng-bind="$ctrl.getTicketNumber()"]');
    if(!ticket_number) {
      const user_name = document.querySelector('[ng-bind="$ctrl.Data.User.Name"]');
      if(!user_name) {
        const asset_tag = document.querySelector(`[ng-bind="$ctrl.Asset.AssetTag"]`);
        if(!asset_tag) {
          return;
        }

        document.title = `#${asset_tag.textContent}`;
        return;
      }

      document.title = `${user_name.textContent}`;
      return;
    }
  
    document.title = `#${ticket_number.textContent}`;
  }
}
