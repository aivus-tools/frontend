'use client';

import LinkIcon from '@/icons/link.svg';
import UnLinkIcon from '@/icons/unlink.svg';

import styles from './LinkButtons.module.css';

interface LinkButtonProps {
  link: boolean;
  onClickAction: () => void;
}

export const LinkButton = (props: LinkButtonProps) => {
  return (
    <div className={styles.buttonWrapper} onClick={props.onClickAction}>
      {props.link ? <LinkIcon /> : <UnLinkIcon />}
    </div>
  );
};
