// Use this variable to keep state of the tab
const active = {};

// Wrap in an onInstalled callback in order to avoid unnecessary work
// every time the background script is run
chrome.runtime.onInstalled.addListener(() => {
  // Page actions are disabled by default and enabled on select tabs
  chrome.action.disable();

  // Clear all rules to ensure only our expected rules are set
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Declare a rule to enable the action on floatplane.com pages
    const floatplaneRule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostSuffix: '.floatplane.com',
            pathSuffix: '/live'
          },
        })
      ],
      actions: [
        new chrome.declarativeContent.ShowAction(),
        
        // This action is used to workaround a bug in the v3 manifest
        new chrome.declarativeContent.SetIcon({
          path: 'icon-black-48.png'
        }),
      ],
    };

    // Finally, apply our new array of rules
    let rules = [floatplaneRule];
    setTimeout(() => {
      chrome.declarativeContent.onPageChanged.addRules(rules);
    }, 200)
  });
});

chrome.action.onClicked.addListener(tab => {
  const cssInjection = {
    files: ['theater-mode.css'],
    target: {
      tabId: tab.id,
    },
  }

  // This makes sure the css is reverted even when the extension
  // state is lost for some reason
  chrome.scripting.removeCSS(cssInjection);

  if (!!active[tab.id]) {
    chrome.scripting.removeCSS(cssInjection);
    active[tab.id] = false;
  } else {
    chrome.scripting.insertCSS(cssInjection);
    active[tab.id] = true;
  }
});
