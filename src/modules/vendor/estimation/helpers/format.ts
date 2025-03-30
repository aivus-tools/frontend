import { InputNumberProps } from 'antd';

type Formatter = InputNumberProps<number>['formatter'];
type Parser = InputNumberProps<number>['parser'];
export const priceFormat: Formatter = (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export const priceParser: Parser = (value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number;

export const percentFormat: Formatter = (value) => `${value} %`;
export const percentParser: Parser = (value) => value?.replace(' %', '') as unknown as number;
