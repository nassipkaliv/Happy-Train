import React from 'react'
import Intro from '../HappyTrainPage/components/Intro'
import DevPhases from '../HappyTrainPage/components/DevPhases'
import Tokenomics from '../HappyTrainPage/components/Tokenomics'
import GameToken from '../HappyTrainPage/components/GameToken'
import FinancialFlow from '../HappyTrainPage/components/FinancialFlow'
import Roadmap from '../HappyTrainPage/components/Roadmap'
import Footer from '../HappyTrainPage/components/Footer'

function MainPage() {
  return (
    <div id='mainpage'>
      <Intro />
      <DevPhases />
      <Tokenomics />
      <GameToken />
      <FinancialFlow />
      <Roadmap />
      <Footer />
    </div>
  )
}

export default MainPage;
