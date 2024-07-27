document.addEventListener('DOMContentLoaded', function() {
    const list = document.getElementById('list');
    const saveButton = document.getElementById('save');
    const clearButton = document.getElementById('clear');
  
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
  
    function addItemToList(item) {
      const li = document.createElement('li');
      li.className = 'item';
      li.dataset.url = item.url;
      li.innerHTML = `<img src="${item.imgSrc}" alt=""><a href="${item.url}" target="_blank">${item.url}</a>`;
      list.appendChild(li);
    }
  });
  