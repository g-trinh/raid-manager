import { useState } from 'react'
import { DraftScreen } from './screens/draft/DraftScreen'
import { OutcomeScreen } from './screens/outcome/OutcomeScreen'

type Screen = 'draft' | 'outcome'

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('draft')

  if (screen === 'outcome') {
    return (
      <OutcomeScreen
        onPlayAgain={() => setScreen('draft')}
        onInvalidState={() => setScreen('draft')}
      />
    )
  }
  return <DraftScreen onProceed={() => setScreen('outcome')} />
}

export default App
