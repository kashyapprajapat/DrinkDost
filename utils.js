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
