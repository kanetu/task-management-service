import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export default abstract class Base extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createAt: Date;

  @CreateDateColumn()
  updateAt: Date;
}
