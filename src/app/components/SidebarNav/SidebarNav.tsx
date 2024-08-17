'use client';
import { SidebarNavProps } from './SidebarNav.props';
import styles from './SidebarNav.module.css';
import cn from 'classnames';
import { AddItem } from '@/app/components';
import { useDispatch, useSelector } from 'react-redux';
import { addSection } from '@/app/store/actions';
import { createSidebarTree } from '@/app/helpers/sidebarTree';
import { RootState } from '@/app/store/store';
import { SidebarNavSection } from '@/app/components';


export const SidebarNav = ({children, className, ...props }: SidebarNavProps) => {
	const sections = useSelector((state: RootState) => state.estimates.data);

	const sidebarTree = createSidebarTree(sections);

	const dispatch = useDispatch();

	const handleAddSection = () => {
		console.log('add section');
		const newSection = {
			id: +new Date() % 1000,
			title: 'New Section',
			isHidden: false,
			rows: [],
		};
		dispatch(addSection(newSection));
	};

	return (
		<div className={cn(styles.nav, className)}
				 {...props}
		>
			{sidebarTree.map((section) => (
				<SidebarNavSection key={section.id} section={section} />
			))}

			<AddItem
				text={"add section"}
				onClick={ handleAddSection }
			/>

		</div>
	);
};
