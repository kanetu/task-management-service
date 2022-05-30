import { IPagingQuery } from '../common/IPagingQuery';

export interface IFilterUserQuery extends IPagingQuery {
  keyword: string;
}
