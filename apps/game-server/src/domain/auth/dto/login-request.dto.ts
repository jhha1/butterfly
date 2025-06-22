export class LoginRequestDto {
  platformId!: string;
  platformType: 'guest' | 'apple' | 'google';
}