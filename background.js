// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log('DrinkDost installed.');
  initializeNotifications();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.userSettings) {
    console.log('User settings changed:', changes.userSettings.newValue);
    initializeNotifications();
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
    // const intervalMinutes = 2; // 2-minute interval for notifications

    if (intervalMinutes <= 0) {
      console.log('Invalid interval minutes:', intervalMinutes);
      return;
    }

    // Clear any existing intervals
    if (globalThis.notificationInterval) {
      clearInterval(globalThis.notificationInterval);
    }

    // Schedule notifications
    globalThis.notificationInterval = setInterval(() => {
      sendNotification(username);
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds
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

  const adjustedDailyIntake = dailyIntake * (1 + seasonalFactor);
  const workdayIntake = (adjustedDailyIntake / 24) * 8;

  return {
    adjustedDailyIntake: adjustedDailyIntake.toFixed(2),
    workdayIntake: workdayIntake.toFixed(2)
  };
}
