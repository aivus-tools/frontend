'use client';

import { ReactNode, useState } from 'react';
import { styled } from 'styled-components';
import ArrowIcon from '@/icons/arrow-icon.svg';

const ArrowButtonWrapper = styled.div<{ isOpen: boolean }>`
	margin: 0px 8px;

	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	cursor: pointer;
	transform: rotate(${({ isOpen }) => (isOpen ? '0deg' : '270deg')});
`;

const ArrowButton = ({ isOpen }: { isOpen: boolean }) => (
	<ArrowButtonWrapper isOpen={isOpen}>
		<ArrowIcon />
	</ArrowButtonWrapper>
);

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;

	padding: 10px 30px;
`;

const Line = styled.div`
	display: flex;
	border-bottom: 0.5px dashed var(--gray);
`;

const SectionTitle = styled.div`
	display: flex;
	align-items: center;
	background-color: var(--white);
	border-radius: 6px 6px 0 0;
	padding: 18px 8px;
`;
const SectionTitleText = styled.div`
	font-weight: 700;
	font-size: 14px;
	line-height: 17.07px;
	color: var(--blue);
`;
const SectionSubTitle = styled.div`
	display: flex;
	align-items: center;
	padding: 8px;
	padding-left: 16px;
	background-color: var(--white);
`;

const SectionSubTitleText = styled.div`
	font-weight: 500;
	font-size: 13px;
	line-height: 15.85px;
	color: var(--blue);
`;

const Table = styled.div`
	display: grid;
	grid-template-columns: 1fr 90px 160px 50px 90px 50px 20px 90px 80px 75px 80px;
	grid-template-rows: auto auto;
	grid-auto-flow: row;

	& > .estimation-header {
		font-weight: 500;
		color: var(--gray);

		font-size: 10px;
		line-height: 12.19px;
		padding: 8px 0;
		text-align: center;
	}
`;

const EstimationItem = styled.div<{ hovered?: boolean }>`
	padding: 8px 0;
	text-align: center;
	background-color: ${({ hovered }) => (hovered ? 'var(--bg-blue-subsection)' : 'var(--white)')};

	font-weight: 500;
	font-size: 13px;
	line-height: 15.85px;

	position: relative;
`;

type Data = {
	id: number;
	item: string;
	price: number;
	units: string;
	quantity: number;
	cost: number;
	surcharge: string;
	clientPrice: number;
	clientCost: number;
	marketRange: string;
};

type Headers = {
	label: string | ReactNode;
	key: keyof Data | 'link';
	style?: React.CSSProperties;
	itemStyle?: React.CSSProperties;
};

const HEADERS: Headers[] = [
	{
		label: 'Item',
		style: {
			textAlign: 'left',
			paddingLeft: '8px',
		},
		itemStyle: {
			textAlign: 'left',
			paddingLeft: '54px',
		},
		key: 'item',
	},
	{
		label: 'Price, $',
		key: 'price',
	},
	{
		label: 'Units',
		key: 'units',
	},
	{
		label: 'Quantity',
		key: 'quantity',
	},
	{
		label: 'Cost, $',
		key: 'cost',
	},
];

const CLIENTS_HEADERS: Headers[] = [
	{
		label: '',
		key: 'link',
	},
	{
		label: 'Surcharge',
		key: 'surcharge',
		itemStyle: {
			color: 'var(--gray-light)',
		},
	},
	{
		label: "Client's price",
		key: 'clientPrice',
	},
	{
		label: "Client's cost",
		key: 'clientCost',
	},
	{
		label: 'Market Range',
		key: 'marketRange',
	},
];

const DATA: Data[] = [
	{
		id: 1,
		item: 'Раскадровка',
		price: 1700,
		units: 'Select Units',
		quantity: 1,
		cost: 1700,
		surcharge: '10 %',
		clientPrice: 1700,
		clientCost: 1700,
		marketRange: '19%',
	},
	{
		id: 2,
		item: 'Раскадровка',
		price: 1700,
		units: 'Select Units',
		quantity: 1,
		cost: 1700,
		surcharge: '10 %',
		clientPrice: 1700,
		clientCost: 1700,
		marketRange: '19%',
	},
	{
		id: 3,
		item: 'Раскадровка',
		price: 1700,
		units: 'Select Units',
		quantity: 1,
		cost: 1700,
		surcharge: '10 %',
		clientPrice: 1700,
		clientCost: 1700,
		marketRange: '19%',
	},
	{
		id: 4,
		item: 'Раскадровка',
		price: 1700,
		units: 'Select Units',
		quantity: 1,
		cost: 1700,
		surcharge: '10 %',
		clientPrice: 1700,
		clientCost: 1700,
		marketRange: '19%',
	},
];

const RowLine = () => (
	<>
		<Line style={{ gridColumn: 'span 5' }} />
		<div />
		<Line style={{ gridColumn: 'span 5' }} />
	</>
);

const Title = ({ text }: { text: string }) => (
	<>
		<SectionTitle style={{ gridColumn: 'span 5' }}>
			<ArrowButton isOpen />
			<SectionTitleText>{text}</SectionTitleText>
		</SectionTitle>
		<div />
		<SectionTitle style={{ gridColumn: 'span 5' }} />
		<RowLine />
	</>
);

const SubTitle = ({ text }: { text: string }) => (
	<>
		<SectionSubTitle style={{ gridColumn: 'span 5' }}>
			<ArrowButton isOpen />
			<SectionSubTitleText>{text}</SectionSubTitleText>
		</SectionSubTitle>
		<div />
		<SectionSubTitle style={{ gridColumn: 'span 5' }} />
		<RowLine />
	</>
);

const LabelSubTotal = styled.div`
	font-weight: 600;
	font-size: 13px;
	line-height: 15.85px;
	text-align: right;
	background-color: var(--white);
	padding: 12px 0;
	background-color: var(--bg-blue-subtotal);
	border-radius: 0 0 0 6px;
`;
const SubTotalSum = styled.div`
	padding: 12px 0;
	background-color: var(--white);
	font-weight: 700;
	font-size: 14px;
	line-height: 17.07px;
	border-radius: 0 0 6px 6px;
	text-align: right;
	color: var(--blue);
	background-color: var(--bg-blue-subtotal);
	border-radius: 0 0 6px 0;
`;

const EmptyBlockSubTotalSum = styled.div`
	background-color: var(--bg-blue-subtotal);
	border-radius: 0 0 6px 6px;
`;

const SubTotal = ({ value }: { value: string }) => (
	<>
		<LabelSubTotal style={{ gridColumn: 'span 4' }}>Subtotal of Locations:</LabelSubTotal>
		<SubTotalSum>{value}</SubTotalSum>
		<div />
		<EmptyBlockSubTotalSum style={{ gridColumn: 'span 5' }} />
	</>
);

const Label = styled.div`
	font-weight: 600;
	font-size: 14px;
	line-height: 17.07px;
	letter-spacing: 0%;
	text-align: right;
	font-style: uppercase;
	background-color: var(--white);
	padding: 16px 0;
	background-color: var(--bg-blue-important);
	border-radius: 0 0 0 6px;
`;
const TotalSum = styled.div`
	font-weight: 600;
	font-size: 16px;
	line-height: 19.5px;
	text-align: right;
	color: var(--blue);
	padding: 16px 0;
	background-color: var(--bg-blue-important);
	border-radius: 0 0 6px 0;
`;

const EmptyBlockTotalSum = styled.div`
	background-color: var(--bg-blue-important);
	border-radius: 0 0 6px 6px;
`;

const Total = ({ text, value }: { text: string; value: string }) => (
	<>
		<Label style={{ gridColumn: 'span 4' }}>{text}:</Label>
		<TotalSum>{value}</TotalSum>
		<div />
		<EmptyBlockTotalSum style={{ gridColumn: 'span 5' }} />
	</>
);

export function Estimation() {
	const [hoveredRow, setHoveredRow] = useState<number | null>(null);

	const getRowProps = (id: number) => ({
		onMouseEnter: () => setHoveredRow(id),
		onMouseLeave: () => setHoveredRow(null),
		hovered: hoveredRow === id,
	});

	return (
		<Wrapper>
			<Table>
				{HEADERS.map(({ label, style, key }) => (
					<div key={key} className='estimation-header' style={style}>
						{label}
					</div>
				))}
				<div />
				{CLIENTS_HEADERS.map(({ label, key }) => (
					<div key={key} className='estimation-header'>
						{label}
					</div>
				))}
				<Title text='Post production' />
				<SubTitle text='Fees' />
				{DATA.map((it) => (
					<>
						{HEADERS.map(({ key, itemStyle }) => {
							if (key === 'link') {
								return null;
							}
							return (
								<EstimationItem key={`${key}-${it[key]}`} style={itemStyle} {...getRowProps(it.id)}>
									{it[key]}
								</EstimationItem>
							);
						})}
						<div />
						{CLIENTS_HEADERS.map(({ key, itemStyle }) => {
							if (key === 'link') {
								return <EstimationItem key={key} {...getRowProps(it.id)} />;
							}

							return (
								<EstimationItem key={`${key}-${it[key]}`} style={itemStyle} {...getRowProps(it.id)}>
									{it[key]}
								</EstimationItem>
							);
						})}
						<RowLine />
					</>
				))}
				<SubTotal value='$ 4,740.0' />
				<Total text='Post production' value='$ 4,740.0' />
			</Table>
		</Wrapper>
	);
}
