document.addEventListener('DOMContentLoaded', function() {
  const list = document.getElementById('list');
  const saveButton = document.getElementById('save');
  const clearButton = document.getElementById('clear');
  const captureButton = document.getElementById('capture');

  // Load saved items
  chrome.storage.local.get('shoppingList', function(data) {
    const items = data.shoppingList || [];
    items.forEach(item => addItemToList(item));
  });

  // Save the list
  saveButton.addEventListener('click', function() {
    const items = [];
    document.querySelectorAll('.item').forEach(itemElement => {
      items.push({
        url: itemElement.dataset.url,
        imgSrc: itemElement.querySelector('img').src
      });
    });
    chrome.storage.local.set({ shoppingList: items });
  });

  // Clear the list
  clearButton.addEventListener('click', function() {
    chrome.storage.local.set({ shoppingList: [] });
    list.innerHTML = '';
  });

  // Capture the current page
  captureButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: getProductInfo
      }, function(results) {
        if (results && results[0] && results[0].result) {
          const newItem = results[0].result;
          addItemToList(newItem);

          // Save the new item to the storage
          chrome.storage.local.get('shoppingList', function(data) {
            const shoppingList = data.shoppingList || [];
            shoppingList.push(newItem);
            chrome.storage.local.set({ shoppingList });
          });
        }
      });
    });
  });

  function addItemToList(item) {
    const li = document.createElement('li');
    li.className = 'item';
    li.dataset.url = item.url;
    li.innerHTML = `<img src="${item.imgSrc}" alt=""><a href="${item.url}" target="_blank">${item.url}</a>`;
    list.appendChild(li);
  }

  // This function will be injected into the active tab's context
  function getProductInfo() {
    const metaOgImage = document.querySelector('meta[property="og:image"]');
    const imgSrc = metaOgImage ? metaOgImage.content : '';
    const url = window.location.href;

    return { url, imgSrc };
  }
});
