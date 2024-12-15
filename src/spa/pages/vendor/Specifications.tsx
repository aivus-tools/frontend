import React from 'react';
import { Form, Input, Flex, Select } from 'antd';

export const Specifications: React.FC = () => {
	return (
		<>
			<Form layout='vertical' disabled={false} size='large' style={{ width: '100%' }}>
				<Form.Item label='Distribution and Ad placements*' extra='Select at least one placement for your ad'>
					<Input placeholder='Ad placements*' />
				</Form.Item>
				<Flex gap={16} flex={1}>
					<Form.Item label='Territory*' extra='Select all country/regions you need or “Worldwide”'>
						<Input placeholder='Client' />
					</Form.Item>
					<Form.Item label='Term' extra='Set the period or Perpetuity' style={{ flex: 1 }}>
						<Flex gap={4}>
							<Input placeholder='Length' />
							<Select placeholder='Choose' />
						</Flex>
					</Form.Item>
				</Flex>
				<Form.Item label='Main video Duration*' extra='Number and length of original videos.'>
					<Flex gap={16}>
						<Flex gap={4} align='center'>
							<Input placeholder='Number' />
							<Flex flex={'0 0 10px'} align='center'>
								<svg xmlns='http://www.w3.org/2000/svg' width='10px' height='10px' viewBox='0 0 10 10' fill='none'>
									<path
										d='M1 9L9 1M9 9L1 1'
										stroke='#99A1B7'
										stroke-width='1.5'
										stroke-miterlimit='10'
										stroke-linecap='round'
										stroke-linejoin='round'
									/>
								</svg>
							</Flex>
							<Input placeholder='Length' />
							<Select placeholder='Choose' />
						</Flex>
						<Input placeholder='Comment' />
					</Flex>
				</Form.Item>
				<Form.Item label='Cuts' extra='Additional versions of the main video, if applicable.'>
					<Flex gap={16}>
						<Flex gap={4} align='center'>
							<Input placeholder='Number' />
							<Flex flex={'0 0 10px'} align='center'>
								<svg xmlns='http://www.w3.org/2000/svg' width='10px' height='10px' viewBox='0 0 10 10' fill='none'>
									<path
										d='M1 9L9 1M9 9L1 1'
										stroke='#99A1B7'
										stroke-width='1.5'
										stroke-miterlimit='10'
										stroke-linecap='round'
										stroke-linejoin='round'
									/>
								</svg>
							</Flex>
							<Input placeholder='Length' />
							<Select placeholder='Choose' />
						</Flex>
						<Input placeholder='Comment' />
					</Flex>
				</Form.Item>
				<Form.Item
					label='Shooting days*'
					extra='Number of days and length of the shooting day, including 1 hour of lunch if the day is more than 6 hours long.'
				>
					<Flex gap={16}>
						<Flex gap={4} align='center'>
							<Input placeholder='Number' />
							<Flex flex={'0 0 10px'} align='center'>
								<svg xmlns='http://www.w3.org/2000/svg' width='10px' height='10px' viewBox='0 0 10 10' fill='none'>
									<path
										d='M1 9L9 1M9 9L1 1'
										stroke='#99A1B7'
										stroke-width='1.5'
										stroke-miterlimit='10'
										stroke-linecap='round'
										stroke-linejoin='round'
									/>
								</svg>
							</Flex>
							<Input placeholder='Length' />
							<Select placeholder='Choose' />
						</Flex>
						<Input placeholder='Comment' />
					</Flex>
				</Form.Item>
			</Form>
		</>
	);
};
