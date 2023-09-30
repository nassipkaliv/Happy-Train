import React from 'react'
import {Link} from 'react-router-dom'
import "./_footer.scss";


function Footer() {
  return (
    <>
      <div id="footer">
      <div className="d-flex justify-content-center">
        <a target="_blank" href='https://discord.gg/happytraingame' rel="noreferrer">
          <button>
            <img src={require("../../../../assets/images/Discord.png")} alt='discord'/>
          </button> 
        </a>
        <a target="_blank" href='https://t.me/happy_train_game' rel="noreferrer">
          <button>
            <img src={require("../../../../assets/images/Telegram.png")} alt='telegram'/>  
          </button> 
        </a>
        <a target="_blank" href='https://t.me/happy_train_game_ru' rel="noreferrer">
          <button>
            <img src={require("../../../../assets/images/TelegramRU.png")} alt='tgru'/>
          </button> 
        </a>
        <a target="_blank" href=' https://twitter.com/HappyTrain_Game'>
          <button>
            <img src={require("../../../../assets/images/Twitter.png")} alt='twitter'/>
          </button>
        </a>
        <a target="_blank" href='https://www.reddit.com/user/HappyTrainGame' rel="noreferrer">
          <button>
            <img src={require("../../../../assets/images/Reddit.png")} alt='reddit'/>
          </button> 
        </a>
        <a target="_blank" href=' https://medium.com/@HappyTrain'>
          <button>
            <img src={require("../../../../assets/images/Medium.png")} alt='medium'/>
          </button> 
        </a>
        <a target="_blank" href='https://www.youtube.com/@HappyTrainGame' rel="noreferrer">
          <button>
            <img src={require("../../../../assets/images/Youtube.png")} alt='youtube'/>
          </button>        
        </a>
      </div>
      </div>
    </>
    
  )
}

export default Footer;
