import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ConvertTokenPipe implements PipeTransform<any> {
  constructor(private jwtService: JwtService) {}
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const obj = await this.jwtService.verify(
      value,
      {
        secret: '1234'
      }
    )
    return obj
  }

}