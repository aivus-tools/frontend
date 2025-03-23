import { Input, Space } from 'antd';
import { styled } from 'styled-components';
import { LibraryDropdown } from './LibraryDropdown/LibraryDropdown';
import { SearchOutlined } from '@ant-design/icons';

const Wrapper = styled.div`
	padding: 12px;
	margin: 10px 30px;

	// position: sticky;
	// top: 0;
	background-color: var(--bg-gray-page);

	display: flex;
	justify-content: center;
	align-items: center;
`;

export const AddButton = () => {
	return (
		<Wrapper>
			<LibraryDropdown
				componentAction={({ handleChange, handleBlur, handleFocus, value }) => (
					<Space.Compact style={{ width: '340px' }} onBlur={handleBlur} onFocus={handleFocus}>
						<Input addonBefore={<SearchOutlined />} value={value} onChange={handleChange} />
					</Space.Compact>
				)}
			/>
		</Wrapper>
	);
};
