export const MAX_SP = 0xbf

export enum GeneralPurposeRegisterName {
  AL = 'AL',
  BL = 'BL',
  CL = 'CL',
  DL = 'DL',
}

export enum GeneralPurposeRegister {
  AL,
  BL,
  CL,
  DL,
}

export enum SpecialPurposeRegisterName {
  IP = 'IP',
  SP = 'SP',
  SR = 'SR',
}

export type RegisterName = GeneralPurposeRegisterName | SpecialPurposeRegisterName
