import { BossData } from '../../domain/data/bossData'
import { Outcome } from '../../domain/stores/useRunStore'
import { OUTCOME_COLOR, lastName } from '../shared/formatting'

export interface ResolvedTrial {
  boss: BossData
  outcome: Outcome
}

interface RunTrailProps {
  trialIndex: number
  resolved: ResolvedTrial[]
}

type TrailState = 'done' | 'active' | 'locked'

interface TrailNode {
  trial: number
  state: TrailState
  resolved: ResolvedTrial | null
}

const TRIAL_ROMAN = ['', 'I', 'II', 'III']

function nodeAccent(node: TrailNode): string {
  if (node.resolved) return OUTCOME_COLOR[node.resolved.outcome]
  if (node.state === 'active') return 'var(--blood)'
  return 'var(--ash2)'
}

function nodeLabel(node: TrailNode): string {
  if (node.resolved) return lastName(node.resolved.boss.bossName)
  if (node.state === 'active') return 'Choosing'
  return 'Sealed'
}

function RunTrailNode({
  node,
  showConnector
}: {
  node: TrailNode
  showConnector: boolean
}): React.JSX.Element {
  const accent = nodeAccent(node)

  return (
    <>
      {showConnector && <div className="run-trail__connector" />}
      <div className="run-trail__node">
        <div
          className={`run-trail__icon${node.state === 'active' ? ' run-trail__icon--active' : ''}`}
        >
          <div
            className={`run-trail__diamond run-trail__diamond--${node.state}`}
            style={{ '--accent': accent } as React.CSSProperties}
          />
          <span
            className="run-trail__roman"
            style={{ color: accent, opacity: node.state === 'locked' ? 0.6 : 1 }}
          >
            {TRIAL_ROMAN[node.trial]}
          </span>
        </div>
        <span
          className={`run-trail__label${node.state === 'active' ? ' run-trail__label--active' : ''}`}
        >
          {nodeLabel(node)}
        </span>
      </div>
    </>
  )
}

export function RunTrail({ trialIndex, resolved }: RunTrailProps): React.JSX.Element {
  const nodes: TrailNode[] = [1, 2, 3].map((trial) => {
    const done = resolved[trial - 1] ?? null
    const state: TrailState = done ? 'done' : trial === trialIndex ? 'active' : 'locked'
    return { trial, state, resolved: done }
  })

  return (
    <div className="run-trail">
      {nodes.map((node, i) => (
        <RunTrailNode key={node.trial} node={node} showConnector={i > 0} />
      ))}
    </div>
  )
}
