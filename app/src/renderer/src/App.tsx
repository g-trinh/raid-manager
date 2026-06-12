import { useState } from 'react'
import { useRunStore } from './domain/stores/useRunStore'
import { DraftScreen } from './screens/draft/DraftScreen'
import { OutcomeScreen } from './screens/outcome/OutcomeScreen'
import { RoadScreen } from './screens/road/RoadScreen'
import { WarTableScreen } from './screens/table/WarTableScreen'
import { ChronicleDrawer } from './screens/shared/ChronicleDrawer'
import { MusterDrawer } from './screens/shared/MusterDrawer'

type Screen = 'draft' | 'table' | 'outcome' | 'road'

// Hub-and-spoke: the war table is home. Combat starts there (pull), spoils
// and the road always lead back there. The outcome screen is pure resolution.
function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('draft')

  const handlePull = (): void => {
    useRunStore.getState().pull()
    setScreen('outcome')
  }

  let current: React.JSX.Element
  if (screen === 'table') {
    current = <WarTableScreen onPull={handlePull} onRoadTaken={() => setScreen('road')} />
  } else if (screen === 'road') {
    current = <RoadScreen onContinue={() => setScreen('table')} />
  } else if (screen === 'outcome') {
    current = (
      <OutcomeScreen
        onPlayAgain={() => setScreen('draft')}
        onToTable={() => setScreen('table')}
        onInvalidState={() => setScreen('table')}
      />
    )
  } else {
    current = <DraftScreen onProceed={() => setScreen('table')} />
  }

  // Draft and the war table keep a persistent roster panel — the drawer
  // covers the resolution and road screens.
  const showDrawer = screen !== 'draft' && screen !== 'table'

  return (
    <>
      {current}
      {showDrawer && <MusterDrawer />}
      <ChronicleDrawer />
    </>
  )
}

export default App
