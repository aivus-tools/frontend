import Image from 'next/image';

export const ProfileImage = ({ url }: { url: string }) => {
	return <Image width={32} height={32} src={url} alt={'Profile image'} />;
};
