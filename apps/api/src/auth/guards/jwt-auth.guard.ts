import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ACCESS_STRATEGY } from '../constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(ACCESS_STRATEGY) {}
