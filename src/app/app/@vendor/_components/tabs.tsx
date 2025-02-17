import { styled } from 'styled-components';

const Nav = styled.nav`
	display: flex;
	gap: 8px;
`;

const Tab = styled.button<{ isActive: boolean }>`
	line-height: normal;
	padding: 8px 12px;
	border: none;
	background: none;
	cursor: pointer;
	display: flex;
	font-size: 16px;
	font-weight: 600;
	color: var(--main);
	border-radius: 6px;
	white-space: nowrap;

	${({ isActive }) =>
		isActive &&
		`
		color: var(--blue);
    background-color: var(--beige);
	`}
`;

interface Props {
	items: { key: string; label: string }[];
	onChange: (key: string) => (e: React.MouseEvent<HTMLButtonElement>) => void;
	activeKey?: string;
}

export const Tabs = ({ activeKey, items, onChange }: Props) => {
	return (
		<Nav>
			{items.map((item) => (
				<Tab key={item.key} isActive={activeKey === item.key} onClick={onChange(item.key)}>
					{item.label}
				</Tab>
			))}
		</Nav>
	);
};
