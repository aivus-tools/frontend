export interface MultipleAccordionProps {
	title: React.ReactNode;
	content?: React.ReactNode;
	subSections: {
		subTitle: React.ReactNode;
		subContent: React.ReactNode;
		isOpen: boolean;
		onToggle: (isOpen: boolean) => void;
	}[];
	isOpen: boolean;
	onToggle: (isOpen: boolean) => void;
	className?: string;
}
