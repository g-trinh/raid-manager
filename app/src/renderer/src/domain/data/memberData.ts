import { Role } from './role'

export interface MemberData {
  memberName: string
  role: Role
  skill: number
  liability: number
}

export function createMember(
  name: string,
  role: Role,
  skill: number,
  liability: number
): MemberData {
  return { memberName: name, role, skill, liability }
}
