import { PartialType } from '@nestjs/swagger';
import { CreateWorksiteDto } from './create-worksite.dto';

export class UpdateWorksiteDto extends PartialType(CreateWorksiteDto) {}
