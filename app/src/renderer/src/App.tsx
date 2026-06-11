import { useState } from 'react'
import { ChoiceScreen } from './screens/choice/ChoiceScreen'
import { DraftScreen } from './screens/draft/DraftScreen'
import { OutcomeScreen } from './screens/outcome/OutcomeScreen'

type Screen = 'draft' | 'outcome' | 'choice'

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('draft')

  if (screen === 'choice') {
    return <ChoiceScreen onPicked={() => setScreen('outcome')} />
  }
  if (screen === 'outcome') {
    return (
      <OutcomeScreen
        onPlayAgain={() => setScreen('draft')}
        onChoosePath={() => setScreen('choice')}
        onInvalidState={() => setScreen('draft')}
      />
    )
  }
  return <DraftScreen onProceed={() => setScreen('outcome')} />
}

export default App
