document.getElementById('settingsForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const weight = document.getElementById('weight').value;
    const season = document.getElementById('season').value;
    const hours = document.getElementById('hours').value;
  
    const userSettings = {
      username,
      weight: parseFloat(weight),
      season,
      hours: parseInt(hours, 10)
    };
  
    chrome.storage.local.set({ userSettings }, function() {
      console.log('Settings saved');
      alert('Settings saved!');
    });
  });
  