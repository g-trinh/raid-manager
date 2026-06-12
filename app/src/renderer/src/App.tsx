import { useState } from 'react'
import { useCampStore } from './domain/stores/useCampStore'
import { CampScreen } from './screens/camp/CampScreen'
import { ChoiceScreen } from './screens/choice/ChoiceScreen'
import { DraftScreen } from './screens/draft/DraftScreen'
import { OutcomeScreen } from './screens/outcome/OutcomeScreen'

type Screen = 'draft' | 'outcome' | 'camp' | 'choice'

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('draft')

  const goToCamp = (): void => {
    useCampStore.getState().beginCamp()
    setScreen('camp')
  }

  if (screen === 'camp') {
    return <CampScreen onContinue={() => setScreen('choice')} />
  }
  if (screen === 'choice') {
    return <ChoiceScreen onPicked={() => setScreen('outcome')} />
  }
  if (screen === 'outcome') {
    return (
      <OutcomeScreen
        onPlayAgain={() => setScreen('draft')}
        onChoosePath={goToCamp}
        onInvalidState={() => setScreen('draft')}
      />
    )
  }
  return <DraftScreen onProceed={() => setScreen('outcome')} />
}

export default App
