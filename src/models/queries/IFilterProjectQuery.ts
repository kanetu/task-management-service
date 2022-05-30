import { IPagingQuery } from '../common/IPagingQuery';

export interface IFilterProjectQuery extends IPagingQuery {
  keyword: string;
}
