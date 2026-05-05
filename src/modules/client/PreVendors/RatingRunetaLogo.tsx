import React from 'react';

interface RatingRunetaLogoProps {
  variant: 'button' | 'header';
  height?: number;
}

const ICON_VIEWBOX = '0 0 47.0691 30';
const ICON_PATH_FILL =
  'M0.00018521 9.05172V0H21.7243V4.39655H25.8623V17.8448H21.7243V21.7241H9.05191V30H0.00018521V12.4138H16.8105V9.05172H0.00018521Z';
const ICON_PATH_STROKE =
  'M42.4317 0.5V4.89648H46.5694V17.3447H42.4317V21.2246H29.7588V29.5H21.7071V12.9141H38.5176V8.55176H21.7071V0.5H42.4317Z';

export const RatingRunetaLogo: React.FC<RatingRunetaLogoProps> = (props) => {
  if (props.variant === 'button') {
    const height = props.height ?? 18;
    const width = (47.0691 / 30) * height;
    return (
      <svg
        width={width}
        height={height}
        viewBox={ICON_VIEWBOX}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-label='Рейтинг Рунета'
      >
        <path d={ICON_PATH_FILL} fill='#ffffff' />
        <path d={ICON_PATH_STROKE} stroke='#ffffff' />
      </svg>
    );
  }

  const height = props.height ?? 26;
  return (
    <img
      src='/images/rating-runeta-logo.png'
      alt='Рейтинг Рунета'
      style={{ height, width: 'auto', display: 'block' }}
    />
  );
};
