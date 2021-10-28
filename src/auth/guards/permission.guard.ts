import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!permissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.userId;
    return this.authService.authPermissions(userId).then((user: any) => {
      const userPermissions: string[] | undefined = user.role?.permissions?.map(
        (p) => p.title,
      );
      if (!userPermissions) return false;
      return permissions.every((p) => userPermissions.includes(p));
    });
  }
}
