import { Role } from './role'

export interface MemberData {
  memberName: string
  role: Role
  skill: number
  discipline: number
}

export function createMember(
  name: string,
  role: Role,
  skill: number,
  discipline: number
): MemberData {
  return { memberName: name, role, skill, discipline }
}
