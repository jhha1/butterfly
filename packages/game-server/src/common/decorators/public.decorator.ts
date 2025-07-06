import { SetMetadata } from '@nestjs/common';

/** 이 메서드/컨트롤러는 인증이 필요 없음을 표시 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);