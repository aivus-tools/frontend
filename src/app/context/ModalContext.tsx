import React, { createContext, useContext, useState, ReactNode, ReactElement } from 'react';
import { Modal, SideModal } from '@/app/components';

type ModalType = 'centered' | 'side';

interface ModalContextProps {
	showModal: (type: ModalType, content: ReactElement) => void;
	hideModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [modalContent, setModalContent] = useState<ReactElement | null>(null);
	const [modalType, setModalType] = useState<ModalType>('centered');

	const showModal = (type: ModalType, content: ReactElement) => {
		setModalType(type);
		setModalContent(content);
	};

	const hideModal = () => {
		setModalContent(null);
	};

	return (
		<ModalContext.Provider value={{ showModal, hideModal }}>
			{children}
			{modalContent && (
				<>
					{modalType === 'centered' && (
						<Modal isOpen={!!modalContent} onClose={hideModal}>
							{modalContent}
						</Modal>
					)}
					{modalType === 'side' && (
						<SideModal isOpen={!!modalContent} onClose={hideModal}>
							{modalContent}
						</SideModal>
					)}
				</>
			)}
		</ModalContext.Provider>
	);
};

export const useModal = (): ModalContextProps => {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error('useModal must be used within a ModalProvider');
	}
	return context;
};
