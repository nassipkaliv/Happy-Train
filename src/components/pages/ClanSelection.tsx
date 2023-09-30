import React from 'react';
import {useRecoilState} from "recoil";
import dogiClan from '../../assets/clan_avatar/dogi_clan.png';
import shibaClan from '../../assets/clan_avatar/shiba_clan.png';
import flokiClan from '../../assets/clan_avatar/floki_clan.png';
import pepeClan from '../../assets/clan_avatar/pepe_clan.png';
import { selectedClan } from '@stores/account';


type ClanSelectionType = {
    clan_name:string;
    clan_id:number;
    clan_avatar:string;
}[]

const clanSelections:ClanSelectionType = [
  {
    clan_name:'floki clan',
    clan_id:1,
    clan_avatar:`${flokiClan}`
  },
    {
    clan_name:'shiba clan',
    clan_id:2,
    clan_avatar:`${shibaClan}`
  },  
  {
    clan_name:'dogi clan',
    clan_id:3,
    clan_avatar:`${dogiClan}`
  },
    {
    clan_name:'pepe clan',
    clan_id:4,
    clan_avatar:`${pepeClan}`
  }
]



function ClanSelection() {
  const [clanState, setClanSate]= useRecoilState(selectedClan);

  const handleSelectedClan = (clan:string)=>{
        setClanSate(clan)
  }
  return (
    <div className='clan-selection-container'>
        <div className='clan-selection-wrapper'>
            <div className='pixel-borders clan-selection-header'>
                <h2>select clan</h2>
            </div>
            <div className='clan-selection-body'>
              <div className='clan-selctions'>
                {clanSelections.map(clan => (
                <div key={clan.clan_id} className='select-clan-container' onClick={()=> handleSelectedClan(clan.clan_name)}>
                  <img src={clan.clan_avatar} alt={clan.clan_name} />
                  <span>{clan.clan_name}</span>
                </div>
              ))}
              </div>
           <div className='clan-selection-button'>
             <button>confirm</button>
           </div>
            </div>
            <div className='clan-selection-bottom'></div>
        </div>
    </div>
  )
}

export default ClanSelection;