import { SidebarItem, TSection } from '@/types/app.interface';

export function createSidebarTree(sections: TSection[]): SidebarItem[] {
  return sections.map((section) => {
    const sectionItem: SidebarItem = {
      id: section.id,
      title: section.title,
      type: 'section',
      isHidden: section.isHidden,
      children: [],
    };

    if (section.subSections) {
      sectionItem.children = section.subSections.map((subSection) => {
        const subSectionItem: SidebarItem = {
          id: subSection.id,
          title: subSection.title,
          type: 'subsection',
          isHidden: subSection.isHidden,
          children: subSection.rows.map((row) => ({
            id: row.id,
            title: row.item,
            isHidden: false,
            type: 'row',
          })),
        };
        return subSectionItem;
      });
    } else if (section.rows) {
      sectionItem.children = section.rows.map((row) => ({
        id: row.id,
        title: row.item,
        isHidden: false,
        type: 'row',
      }));
    }

    return sectionItem;
  });
}
