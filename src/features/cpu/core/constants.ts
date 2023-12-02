export const MAX_SP = 0xbf

export enum GeneralPurposeRegister {
  AL,
  BL,
  CL,
  DL,
}

export type GeneralPurposeRegisterName = keyof typeof GeneralPurposeRegister

export enum SpecialPurposeRegisterName {
  IP = 'IP',
  SP = 'SP',
  SR = 'SR',
}

export type RegisterName = GeneralPurposeRegisterName | SpecialPurposeRegisterName
