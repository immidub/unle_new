import { useState } from 'react';
import { getData } from './data';
import { assign,startGame,totalScore,type Game } from './game/engine';
import { readBest,saveBest } from './game/storage';
import { Start } from './screens/Start';
import { Play } from './screens/Play';
import { Results } from './screens/Results';
const loaded=(()=>{try{return {data:getData(),error:null};}catch(e){return {data:null,error:String(e)};}})();
export default function App(){
 const [game,setGame]=useState<Game|null>(null);
 const ids=loaded.data?.categories.map(c=>c.id)??[];
 const [best,setBest]=useState(()=>readBest(ids)?.score??null);
 const data=loaded.data;
 function restart(){if(data){setGame(startGame(data.countries,data.categories));window.scrollTo({top:0,behavior:'smooth'});}}
 function confirm(id:string){if(!game||!data)return;const next=assign(game,id);if(next.status==='complete')setBest(saveBest(ids,totalScore(next,data.categories)).score);setGame(next);}
 return <div className="app"><header><a className="brand" href="./" aria-label="Country Rank home"><span className="brand-symbol">◎</span>Country Rank<span className="brand-period">.</span></a><span className="header-note">A WORLD OF GOOD GUESSES <span>↗</span></span></header><main>{!data?<div role="alert" className="warning"><h1>We couldn’t load the world.</h1><p>{loaded.error}</p><p>Check the local master list and flag assets, then reload.</p></div>:<>{data.warnings.length>0&&<aside className="warning" role="alert"><strong>Development warning</strong>{data.warnings.map(w=><p key={w}>{w}</p>)}</aside>}{!game?<Start {...data} best={best} onStart={restart}/>:game.status==='playing'?<Play game={game} {...data} onAssign={confirm}/>:<Results game={game} {...data} best={best} onRestart={restart}/>}</>}</main><footer><span>Country Rank <span className="footer-star">✦</span> Curiosity looks good on you.</span><span>LOW SCORES. HIGH EXPECTATIONS.</span></footer></div>;
}
