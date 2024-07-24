// MENU //
export interface menu {
	title: string;
	route: string;
	pathname: string;
}

export interface tHead {
	text: string;
	showIcon?: boolean;
	className?: string;
}

export interface tSection {
	id: number;
	title: string;
	subSections?: tSubSection[];
	rows?: TRow[];
}

export interface tSubSection {
	id: number;
	title: string;
	rows: TRow[];
}

export interface TRow {
	id: number;
	item: string;
	price: number;
	units: string;
	quantity: number;
	cost: number;
	surcharge: number;
	cprice: number;
	ccost: number;
	range: number;
}

export interface SubSection {
	subTitle: React.ReactNode;
	subContent: React.ReactNode;
}
