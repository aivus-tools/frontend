import React, { useCallback, createContext, useContext, ReactNode, useState } from 'react';

const GuidanceDictionary = {
	projectDescription: {
		label: 'Project Description',
		description:
			'Give more details about your project (Objectives, Audience, Tone and Style, Key Messages, Preferred Deadline)',
	},
	referenceVideos: {
		label: 'Reference Videos URL',
		description: 'Add links to relevant videos.',
	},
	budget: {
		label: 'Budget',
		description: 'What is your budget for this project?',
	},
	clientName: {
		label: 'Client Name',
		description: 'A name of the client is required and recommended to be unique.',
	},
	irsEin: {
		label: 'IRS EIN',
		description: 'Taxpayer Id',
	},
	brandName: {
		label: 'Brand Name',
		description: 'Specify the specific brand within your company, if needed.',
	},
	manager: {
		label: 'Manager',
		description: 'Indicate the project managers responsible.',
	},
	manager_position: {
		label: 'Manager Position',
		description: 'Manager position',
	},
	crmId: {
		label: 'CRM ID',
		description: 'Set your own ID if applicable. (CRM ID | Link)',
	},
	estimationTemplate: {
		label: 'Estimation Template',
		description: 'Select one of your templates.',
	},
	projectName: {
		label: 'Project Name',
		description: 'A project name is required and recommended to be unique.',
	},
	description: {
		label: 'Project Description',
		description: 'Set a description to the project if needed. Visible by your team only',
	},
	internalManagersAndProducers: {
		label: 'Internal Managers and Producers',
		description: "The internal team can see the client's prices and the project's profit",
	},
	lineProducersAndExternals: {
		label: 'Line Producers and Externals',
		description: 'The external team can see the client’s prices and the project’s profit',
	},
	distributionAndAdPlacements: {
		label: 'Distribution and Ad Placements',
		description: 'Select at least one placement for your ad',
	},
	territory: {
		label: 'Territory',
		description: 'Select all country/regions you need or “Worldwide”',
	},
	term_length: {
		label: 'Term Length',
		description: 'Set the period or Perpetuity',
	},
	term_unit: {
		label: 'Term Unit',
		description: 'Set the period or Perpetuity',
	},
	mainVideoDuration: {
		label: 'Main Video Duration',
		description: 'Number and length of original videos.',
	},
	cuts: {
		label: 'Cuts',
		description: 'Number of cuts',
	},
	shootingDays: {
		label: 'Shooting Days',
		description: 'Number of shooting days',
	},
};

type GuidanceDictionaryType = typeof GuidanceDictionary;
type GuidanceDictionaryKeys = keyof GuidanceDictionaryType;

interface GuidanceContextType {
	handleFocus: (name: GuidanceDictionaryKeys) => () => void;
	focusedField: { label: string; description: string } | null;
}

const GuidanceContext = createContext<GuidanceContextType | undefined>(undefined);

interface FocusProviderProps {
	children: ReactNode;
}

export const GuidanceProvider: React.FC<FocusProviderProps> = ({ children }) => {
	const [focusedField, setFocusedField] = useState<GuidanceDictionaryKeys | null>(null);

	const handleFocus = useCallback(
		(name: GuidanceDictionaryKeys) => () => {
			setFocusedField(name);
		},
		[]
	);

	return (
		<GuidanceContext.Provider
			value={{ handleFocus, focusedField: focusedField ? GuidanceDictionary[focusedField] : null }}
		>
			{children}
		</GuidanceContext.Provider>
	);
};

export const useGuidance = () => {
	const context = useContext(GuidanceContext);

	if (context === undefined) {
		throw new Error('useGuidance must be used within a GuidanceProvider');
	}

	return context;
};
