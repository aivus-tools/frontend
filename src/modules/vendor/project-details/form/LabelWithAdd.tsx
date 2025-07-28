import React from 'react';
import { Typography } from 'antd';
import { styled } from 'styled-components';
import AddIcon from '@/icons/add-icon.svg';

const LabelContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const IconButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
`;

interface LabelWithAddProps {
  text: string;
  onClick: () => void;
}

export const LabelWithAdd = ({ text, onClick }: LabelWithAddProps) => {
  return (
    <LabelContainer>
      <Typography.Text>{text}</Typography.Text>
      <IconButton onClick={onClick}>
        <AddIcon />
      </IconButton>
    </LabelContainer>
  );
};
