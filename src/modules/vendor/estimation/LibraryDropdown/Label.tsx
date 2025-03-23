import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { useSearchActiveKey } from './SearchContext';
import { styled } from 'styled-components';

const Wrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const Text = styled.div`
	flex: 1;
`;

const Icon = styled.div<{ isActive: boolean }>`
	flex: 0 0 20px;
	margin-left: 8px;
	opacity: ${({ isActive }) => (isActive ? 1 : 0)};
	transition: opacity 0.2s;
`;

interface Props {
	itemKey?: string;
}

export const Label = ({ children, itemKey }: PropsWithChildren<Props>) => {
	const { activeKey, changeActiveKey } = useSearchActiveKey();
	const isActive = activeKey === itemKey;
	const ref = useRef<HTMLDivElement>(null);

	const handleMouseEnter = useCallback(() => {
		if (itemKey) {
			changeActiveKey(itemKey);
		}
	}, [changeActiveKey, itemKey]);

	useEffect(() => {
		const parentLi = ref.current?.closest('li');
		if (parentLi) {
			if (isActive) {
				parentLi.style.background = 'rgba(0, 0, 0, 0.04)';
			} else {
				parentLi.style.background = 'none';
			}
			parentLi.addEventListener('mouseenter', handleMouseEnter);
			return () => {
				parentLi.removeEventListener('mouseenter', handleMouseEnter);
			};
		}
	}, [changeActiveKey, handleMouseEnter, isActive, itemKey]);

	return (
		<Wrapper ref={ref}>
			<Text>{children}</Text>
			<Icon isActive={isActive}>
				{' '}
				<svg width='15' height='10' viewBox='0 0 15 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						fill-rule='evenodd'
						clip-rule='evenodd'
						d='M13 1H2C1.44772 1 1 1.44772 1 2V8C1 8.55229 1.44772 9 2 9H13C13.5523 9 14 8.55228 14 8V2C14 1.44772 13.5523 1 13 1ZM2 0C0.895431 0 0 0.89543 0 2V8C0 9.10457 0.89543 10 2 10H13C14.1046 10 15 9.10457 15 8V2C15 0.895431 14.1046 0 13 0H2Z'
						fill='#99A1B7'
					/>
					<path
						d='M7.94176 6.77841V3.40341L9.62926 5.09091L7.94176 6.77841ZM4.1804 5.39773V4.78409H8.45881V5.39773H4.1804ZM10.2031 6.77273V3.40909H10.8168V6.77273H10.2031Z'
						fill='#99A1B7'
					/>
				</svg>
			</Icon>
		</Wrapper>
	);
};
