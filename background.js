// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log('DrinkDost installed.');
  initializeNotifications();
});

// Re-initialize after browser restart (service workers don't persist across restarts)
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started. Re-initializing notifications.');
  initializeNotifications();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.userSettings) {
    console.log('User settings changed:', changes.userSettings.newValue);
    initializeNotifications();
  }
});

// Respond to the alarm firing (service-worker safe — no setInterval)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'drinkWaterReminder') {
    chrome.storage.local.get(['userSettings'], function(result) {
      if (result.userSettings) {
        sendNotification(result.userSettings.username);
      }
    });
  }
});

function initializeNotifications() {
  chrome.storage.local.get(['userSettings'], function(result) {
    if (!result.userSettings) {
      console.log('No user settings found.');
      return;
    }

    const { username, weight, season, hours } = result.userSettings;
    console.log('User settings:', username, weight, season, hours);
    const waterIntake = calculateWaterIntake(weight, season);

    const totalMinutes = hours * 60;
    const intervalMinutes = totalMinutes / (waterIntake.adjustedDailyIntake * 1000 / 62);

    // Guard against 0, negative, NaN, and Infinity (e.g. when weight is 0)
    if (!isFinite(intervalMinutes) || intervalMinutes <= 0) {
      console.log('Invalid interval minutes:', intervalMinutes);
      return;
    }

    // Clear any existing alarm before creating a new one
    chrome.alarms.clear('drinkWaterReminder', () => {
      chrome.alarms.create('drinkWaterReminder', {
        delayInMinutes: intervalMinutes,
        periodInMinutes: intervalMinutes
      });
      console.log(`Alarm set for every ${intervalMinutes.toFixed(2)} minutes`);
    });
  });
}

function sendNotification(username) {
  console.log(`Sending notification to ${username}`);
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon128.png',
    title: 'DrinkDost Reminder',
    message: `DrinkDost says to ${username}: Time to drink water!`
  });
}

function calculateWaterIntake(weight, season) {
  const dailyIntake = weight * 0.035;
  let seasonalFactor;

  switch (season.toLowerCase()) {
    case 'hot':
      seasonalFactor = 0.20;
      break;
    case 'cold':
    case 'moderate':
    default:
      seasonalFactor = 0.00;
      break;
  }

  // Return raw numbers, not strings (.toFixed returns a string)
  const adjustedDailyIntake = dailyIntake * (1 + seasonalFactor);
  const workdayIntake = (adjustedDailyIntake / 24) * 8;

  return {
    adjustedDailyIntake,
    workdayIntake
  };
}
