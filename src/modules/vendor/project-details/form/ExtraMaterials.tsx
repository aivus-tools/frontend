import React, { useState } from 'react';
import { Image, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { t } from '@/lib/i18n';

import styles from './ExtraMaterials.module.css';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const ExtraMaterials = () => {
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
      <button type='button' className={styles.button}>
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
        <div className={styles.container}>
          <p className={styles.title}>{t('CLICK_OR_DRAG_FILES_TO_THIS_AREA')}</p>
          <p className={styles.description}>{t('ADD_UP_TO_5_ADDITIONAL_FILES')}</p>
        </div>
      </button>
    </Upload>
  );
};
