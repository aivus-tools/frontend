export const formatPrice = (price?: number): string => {
	const parts = price?.toFixed(1).split('.') ?? [];
	const integerPart = parts[0];
	const decimalPart = parts[1] ? `.${parts[1]}` : '.0';
	const formattedIntegerPart = integerPart?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	return formattedIntegerPart + decimalPart;
};

export const getCost = (price: number, quantity: number): number => {
	return price * quantity;
};

export function addMonthsUTC(date: Date, months: number): Date {
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth();
	const day = date.getUTCDate();

	const newMonth = month + months;
	const newDate = new Date(Date.UTC(year, newMonth, day));

	// Обработка случаев, когда "новый" месяц имеет меньше дней
	while (newDate.getUTCDate() !== day) {
		newDate.setUTCDate(newDate.getUTCDate() - 1);
	}

	return newDate;
}
