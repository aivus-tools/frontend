import React, { useState } from 'react';
import { Image, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { styled } from 'styled-components';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const Button = styled.button`
	background: none;
	display: flex;
	border: 0;
	align-items: center;
	border-radius: 6px;
	border: 1px dashed #99a1b7;
	background-color: var(--bg-blue-subtotal);
	padding: 10px;
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	padding: 10px;
	gap: 5px;
`;

const Description = styled.p`
	color: #99a1b7;
	font-size: 10px;
	font-style: normal;
	font-weight: 500;
	line-height: normal;
`;

const Title = styled.p`
	color: #99a1b7;
	font-size: 13px;
	font-style: normal;
	font-weight: 500;
	line-height: normal;
`;

const getBase64 = (file: FileType): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});

export const ExtraMaterials: React.FC = () => {
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState('');
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	const handlePreview = async (file: UploadFile) => {
		if (!file.url && !file.preview) {
			file.preview = await getBase64(file.originFileObj as FileType);
		}

		setPreviewImage(file.url || (file.preview as string));
		setPreviewOpen(true);
	};

	const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList);

	return (
		<Upload
			action={(file: FileType) => getBase64(file)}
			listType='picture'
			fileList={fileList}
			onPreview={handlePreview}
			onChange={handleChange}
		>
			{fileList.length > 0 && (
				<Image
					alt='Preview'
					wrapperStyle={{ display: 'none' }}
					preview={{
						visible: previewOpen,
						onVisibleChange: (visible) => setPreviewOpen(visible),
						afterOpenChange: (visible) => !visible && setPreviewImage(''),
					}}
					src={previewImage}
				/>
			)}
			<Button type='button'>
				<svg xmlns='http://www.w3.org/2000/svg' width='60' height='61' viewBox='0 0 60 61' fill='none'>
					<path
						d='M20 20.5L30 10.5M30 10.5L40 20.5M30 10.5V40.5M47.5 43V44.5C47.5 47.825 44.825 50.5 41.5 50.5H18.5C15.175 50.5 12.5 47.825 12.5 44.5V43'
						stroke='#4B5675'
						strokeWidth='1.5'
						strokeMiterlimit='10'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
				<Container>
					<Title>Click or drag files to this area</Title>
					<Description>
						Add up to 5 additional files (up to 5Mb). Briefs, References, etc. PDF, docx, xlsx, pptx, jpg, png
					</Description>
				</Container>
			</Button>
		</Upload>
	);
};
