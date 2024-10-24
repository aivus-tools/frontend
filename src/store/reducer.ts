import { createReducer } from '@reduxjs/toolkit';
import { setTableData, removeItem, addItem, addSection, updateItem, updateSectionVisibility } from './actions';
import { TSection } from '@/interfaces/app.interface';

const initialState: { data: TSection[] } = {
	data: [],
};

const estimatesReducer = createReducer(initialState, (builder) => {
	builder
		.addCase(setTableData, (state, action) => {
			state.data = action.payload;
		})
		.addCase(removeItem, (state, action) => {
			state.data = state.data.map((section) => {
				if (section.rows && section.rows.some((item) => item.id === action.payload)) {
					return {
						...section,
						rows: section.rows.filter((item) => item.id !== action.payload),
					};
				} else if (section.subSections) {
					return {
						...section,
						subSections: section.subSections.map((subSection) => {
							if (subSection.rows && subSection.rows.some((item) => item.id === action.payload)) {
								return {
									...subSection,
									rows: subSection.rows.filter((item) => item.id !== action.payload),
								};
							}
							return subSection;
						}),
					};
				}
				return section;
			});
		})
		.addCase(addItem, (state, action) => {
			const { sectionId, newRow, isSubSection } = action.payload;
			state.data = state.data.map((section) => {
				if (section.id === sectionId && !isSubSection) {
					return {
						...section,
						rows: section.rows ? [...section.rows, newRow] : [newRow],
					};
				} else if (section.subSections) {
					return {
						...section,
						subSections: section.subSections.map((subSection) =>
							subSection.id === sectionId && isSubSection
								? {
										...subSection,
										rows: subSection.rows ? [...subSection.rows, newRow] : [newRow],
									}
								: subSection
						),
					};
				}
				return section;
			});
		})
		.addCase(addSection, (state, action) => {
			state.data.push(action.payload);
		})
		.addCase(updateItem, (state, action) => {
			const { sectionId, rowId, field, value } = action.payload;
			state.data = state.data.map((section) => {
				if (section.id === sectionId) {
					return {
						...section,
						rows: section.rows?.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
						subSections: section.subSections?.map((subSection) => ({
							...subSection,
							rows: subSection.rows?.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
						})),
					};
				} else if (section.subSections) {
					return {
						...section,
						subSections: section.subSections.map((subSection) => {
							if (subSection.id === sectionId) {
								return {
									...subSection,
									rows: subSection.rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
								};
							} else {
								return subSection;
							}
						}),
					};
				}
				return section;
			});
		})
		.addCase(updateSectionVisibility, (state, action) => {
			const { sectionId, isHidden } = action.payload;
			state.data = state.data.map((section) => {
				if (section.id === sectionId) {
					return {
						...section,
						isHidden: isHidden,
					};
				} else if (section.subSections) {
					return {
						...section,
						subSections: section.subSections.map((subSection) =>
							subSection.id === sectionId ? { ...subSection, isHidden: isHidden } : subSection
						),
					};
				}
				return section;
			});
		});
});

export default estimatesReducer;
