import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FilterValidationPipe implements PipeTransform {
  async transform(value: string) {
    if (value !== 'concluded' && value !== 'current') {
      throw new BadRequestException(
        'You need to choose current or concluded value as query param.',
      );
    }
    return value;
  }
}
