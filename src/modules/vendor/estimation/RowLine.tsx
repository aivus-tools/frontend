import { Line } from './styled';

export const RowLine = () => (
	<>
		<div style={{ backgroundColor: 'var(--white)' }} />
		<Line style={{ gridColumn: 'span 5' }} />
		<div style={{ backgroundColor: 'var(--white)' }} />
		<div />
		<div style={{ backgroundColor: 'var(--white)' }} />
		<Line style={{ gridColumn: 'span 4' }} />
	</>
);
