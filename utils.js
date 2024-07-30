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
