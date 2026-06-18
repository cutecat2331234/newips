import { IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateTopicDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}