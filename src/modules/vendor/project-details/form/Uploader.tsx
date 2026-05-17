import React, { useState } from 'react';
import { Image, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { t } from '@/lib/i18n';

import styles from './Uploader.module.css';

interface UploaderProps {
  value?: File | null;
  onChange?: (file: File | null) => void;
  thumbnailUrl?: string | null;
}

export const Uploader = (props: UploaderProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  React.useEffect(() => {
    if (!initialized && props.thumbnailUrl && fileList.length === 0) {
      setFileList([
        {
          uid: 'existing',
          name: 'thumbnail',
          status: 'done',
          url: props.thumbnailUrl,
        },
      ]);
      setInitialized(true);
    }
  }, [props.thumbnailUrl, initialized, fileList.length]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as File);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    const lastFile = newFileList[newFileList.length - 1];
    if (lastFile?.originFileObj) {
      props.onChange?.(lastFile.originFileObj);
    } else if (newFileList.length === 0) {
      props.onChange?.(null);
    }
  };

  return (
    <Upload
      accept='image/*'
      beforeUpload={() => false}
      listType='picture-card'
      fileList={fileList}
      onPreview={handlePreview}
      onChange={handleChange}
      maxCount={1}
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
          src={previewImage || undefined}
        />
      )}
      {fileList.length === 0 && (
        <button type='button' className={styles.button}>
          <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' fill='none'>
            <g fill='var(--gray-light)'>
              <path d='M15 17.917a4.58 4.58 0 0 1-4.583-4.584A4.58 4.58 0 0 1 15 8.75a4.58 4.58 0 0 1 4.583 4.583A4.58 4.58 0 0 1 15 17.917Zm0-6.667a2.084 2.084 0 1 0 .002 4.168A2.084 2.084 0 0 0 15 11.25Z' />
              <path d='M25 37.917H15C5.95 37.917 2.083 34.05 2.083 25V15C2.083 5.95 5.95 2.084 15 2.084h6.667c.683 0 1.25.566 1.25 1.25a1.26 1.26 0 0 1-1.25 1.25H15C7.317 4.583 4.583 7.316 4.583 15v10c0 7.684 2.734 10.417 10.417 10.417h10c7.683 0 10.417-2.733 10.417-10.417v-8.333c0-.684.566-1.25 1.25-1.25.683 0 1.25.566 1.25 1.25V25c0 9.05-3.867 12.917-12.917 12.917Z' />
              <path d='M35.417 9.584H26.25A1.26 1.26 0 0 1 25 8.334c0-.684.567-1.25 1.25-1.25h9.167c.683 0 1.25.566 1.25 1.25a1.26 1.26 0 0 1-1.25 1.25Z' />
              <path d='M30.833 14.167a1.26 1.26 0 0 1-1.25-1.25V3.75c0-.683.567-1.25 1.25-1.25.684 0 1.25.567 1.25 1.25v9.167a1.26 1.26 0 0 1-1.25 1.25ZM4.45 32.833c-.4 0-.8-.2-1.033-.55a1.255 1.255 0 0 1 .333-1.733l8.217-5.517c1.8-1.2 4.283-1.067 5.916.317l.55.483c.834.717 2.25.717 3.067 0l6.933-5.95c1.784-1.517 4.55-1.517 6.334 0l2.716 2.333a1.26 1.26 0 0 1 .134 1.767 1.26 1.26 0 0 1-1.767.133l-2.717-2.333c-.833-.717-2.25-.717-3.066 0l-6.934 5.95c-1.766 1.517-4.55 1.517-6.333 0l-.55-.483c-.767-.65-2.033-.717-2.883-.134l-8.2 5.517a1.46 1.46 0 0 1-.717.2Z' />
            </g>
          </svg>
          <p className={styles.title}>{t('THUMBNAIL')}</p>
        </button>
      )}
    </Upload>
  );
};
