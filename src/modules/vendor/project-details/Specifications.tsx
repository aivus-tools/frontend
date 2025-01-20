import React from 'react';
import { Form, Input, Flex, Select } from 'antd';
import { AntdListWrapper, IconButton } from './styled';
import { LabelWithAdd } from './LabelWithAdd';
import RemoveIcon from '@/icons/minus.svg';

export const Specifications: React.FC = () => {
	return (
		<>
			<Form.Item
				name='distributionAndAdPlacements'
				label='Distribution and Ad placements*'
				extra='Select at least one placement for your ad'
			>
				<Input placeholder='Ad placements*' />
			</Form.Item>
			<Flex gap={16} style={{ width: '100%' }}>
				<Form.Item name='territory' label='Territory*' extra='Select all country/regions you need or “Worldwide”'>
					<Input placeholder='Client' />
				</Form.Item>
				<Form.Item label='Term' extra='Set the period or Perpetuity' style={{ flex: '1 0 340px' }}>
					<Flex gap={4}>
						<Form.Item name={['term', 'length']} noStyle>
							<Input placeholder='Length' />
						</Form.Item>
						<Form.Item name={['term', 'unit']} noStyle>
							<Select placeholder='Choose' />
						</Form.Item>
					</Flex>
				</Form.Item>
			</Flex>
			<Form.Item label='Main video Duration*' extra='Number and length of original videos.'>
				<Flex gap={16}>
					<Flex gap={4} align='center'>
						<Form.Item name={['mainVideoDuration', 'number']} noStyle>
							<Input placeholder='Number' />
						</Form.Item>
						<Flex flex={'0 0 10px'} align='center'>
							<svg xmlns='http://www.w3.org/2000/svg' width='10px' height='10px' viewBox='0 0 10 10' fill='none'>
								<path
									d='M1 9L9 1M9 9L1 1'
									stroke='#99A1B7'
									strokeWidth='1.5'
									strokeMiterlimit='10'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</Flex>
						<Form.Item name={['mainVideoDuration', 'length']} noStyle>
							<Input placeholder='Length' />
						</Form.Item>
						<Form.Item name={['mainVideoDuration', 'timeUnit']} noStyle>
							<Select placeholder='Choose' />
						</Form.Item>
					</Flex>
					<Flex gap={4} align='center' style={{ flex: '1 0 340px' }}>
						<Form.Item name={['mainVideoDuration', 'comment']} noStyle>
							<Input placeholder='Comment' />
						</Form.Item>
					</Flex>
				</Flex>
			</Form.Item>
			<AntdListWrapper>
				<Form.List name='cuts' initialValue={[{ url: '', comment: '' }]}>
					{(fields, { add, remove }) => (
						<Form.Item
							label={<LabelWithAdd text='Cuts' onClick={() => add()} />}
							extra='Additional versions of the main video, if applicable.'
						>
							{fields.map((field) => (
								<Flex key={field.key} gap={16}>
									<Flex gap={4} align='center'>
										<Form.Item noStyle name={[field.name, 'number']}>
											<Input placeholder='Number' />
										</Form.Item>
										<Flex flex={'0 0 10px'} align='center'>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width='10px'
												height='10px'
												viewBox='0 0 10 10'
												fill='none'
											>
												<path
													d='M1 9L9 1M9 9L1 1'
													stroke='#99A1B7'
													strokeWidth='1.5'
													strokeMiterlimit='10'
													strokeLinecap='round'
													strokeLinejoin='round'
												/>
											</svg>
										</Flex>
										<Form.Item noStyle name={[field.name, 'length']}>
											<Input placeholder='Length' />
										</Form.Item>
										<Form.Item noStyle name={[field.name, 'timeUnit']}>
											<Select placeholder='Choose' />
										</Form.Item>
									</Flex>
									<Flex gap={4} align='center' style={{ flex: '1 0 340px' }}>
										<Form.Item noStyle name={[field.name, 'comment']}>
											<Input placeholder='Comment' />
										</Form.Item>
										<IconButton
											onClick={() => {
												if (fields.length > 1) remove(field.name);
											}}
										>
											<RemoveIcon />
										</IconButton>
									</Flex>
								</Flex>
							))}
						</Form.Item>
					)}
				</Form.List>
			</AntdListWrapper>
			<Form.Item
				label='Shooting days*'
				extra='Number of days and length of the shooting day, including 1 hour of lunch if the day is more than 6 hours long.'
			>
				<Flex gap={16}>
					<Flex gap={4} align='center'>
						<Form.Item name={['shootingDays', 'number']} noStyle>
							<Input placeholder='Number' />
						</Form.Item>
						<Flex flex={'0 0 10px'} align='center'>
							<svg xmlns='http://www.w3.org/2000/svg' width='10px' height='10px' viewBox='0 0 10 10' fill='none'>
								<path
									d='M1 9L9 1M9 9L1 1'
									stroke='#99A1B7'
									strokeWidth='1.5'
									strokeMiterlimit='10'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</Flex>
						<Form.Item name={['shootingDays', 'length']} noStyle>
							<Input placeholder='Length' />
						</Form.Item>
						<Form.Item name={['shootingDays', 'timeUnit']} noStyle>
							<Select placeholder='Choose' />
						</Form.Item>
					</Flex>
					<Flex gap={4} align='center' style={{ flex: '1 0 340px' }}>
						<Form.Item name={['shootingDays', 'comment']} noStyle>
							<Input placeholder='Comment' />
						</Form.Item>
					</Flex>
				</Flex>
			</Form.Item>
		</>
	);
};
