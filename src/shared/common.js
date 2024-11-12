export function getRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return sum / numbers.length;
}