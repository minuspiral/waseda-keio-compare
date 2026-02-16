import { useState, useMemo } from "react";

const BS=["50","52.5","55","57.5","60","62.5","65","67.5","70","72.5","75+"];
const MR=[51.25,53.75,56.25,58.75,61.25,63.75,66.25,68.75,71.25,73.75,76.25];
const pp=(x,b,k)=>1/(1+Math.exp(-k*(x-b)));
const wAvg=(a,w)=>{const s=a.reduce((t,n,i)=>t+n*w[i],0),tot=a.reduce((t,n)=>t+n,0);return tot>0?s/tot:0;};
const sum=a=>a.reduce((x,y)=>x+y,0);

const KC=-2.48, KM=MR.map(m=>m+KC);
const KG={
  A:{d:[1,1,0,0,4,9,44,56,116,104,59],c:"#3355AA",l:"学門A",oa:68.9,bd:65.0,rec:130,rp:394},
  B:{d:[0,0,0,0,3,7,34,44,68,50,23],c:"#4466BB",l:"学門B",oa:68.2,bd:65.0,rec:110,rp:229},
  C:{d:[0,0,0,0,2,4,18,44,73,52,43],c:"#2244AA",l:"学門C",oa:69.2,bd:65.0,rec:140,rp:236},
  D:{d:[0,0,1,0,0,7,37,57,66,56,21],c:"#5577CC",l:"学門D",oa:68.2,bd:65.0,rec:140,rp:245},
  E:{d:[0,0,1,0,4,9,28,60,82,51,36],c:"#2255BB",l:"学門E",oa:68.4,bd:65.0,rec:130,rp:271},
};
const KPERM=2728, KSC=KPERM/Object.values(KG).reduce((s,g)=>s+sum(g.d),0);

const WC=-2.62, WM=MR.map(m=>m+WC);
const WG={
  K1:{d:[0,0,0,0,0,2,7,19,34,14,13],c:"#B84060",l:"学系1",oa:68.6,bd:65.0,rec:45,rp:172,fac:"基幹理工"},
  K2:{d:[0,0,0,1,1,12,28,54,69,55,22],c:"#C4526E",l:"学系2",oa:68.0,bd:65.0,rec:140,rp:458,fac:"基幹理工"},
  K3:{d:[0,0,0,0,1,1,8,9,41,40,25],c:"#A83050",l:"学系3",oa:69.8,bd:67.5,rec:90,rp:304,fac:"基幹理工"},
  ST:{d:[0,0,1,1,2,7,29,33,31,23,4],c:"#D06880",l:"総合機械工",oa:66.7,bd:62.5,rec:80,rp:251,fac:"創造理工"},
  SP:{d:[0,0,0,0,1,5,10,13,26,36,21],c:"#9A2848",l:"物理",oa:69.3,bd:67.5,rec:30,rp:190,fac:"先進理工"},
  SA:{d:[0,0,0,0,0,4,20,20,21,23,16],c:"#B04058",l:"応用物理",oa:68.2,bd:65.0,rec:55,rp:155,fac:"先進理工"},
  SC:{d:[0,0,0,0,4,8,12,34,57,31,23],c:"#CC5A72",l:"応用化学",oa:68.5,bd:65.0,rec:75,rp:262,fac:"先進理工"},
  SL:{d:[0,0,0,1,1,2,9,15,25,23,14],c:"#D47088",l:"生命医科学",oa:68.6,bd:67.5,rec:30,rp:140,fac:"先進理工"},
};

const UNIS=[
  {n:"東大",b:67.5,r:[0,0,0,0.01,0.05,0.12,0.35,0.65,0.75,0.78,0.80],c:"#E74C3C"},
  {n:"京大",b:63.75,r:[0,0,0,0,0.01,0.03,0.06,0.08,0.10,0.10,0.08],c:"#F39C12"},
  {n:"東工大",b:65.0,r:[0.01,0.02,0.05,0.10,0.20,0.35,0.40,0.20,0.08,0.04,0.02],c:"#2ECC71"},
];
const RB=[0.05,0.05,0.08,0.12,0.15,0.25,0.35,0.45,0.55,0.60,0.65];

function natD(mids){return mids.map((_,i)=>{let d=0;UNIS.forEach(u=>{d+=u.r[i]*pp(mids[i],u.b,0.55);});return d;});}
function keioTd(){const nd=natD(KM);return KM.map((_,i)=>{const b=Math.min(nd[i]+0.02,0.98);return b+(1-b)*Math.min(RB[i]*0.80,0.95);});}
const WP={"67.5":{km:0.15,rs:0.45},"65":{km:0.10,rs:0.50},"62.5":{km:0.20,rs:0.85}};
function wasedaTd(bdGroup){
  const nd=natD(WM),kh=[0.01,0.02,0.04,0.08,0.15,0.30,0.45,0.55,0.60,0.55,0.50],kp=WM.map(m=>pp(m,65.0,0.55)),p=WP[String(bdGroup)];
  return WM.map((_,i)=>{const kd=kh[i]*kp[i]*0.40*p.km,base=Math.min(nd[i]+kd+0.02,0.98);return base+(1-base)*Math.min(RB[i]*p.rs,0.95);});
}

function analyzeComposition(perm,enr,mids,rbScale){
  const totalE=sum(enr);
  const groups=UNIS.map(u=>{
    const gE=new Array(11).fill(0);
    for(let i=0;i<11;i++){const fail=perm[i]*u.r[i]*(1-pp(mids[i],u.b,0.55));gE[i]=fail*(1-Math.min(RB[i]*rbScale,0.95));}
    const gt=sum(gE);
    return{name:u.n+"落ち",color:u.c,enrolled:gE,total:gt,avg:gt>0?gE.reduce((s,n,i)=>s+n*mids[i],0)/gt:0};
  });
  const sN=new Array(11).fill(0);groups.forEach(g=>g.enrolled.forEach((v,i)=>{sN[i]+=v;}));
  const oe=enr.map((v,i)=>Math.max(v-sN[i],0)),ot=sum(oe);
  groups.push({name:"第一志望等",color:"#8E44AD",enrolled:oe,total:ot,avg:ot>0?oe.reduce((s,n,i)=>s+n*mids[i],0)/ot:0});
  let npt=0;UNIS.forEach(u=>{for(let i=0;i<11;i++)npt+=perm[i]*u.r[i]*pp(mids[i],u.b,0.55);});
  return{groups,totalE,natPassTotal:npt};
}

const CL={a:"#4A90D9",e:"#2ECC71",d:"#E74C3C",keio:"#4466AA",wsd:"#C4526E"};

function Bar({data,enrolled,mx,h=110}){
  return(<div style={{display:"flex",gap:1,alignItems:"flex-end",height:h,paddingBottom:14,position:"relative"}}>
    {data.map((v,i)=>{const bh=mx>0?(v/mx)*(h-14):0,eh=enrolled?(enrolled[i]/mx)*(h-14):0;
      return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%",position:"relative"}}>
        {v>0&&<div style={{fontSize:5,color:"#99a",marginBottom:1}}>{Math.round(v)}</div>}
        <div style={{width:"85%",position:"relative"}}><div style={{width:"100%",height:bh,background:CL.d+"30",borderRadius:"2px 2px 0 0",position:"relative"}}>
          <div style={{position:"absolute",bottom:0,width:"100%",height:Math.min(eh,bh),background:CL.e+"99",borderRadius:eh>=bh?"2px 2px 0 0":0}}/></div></div>
        <div style={{position:"absolute",bottom:0,fontSize:4.5,color:"#556"}}>{BS[i]}</div></div>);})}
  </div>);
}
function Metric({l,v,c,s}){return(<div style={{textAlign:"center",minWidth:0}}><div style={{fontSize:s||15,fontWeight:700,color:c,whiteSpace:"nowrap"}}>{v}</div><div style={{fontSize:7,color:"#889",whiteSpace:"nowrap"}}>{l}</div></div>);}

function Card({g,enr,mids,label,color}){
  const mx=Math.max(...g.d),te=sum(enr),avgA=wAvg(g.d,mids),avgE=te>0?wAvg(enr,mids):0;
  return(<div style={{background:"rgba(255,255,255,0.025)",borderRadius:10,padding:"8px 10px",marginBottom:6,border:"1px solid "+color+"18"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2,flexWrap:"wrap",gap:4}}>
      <span style={{fontSize:11,fontWeight:600,color:color}}>{label} <span style={{fontSize:8,color:"#889"}}>bd{g.bd}</span></span>
      <span style={{fontSize:8,color:"#889"}}>合格{g.rp} / 入学{te} / 募集{g.rec}</span></div>
    <Bar data={g.d} enrolled={enr} mx={mx} h={80}/>
    <div style={{display:"flex",justifyContent:"space-around",fontSize:9,color:"#99a",marginTop:2,flexWrap:"wrap",gap:"2px 8px"}}>
      <span>公式: <b style={{color:"#dde"}}>{g.oa}</b></span><span>合格者: <b style={{color:"#ccd"}}>{avgA.toFixed(1)}</b></span>
      <span>入学者: <b style={{color:CL.e}}>{avgE.toFixed(1)}</b></span><span>低下: <b style={{color:CL.d}}>-{(avgA-avgE).toFixed(1)}</b></span>
    </div></div>);
}

function StackedBar({groups,h=120}){
  const allB=new Array(11).fill(null).map(()=>[]);
  groups.forEach(g=>{g.enrolled.forEach((v,i)=>{allB[i].push({v,c:g.color});});});
  const bt=allB.map(s=>s.reduce((a,x)=>a+x.v,0)),mx=Math.max(...bt);
  return(<div style={{display:"flex",gap:1,alignItems:"flex-end",height:h,paddingBottom:14,position:"relative"}}>
    {allB.map((segs,i)=>{const total=bt[i];return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%",position:"relative"}}>
      {total>0.5&&<div style={{fontSize:5,color:"#99a",marginBottom:1}}>{Math.round(total)}</div>}
      <div style={{width:"85%",display:"flex",flexDirection:"column-reverse"}}>
        {segs.map((seg,j)=>{const sh=mx>0?(seg.v/mx)*(h-20):0;return sh>0.3?<div key={j} style={{width:"100%",height:sh,background:seg.c+"cc",borderRadius:j===segs.length-1?"2px 2px 0 0":0}}/>:null;})}</div>
      <div style={{position:"absolute",bottom:0,fontSize:4.5,color:"#556"}}>{BS[i]}</div></div>);})}
  </div>);
}

function CompPanel({label,color,comp,mids,totalPerm,enr}){
  const totalE=comp.totalE;
  return(<div style={{background:"rgba(255,255,255,0.025)",borderRadius:10,padding:"10px",border:"1px solid "+color+"15"}}>
    <div style={{fontSize:12,fontWeight:600,color:color,marginBottom:8}}>{label}</div>
    <StackedBar groups={comp.groups} h={110}/>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4,marginBottom:8}}>
      {comp.groups.map(g=>(<div key={g.name} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:7,height:7,borderRadius:2,background:g.color+"cc"}}/><span style={{fontSize:8,color:"#aab"}}>{g.name}</span></div>))}</div>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:9.5}}>
      <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        {["グループ","人数","偏差値","構成比"].map(h=>(<th key={h} style={{padding:"4px 3px",textAlign:h==="グループ"?"left":"center",color:"#889",fontWeight:500,fontSize:8}}>{h}</th>))}</tr></thead>
      <tbody>
        {comp.groups.map(g=>(<tr key={g.name} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
          <td style={{padding:"4px 3px"}}><span style={{display:"inline-block",width:7,height:7,borderRadius:2,background:g.color+"cc",marginRight:4,verticalAlign:"middle"}}/><span style={{color:"#ccd",fontSize:9}}>{g.name}</span></td>
          <td style={{padding:"4px 3px",textAlign:"center",fontWeight:600,color:"#dde"}}>{Math.round(g.total)}</td>
          <td style={{padding:"4px 3px",textAlign:"center",fontWeight:600,color:CL.e}}>{g.avg.toFixed(1)}</td>
          <td style={{padding:"4px 3px",textAlign:"center",color:CL.a}}>{(g.total/totalE*100).toFixed(0)}%</td></tr>))}
        <tr style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <td style={{padding:"4px 3px",fontWeight:600,color:"#fff",fontSize:9}}>合計</td>
          <td style={{padding:"4px 3px",textAlign:"center",fontWeight:700,color:"#fff"}}>{Math.round(totalE)}</td>
          <td style={{padding:"4px 3px",textAlign:"center",fontWeight:700,color:CL.e}}>{(enr.reduce((s,n,i)=>s+n*mids[i],0)/totalE).toFixed(1)}</td>
          <td style={{padding:"4px 3px",textAlign:"center",color:"#889"}}>100%</td></tr>
      </tbody></table>
    <div style={{marginTop:6,fontSize:8,color:"#667"}}>国立合格→辞退: 約{Math.round(comp.natPassTotal)}人 / 許可者{Math.round(totalPerm)}人中</div>
  </div>);
}

function SummaryCard({u}){return(
  <div style={{background:u.c+"0a",borderRadius:10,padding:"10px",border:"1px solid "+u.c+"22"}}>
    <div style={{fontSize:11,fontWeight:600,color:u.c,marginBottom:6}}>{u.label}</div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"4px 2px"}}>
      <Metric l="合格者平均" v={u.aa.toFixed(1)} c={CL.a} s={14}/><div style={{color:"#445",fontSize:14}}>→</div>
      <Metric l="入学者平均" v={u.ae.toFixed(1)} c={CL.e} s={14}/>
      <Metric l="低下" v={"-"+(u.aa-u.ae).toFixed(1)} c={CL.d} s={12}/>
      <Metric l="入学" v={""+u.te} c={CL.e} s={12}/>
      <Metric l="辞退率" v={((1-u.te/u.perm)*100).toFixed(0)+"%"} c={CL.d} s={12}/>
    </div></div>);
}

export default function App(){
  const [tab,setTab]=useState("composition");
  const [sortCol,setSortCol]=useState(null);
  const [sortDir,setSortDir]=useState("desc");
  const kTd=useMemo(()=>keioTd(),[]);
  const wTdC=useMemo(()=>({"67.5":wasedaTd(67.5),"65":wasedaTd(65.0),"62.5":wasedaTd(62.5)}),[]);

  const kAll=Object.values(KG).reduce((a,g)=>a.map((v,i)=>v+g.d[i]),new Array(11).fill(0));
  const kEnr=kAll.map((n,i)=>Math.max(Math.round(n*(1-kTd[i])*KSC),0));
  const kTE=sum(kEnr),kAA=wAvg(kAll,KM),kAE=wAvg(kEnr,KM);
  const kByG={};Object.entries(KG).forEach(([k,g])=>{const e=g.d.map((n,i)=>Math.max(Math.round(n*(1-kTd[i])*KSC),0));kByG[k]={e,te:sum(e)};});
  const kPerm=kAll.map(n=>n*KSC);

  const wByG={};Object.entries(WG).forEach(([k,g])=>{const td=wTdC[String(g.bd)],sc=g.rp/sum(g.d);const e=g.d.map((n,i)=>Math.max(Math.round(n*(1-td[i])*sc),0));wByG[k]={e,te:sum(e)};});
  const wEnrBand=new Array(11).fill(0),wPermBand=new Array(11).fill(0);
  Object.entries(WG).forEach(([k,g])=>{const sc=g.rp/sum(g.d);wByG[k].e.forEach((n,i)=>{wEnrBand[i]+=n;});g.d.forEach((n,i)=>{wPermBand[i]+=n*sc;});});
  const wAll=Object.values(WG).reduce((a,g)=>a.map((v,i)=>v+g.d[i]),new Array(11).fill(0));
  const wTE=sum(wEnrBand),wPerm=sum(wPermBand),wAA=wAvg(wAll,WM);
  const wAE=wTE>0?wEnrBand.reduce((s,n,i)=>s+n*WM[i],0)/wTE:0;

  const kComp=useMemo(()=>analyzeComposition(kPerm,kEnr,KM,0.80),[kPerm,kEnr]);
  const wComp=useMemo(()=>analyzeComposition(wPermBand,wEnrBand,WM,0.50),[wPermBand,wEnrBand]);

  const tb=(id,lb)=>(<button key={id} onClick={()=>setTab(id)} style={{padding:"5px 4px",fontSize:9.5,fontWeight:tab===id?600:400,cursor:"pointer",background:tab===id?"rgba(255,255,255,0.07)":"transparent",border:"none",borderBottom:tab===id?"2px solid #4A90D9":"2px solid transparent",color:tab===id?"#fff":"#778",transition:"all 0.15s",flex:"1 1 0",minWidth:0,whiteSpace:"nowrap"}}>{lb}</button>);

  const scrollBox={background:"rgba(255,255,255,0.025)",borderRadius:10,padding:"8px",border:"1px solid rgba(255,255,255,0.04)",overflowX:"auto",WebkitOverflowScrolling:"touch"};
  const autoGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))"};

  return(
    <div style={{fontFamily:"'Noto Sans JP','Hiragino Sans',sans-serif",background:"linear-gradient(135deg,#0b0b16,#151528,#101e2e)",color:"#dde",minHeight:"100vh",padding:"12px 8px"}}>
      <div style={{maxWidth:1120,margin:"0 auto"}}>
        <h1 style={{fontSize:16,fontWeight:700,color:"#fff",margin:"0 0 2px"}}>早慶理工 入学者偏差値推定</h1>
        <p style={{fontSize:8.5,color:"#6789a0",margin:"0 0 10px"}}>公式入試統計2025 + 河合塾全統模試 + 駿台ベネッセ併願成功率(2023)</p>

        <div style={{...autoGrid,gap:8,marginBottom:10}}>
          <SummaryCard u={{label:"慶應義塾大学 理工学部",c:CL.keio,aa:kAA,ae:kAE,te:kTE,perm:KPERM}}/>
          <SummaryCard u={{label:"早稲田大学 理工3学部",c:CL.wsd,aa:wAA,ae:wAE,te:wTE,perm:wPerm}}/>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",borderBottom:"1px solid rgba(255,255,255,0.05)",marginBottom:8}}>
          {tb("composition","構成分析")}{tb("compare","学科別比較")}{tb("keio","慶應")}{tb("waseda","早稲田")}{tb("verify","検証")}
        </div>

        {tab==="composition"&&(<div>
          <div style={{...autoGrid,gap:10,marginBottom:10}}>
            <CompPanel label="慶應理工" color={CL.keio} comp={kComp} mids={KM} totalPerm={KPERM} enr={kEnr}/>
            <CompPanel label="早稲田理工(8学科)" color={CL.wsd} comp={wComp} mids={WM} totalPerm={wPerm} enr={wEnrBand}/>
          </div>
          <div style={{...scrollBox,marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:600,color:"#fff",marginBottom:6}}>グループ別比較</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:9.5,minWidth:400}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  <th style={{padding:"3px 4px",textAlign:"left",color:"#889",fontSize:8}}>グループ</th>
                  <th style={{padding:"3px",textAlign:"center",color:CL.keio,fontSize:8}} colSpan={3}>慶應理工</th>
                  <th style={{padding:"3px",textAlign:"center",color:CL.wsd,fontSize:8}} colSpan={3}>早稲田理工</th></tr>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <th style={{fontSize:7}}></th>
                  {["人数","偏差値","構成比","人数","偏差値","構成比"].map((h,i)=>(<th key={i} style={{padding:"2px 3px",textAlign:"center",color:"#667",fontSize:7}}>{h}</th>))}</tr>
              </thead>
              <tbody>{kComp.groups.map((kg,idx)=>{const wg=wComp.groups[idx];return(
                <tr key={idx} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                  <td style={{padding:"3px 4px",whiteSpace:"nowrap"}}><span style={{display:"inline-block",width:7,height:7,borderRadius:2,background:kg.color+"cc",marginRight:4,verticalAlign:"middle"}}/><span style={{color:"#ccd",fontSize:9}}>{kg.name}</span></td>
                  <td style={{padding:"3px",textAlign:"center",color:"#dde"}}>{Math.round(kg.total)}</td>
                  <td style={{padding:"3px",textAlign:"center",color:CL.e,fontWeight:600}}>{kg.avg.toFixed(1)}</td>
                  <td style={{padding:"3px",textAlign:"center",color:CL.a,fontSize:9}}>{(kg.total/kComp.totalE*100).toFixed(0)}%</td>
                  <td style={{padding:"3px",textAlign:"center",color:"#dde"}}>{Math.round(wg.total)}</td>
                  <td style={{padding:"3px",textAlign:"center",color:CL.e,fontWeight:600}}>{wg.avg.toFixed(1)}</td>
                  <td style={{padding:"3px",textAlign:"center",color:CL.a,fontSize:9}}>{(wg.total/wComp.totalE*100).toFixed(0)}%</td></tr>);})}</tbody>
            </table></div>
          <div style={{background:"rgba(74,144,217,0.04)",borderRadius:10,padding:"10px",border:"1px solid rgba(74,144,217,0.1)",fontSize:9.5,lineHeight:1.7,color:"#8899bb"}}>
            <b style={{color:"#fff",fontSize:11}}>入学者平均 偏差値66の構造</b><br/><br/>
            <b style={{color:CL.e}}>入学者の約6割が東大不合格者</b>（平均66.9、東大ボーダー67.5直下）。偏差値70+の東大落ちの多くは浪人を選ぶため、実際に入学するのは65-68付近が中心。<br/><br/>
            <b style={{color:CL.d}}>東工大落ち(約17%)</b>と<b style={{color:"#8E44AD"}}>第一志望等(約20-25%)</b>が平均63-65で全体を引き下げ、結果として入学者平均は<b style={{color:CL.e}}>約66</b>に収束。<br/><br/>
            偏差値66 ≒ <b style={{color:"#fff"}}>東京科学大(旧東工大)合格者の平均水準</b>。京大工(67-68)よりやや低く、阪大工(62-63)よりは明確に上。</div>
        </div>)}

        {tab==="compare"&&(<div>
          <div style={{...autoGrid,gap:8,marginBottom:8}}>
            {[{label:"慶應理工 全体",c:CL.keio,data:kAll,enr:kEnr,aa:kAA,ae:kAE,n:sum(kAll),te:kTE},
              {label:"早稲田理工 全体(8学科)",c:CL.wsd,data:wAll,enr:wEnrBand,aa:wAA,ae:wAE,n:sum(wAll),te:wTE}
            ].map((u,idx)=>(<div key={idx} style={{background:"rgba(255,255,255,0.025)",borderRadius:10,padding:"8px",border:"1px solid "+u.c+"12"}}>
              <div style={{fontSize:10,fontWeight:600,color:u.c,marginBottom:2}}>{u.label}</div>
              <div style={{fontSize:8,color:"#99a",marginBottom:2}}>{u.n}人→入学{u.te}（{u.aa.toFixed(1)}→<span style={{color:CL.e}}>{u.ae.toFixed(1)}</span>）</div>
              <Bar data={u.data} enrolled={u.enr} mx={Math.max(...u.data)} h={90}/></div>))}</div>
          <div style={scrollBox}>
            {(()=>{
              const cols=["大学","学科","BD","公式","合格者","入学者","低下","入/募","辞退"];
              const sk=[null,null,"bd","oa","avgA","avgE","drop",null,"decline"];
              const rows=[
                ...Object.entries(KG).map(([k,g])=>{const info=kByG[k],avgA=wAvg(g.d,KM),avgE=info.te>0?wAvg(info.e,KM):0;return{uni:"慶應",key:k,g,info,color:CL.keio,avgA,avgE,drop:avgA-avgE,decline:1-info.te/g.rp};}),
                ...Object.entries(WG).map(([k,g])=>{const info=wByG[k],avgA=wAvg(g.d,WM),avgE=info.te>0?wAvg(info.e,WM):0;return{uni:"早稲田",key:k,g,info,color:CL.wsd,avgA,avgE,drop:avgA-avgE,decline:1-info.te/g.rp};})];
              const sorted=sortCol?[...rows].sort((a,b)=>{const va=a[sortCol]??a.g[sortCol]??0,vb=b[sortCol]??b.g[sortCol]??0;return sortDir==="asc"?va-vb:vb-va;}):rows;
              const arrow=(key)=>sortCol===key?(sortDir==="asc"?" ▲":" ▼"):"";
              const thClick=(key)=>{if(!key)return;if(sortCol===key)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortCol(key);setSortDir("desc");}};
              return(<table style={{width:"100%",borderCollapse:"collapse",fontSize:9,minWidth:460}}>
                <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  {cols.map((h,ci)=>(<th key={h} onClick={()=>thClick(sk[ci])} style={{padding:"3px 2px",textAlign:ci<2?"left":"center",color:sortCol===sk[ci]?"#4A90D9":"#889",fontWeight:500,fontSize:7.5,cursor:sk[ci]?"pointer":"default",userSelect:"none",whiteSpace:"nowrap"}}>{h}{arrow(sk[ci])}</th>))}</tr></thead>
                <tbody>{sorted.map(r=>(<tr key={r.uni+r.key} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                  <td style={{padding:"3px 2px",color:r.color,fontWeight:600,fontSize:8}}>{r.uni}</td>
                  <td style={{padding:"3px 2px",color:"#bbc",fontSize:8.5,whiteSpace:"nowrap"}}>{r.g.fac?r.g.fac+" "+r.g.l:r.g.l}</td>
                  <td style={{padding:"3px 2px",textAlign:"center",fontSize:8.5}}>{r.g.bd}</td>
                  <td style={{padding:"3px 2px",textAlign:"center",fontSize:8.5}}>{r.g.oa}</td>
                  <td style={{padding:"3px 2px",textAlign:"center",color:CL.a}}>{r.avgA.toFixed(1)}</td>
                  <td style={{padding:"3px 2px",textAlign:"center",color:CL.e,fontWeight:600}}>{r.avgE.toFixed(1)}</td>
                  <td style={{padding:"3px 2px",textAlign:"center",color:CL.d}}>-{r.drop.toFixed(1)}</td>
                  <td style={{padding:"3px 2px",textAlign:"center",fontSize:8}}>{r.info.te}/{r.g.rec}</td>
                  <td style={{padding:"3px 2px",textAlign:"center",color:CL.d,fontSize:8}}>{(r.decline*100).toFixed(0)}%</td></tr>))}</tbody></table>);
            })()}
            {sortCol&&(<div style={{textAlign:"right",marginTop:4}}><button onClick={()=>setSortCol(null)} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:4,color:"#889",fontSize:8,padding:"2px 8px",cursor:"pointer"}}>ソート解除</button></div>)}
          </div></div>)}

        {tab==="keio"&&(<div>{Object.entries(KG).map(([k,g])=>(<Card key={k} g={g} enr={kByG[k].e} mids={KM} label={g.l} color={g.c}/>))}</div>)}

        {tab==="waseda"&&(<div>{["基幹理工","創造理工","先進理工"].map(fac=>{const items=Object.entries(WG).filter(([_,g])=>g.fac===fac);return(<div key={fac} style={{marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:600,color:CL.wsd,marginBottom:4,paddingLeft:4}}>{fac}学部</div>
          {items.map(([k,g])=>(<Card key={k} g={g} enr={wByG[k].e} mids={WM} label={g.l} color={g.c}/>))}</div>);})}</div>)}

        {tab==="verify"&&(<div>
          <div style={{...scrollBox,marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:600,color:"#fff",marginBottom:6}}>併願成功率の検証（駿台ベネッセ 2023）</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:9.5,minWidth:320}}>
              <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                {["グループ","慶應","早稲田基幹","整合"].map(h=>(<th key={h} style={{padding:"3px 4px",textAlign:"left",color:"#889",fontWeight:500,fontSize:8}}>{h}</th>))}</tr></thead>
              <tbody>
                {[["東大理I合格","97.0%","97.1%","一致"],["東大理I不合格","61.5%","47.3%","慶應>早稲田"],["京大工合格","73.5%","63.4%","慶應>早稲田"],["京大工不合格","33.0%","15.4%","慶應>早稲田"],["東工大合格","61.8%","54.7%","慶應>早稲田"],["東工大不合格","17.1%","8.5%","慶應>>早稲田"]
                ].map((r,i)=>(<tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                  <td style={{padding:"3px 4px",color:"#bbc",fontSize:9,whiteSpace:"nowrap"}}>{r[0]}</td>
                  <td style={{padding:"3px 4px",color:CL.keio}}>{r[1]}</td>
                  <td style={{padding:"3px 4px",color:CL.wsd}}>{r[2]}</td>
                  <td style={{padding:"3px 4px",color:CL.e,fontSize:8}}>{r[3]}</td></tr>))}</tbody></table></div>
          <div style={{...scrollBox,marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:600,color:"#fff",marginBottom:6}}>モデルパラメータ</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:9.5,minWidth:320}}>
              <tbody>
                {[["慶應 ボーダー","全学門 65.0","河合塾2026"],["慶應 補正","-2.48","学門A公式68.9で校正"],["慶應 浪人率","0.80","入学者650人に校正"],["","",""],
                  ["早稲田 ボーダー","62.5/65.0/67.5","学科ごとに設定"],["早稲田 補正","-2.62","8学科公式平均で校正"],
                  ["bd=67.5","km=0.15, rs=0.45","学系3,物理,生命医科"],["bd=65.0","km=0.10, rs=0.50","学系1,2,応物,応化"],["bd=62.5","km=0.20, rs=0.85","総合機械工"]
                ].map((r,i)=>r[0]===""?<tr key={i}><td colSpan={3} style={{height:4}}></td></tr>:
                  (<tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <td style={{padding:"3px 4px",color:"#bbc",fontSize:9}}>{r[0]}</td>
                    <td style={{padding:"3px 4px",fontWeight:600,color:CL.e,fontSize:9}}>{r[1]}</td>
                    <td style={{padding:"3px 4px",color:"#889",fontSize:8}}>{r[2]}</td></tr>))}</tbody></table></div>
          <div style={{background:"rgba(46,204,113,0.04)",borderRadius:10,padding:"10px",border:"1px solid rgba(46,204,113,0.1)",fontSize:9,lineHeight:1.6,color:"#9aab99"}}>
            <b style={{color:CL.e}}>辞退率モデル:</b> 辞退率 = 国立合格辞退 + 慶應W合格辞退(早稲田のみ) + 残り×浪人率<br/>
            <b style={{color:"#bccbbc"}}>km</b>: 慶應W合格選択率倍率 / <b style={{color:"#bccbbc"}}>rs</b>: 浪人率スケール</div>
        </div>)}

        <div style={{marginTop:10,background:"rgba(74,144,217,0.04)",borderRadius:10,padding:"10px",border:"1px solid rgba(74,144,217,0.1)",fontSize:9,lineHeight:1.6,color:"#8899bb"}}>
          <b style={{color:CL.a}}>結論:</b> 慶應理工の入学者平均は推定<b style={{color:CL.e}}>{kAE.toFixed(1)}</b>、早稲田理工は<b style={{color:CL.e}}>{wAE.toFixed(1)}</b>。
          両校とも入学者の約6割が東大不合格者(平均66.9)で、東工大落ち(約17%)と第一志望層(20-25%)が平均を引き下げる構造。</div>
        <div style={{textAlign:"center",fontSize:7,color:"#445",marginTop:4,paddingBottom:8}}>慶應2025 + 早稲田2025 + 河合塾全統模試 + 駿台ベネッセ2023</div>
      </div></div>);
}
