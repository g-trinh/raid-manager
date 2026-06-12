import { useState } from 'react'
import { useCampStore } from './domain/stores/useCampStore'
import { CampScreen } from './screens/camp/CampScreen'
import { ChoiceScreen } from './screens/choice/ChoiceScreen'
import { DraftScreen } from './screens/draft/DraftScreen'
import { OutcomeScreen } from './screens/outcome/OutcomeScreen'
import { MusterDrawer } from './screens/shared/MusterDrawer'

type Screen = 'draft' | 'outcome' | 'camp' | 'choice'

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('draft')

  const goToCamp = (): void => {
    useCampStore.getState().beginCamp()
    setScreen('camp')
  }

  let current: React.JSX.Element
  if (screen === 'camp') {
    current = <CampScreen onContinue={() => setScreen('choice')} />
  } else if (screen === 'choice') {
    current = <ChoiceScreen onPicked={() => setScreen('outcome')} />
  } else if (screen === 'outcome') {
    current = (
      <OutcomeScreen
        onPlayAgain={() => setScreen('draft')}
        onChoosePath={goToCamp}
        onInvalidState={() => setScreen('draft')}
      />
    )
  } else {
    current = <DraftScreen onProceed={() => setScreen('outcome')} />
  }

  // Draft and choice keep a persistent roster panel — the drawer covers the rest.
  const showDrawer = screen !== 'draft' && screen !== 'choice'

  return (
    <>
      {current}
      {showDrawer && <MusterDrawer />}
    </>
  )
}

export default App
