import styles from './SidebarDescription.module.css';

interface Props {
  title: string;
}

export const SidebarDescription = (props: Props) => {
  return <div className={styles.text}>{props.title}</div>;
};
