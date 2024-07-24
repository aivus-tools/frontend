

export const formatPrice = (price: number): string => {
	const parts = price.toFixed(1).split('.');
	const integerPart = parts[0];
	const decimalPart = parts[1] ? `.${parts[1]}` : '.0';
	const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	return formattedIntegerPart + decimalPart;
};

export const getCost = (price: number, quantity: number): number => {
	return price * quantity;
}
