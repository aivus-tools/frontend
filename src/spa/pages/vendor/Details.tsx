import React from 'react';
import styled from 'styled-components';

import { InitialParameters } from './InitialParameters';
import { Client } from './Client';
import { Brief } from './Brief';
import { Specifications } from './Specifications';

const Wrapper = styled.div`
	display: flex;
	gap: 30px;
	padding: 24px 30px;
`;

const Section = styled.div`
	display: flex;
	flex-direction: column;
`;

const Column = styled.div`
	display: flex;
	flex-direction: column;
	gap: 30px;
`;

const Header = styled.div`
	color: var(--main);
	font-size: 14px;
	font-style: normal;
	font-weight: 700;
	line-height: normal;
	text-transform: uppercase;
	padding: 0px 6px 4px 6px;
`;

const Content = styled.div`
	display: flex;
	padding: 30px;
	flex-direction: column;
	align-items: flex-start;
	gap: 20px;
	align-self: stretch;
	border-radius: 6px;
	background-color: #fff;

	box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
`;

export const Details: React.FC = () => {
	return (
		<Wrapper>
			<Column style={{ flex: '1 1 70%' }}>
				<Section>
					<Header>Initial parameters</Header>
					<Content>
						<InitialParameters />
					</Content>
				</Section>
				<Section>
					<Header>the Client</Header>
					<Content>
						<Client />
					</Content>
				</Section>
				<Section>
					<Header>the Client’s brief</Header>
					<Content>
						<Brief />
					</Content>
				</Section>
				<Section>
					<Header>Rights and Technical Specifications</Header>
					<Content>
						<Specifications />
					</Content>
				</Section>
			</Column>
			<Column style={{ flex: '1 1 30%', justifyContent: 'space-between' }}>
				<Section>
					<Header>Guidance</Header>
					<Content>
						<div>Guidance</div>
					</Content>
				</Section>
				<Section style={{ justifySelf: 'end' }}>
					<Content>controls</Content>
				</Section>
			</Column>
		</Wrapper>
	);
};
