import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';
import { getCost } from '@/helpers/helper';

// Селектор для расчета общих сумм для всех секций и подсекций
export const selectTotalCosts = createSelector(
	(state: RootState) => state.estimates.data,
	(data) => {
		let total = 0;
		let ctotal = 0;

		data.forEach((section) => {
			if (!section.isHidden) {
				if (section.rows) {
					section.rows.forEach((row) => {
						total += getCost(row.price, row.quantity);
						ctotal += getCost(row.cprice, row.quantity);
					});
				}
				if (section.subSections) {
					section.subSections.forEach((subSection) => {
						if (!subSection.isHidden) {
							subSection.rows.forEach((row) => {
								total += getCost(row.price, row.quantity);
								ctotal += getCost(row.cprice, row.quantity);
							});
						}
					});
				}
			}
		});

		return { total, ctotal };
	}
);

// Селектор для расчета expensesCost как 10% от selectTotalCosts
export const selectExpensesCost = createSelector([selectTotalCosts], (totalCosts) => {
	const percentage = 0.1; // 10% от общей суммы, надо заменить на значение с сервера
	return {
		total: totalCosts.total * percentage,
		ctotal: totalCosts.ctotal * percentage,
	};
});

// Селектор для расчета grandTotalCost
export const selectGrandTotalCost = createSelector(
	[selectTotalCosts, selectExpensesCost],
	(totalCosts, expensesCost) => {
		return {
			total: totalCosts.total + expensesCost.total,
			ctotal: totalCosts.ctotal + expensesCost.ctotal,
		};
	}
);
