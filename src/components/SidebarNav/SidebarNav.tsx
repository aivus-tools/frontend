'use client';
import { SidebarNavProps } from './SidebarNav.props';
import cn from 'classnames';
import { AddItem } from '@/components';
import { useDispatch, useSelector } from 'react-redux';
import { addSection } from '@/store/actions';
import { createSidebarTree } from '@/helpers/sidebarTree';
import { RootState } from '@/store/store';
import { SidebarNavSection } from '@/components';

export const SidebarNav = ({ className, ...props }: SidebarNavProps) => {
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
		<div className={cn(className)} {...props}>
			{sidebarTree.map((section) => (
				<SidebarNavSection key={section.id} section={section} />
			))}

			<AddItem text={'add section'} onClick={handleAddSection} />
		</div>
	);
};
