import { Role } from '../../domain/data/role'
import { ROLE_HEX, ROLE_INITIAL } from './formatting'

interface RoleGlyphProps {
  role: Role
  size?: number
}

export function RoleGlyph({ role, size = 34 }: RoleGlyphProps): React.JSX.Element {
  const hex = ROLE_HEX[role]
  return (
    <div
      className="role-glyph"
      style={
        {
          width: size,
          height: size,
          '--glyph-color': hex,
          '--glyph-radius': `${size * 0.16}px`
        } as React.CSSProperties
      }
    >
      <span className="role-glyph__diamond" />
      <span className="role-glyph__letter" style={{ fontSize: size * 0.42 }}>
        {ROLE_INITIAL[role]}
      </span>
    </div>
  )
}
