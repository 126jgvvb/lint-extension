let clicker=false;
let ceaseState=false;
let currentDefaultValue=0;
let isRunning=false;

window.onload=()=>{
    const interval=document.getElementById('interval');
    const HotKey=document.getElementById('hot-key');
    const startBtn=document.getElementById('start-button');
    const tokenInput=document.getElementById('token-input');
    const daysLabel=document.getElementById('days-label');
    const statusLabel=document.getElementById('status-label');
    const timeSelect=document.getElementById('timeframe-select');
    const tabsLabel=document.getElementById('tabs-label');
    const vaildationText=document.getElementById('validation-text');
    const validationButton=document.getElementById('validation-button');
    const remainingDaysLabek=document.getElementById('days-remaining-label');
    const keyState=document.getElementById('key-save-status');

   clicker? startBtn.innerText='Running...': startBtn.innerText='Start(click twice)';

    //getting stored values
    chrome.storage.local.get(['days'],(result)=>{
        if(!result.days){
            console.log('failed to retrieve days...using default');
            return daysLabel.textContent=`0 days`;
        }

        daysLabel.textContent=result.days +' days';
      
    });



    chrome.storage.local.get(['ceaseOperations'],(result)=>{
        if(!result.ceaseOperations){
            console.log('failed to retrieve operation state...using default');
            return clicker=true;
        }
        else{
            clicker=!result.ceaseOperations;  //just invert it
            ceaseState=true;
        }

    });


    
    chrome.storage.local.get(['isRunning'],(result)=>{
        if(result.isRunning==false){
            console.log('failed to retrieve  running state...using defaul');
            return isRunning=false;
        }
        else{
            isRunning=true;
            startBtn.innerText='Running...';
        }

    });

    

    chrome.storage.local.get(['ceaseOperations'],(result)=>{
        if(!result.ceaseOperations){
            console.log('failed to retrieve operation state...using default');
            return clicker=true;
        }
        else{
            clicker=!result.ceaseOperations;  //just invert it
            isRunning=false;
            ceaseState=true;
        }

    });



    chrome.storage.local.get(['remainingDays'],(result)=>{
        if(!result.remainingDays){
            console.log('failed to retrieve days...using default');
            return remainingDaysLabek.textContent=`0 days`;
        }

        remainingDaysLabek.textContent=result.remainingDays +' days';
      
    });



    chrome.storage.local.get(['tabCount'],(result)=>{
        if(!result.tabCount){
            console.log('failed to retrieve tab count...using default');
            return tabsLabel.textContent=`0 tabs`;
        }

        tabsLabel.textContent=result.tabCount +' tabs';
      
    });



    chrome.storage.local.get(['hotKey'],(result)=>{
        if(!result.hotKey){
            console.log('failed to retrieve keys...using default');
          return  vaildationText.innerText=result.hotKey;
        }

        vaildationText.innerText=result.hotKey;
    });



    chrome.storage.local.get(['status'],(result)=>{
        if(!result.status){
            console.log('failed to get status...using default');
            statusLabel.style.color='red';
            return statusLabel.textContent='pending';
        }

        if(result.status=='pending') statusLabel.style.color='red';

     return   statusLabel.textContent=result.status;
    });


    
    chrome.storage.local.get(['timeFrame'],(result)=>{ 
        if(!result.timeFrame){
            console.log('failed to get time frame...using default');
            return timeSelect.value='millisec';
        }
        else{ 
         timeSelect.value=result.timeFrame;

    chrome.storage.local.get(['max'],(result2)=>{
        if(!result2.max){ 
            console.log('failed to retrieve max count...using default');
        }

        
        switch(result.timeFrame){
            case 'millisec':interval.max='5000'; currentDefaultValue=5000; break;
            case 'sec':interval.max='60'; currentDefaultValue=60; break;
            case 'mins':interval.max='60'; currentDefaultValue=60; break;
            case 'hours':interval.max='12'; currentDefaultValue=12; break;
        }

      return;
    });
}
});



chrome.storage.local.get(['clickInterval'],(result)=>{
   
        if(!result.clickInterval){
            console.log('failed to get interval...using default');
            setTimeout(()=>{
            chrome.storage.local.set({clickInterval:currentDefaultValue});
            return interval.value=currentDefaultValue;  //???
        },50);
        }
    
        chrome.storage.local.set({clickInterval:result.clickInterval});
     return  interval.value=result.clickInterval;
});











    //---------setter---------methods
    interval.addEventListener('change',(Event)=>{
        const value=parseInt(Event.target.value);

        if(!value || value<0){
            alert('Invalid Interval input,check your input');
            return false;
        }
        
        chrome.storage.local.set({clickInterval:value});

        setTimeout(() => {
        //window.location.reload();
            console.log('Interval saved successfully');
        }, 30);

    });


    validationButton.addEventListener('click',(Event)=>{
        const value=tokenInput.value;
      //  alert(value);

        if(value=='' || value.length<10){
            alert('Invaild token input....');
            return false;
        }

        chrome.storage.local.set({token:value});
      window.location.reload();
        alert('Token saved successfully');
    });


    HotKey.addEventListener('keydown',(Event)=>{
        const value=Event.code;

        if(HotKey.value.length>1){rt
            console.log('Invaild key combination');
            alert('Invaild key combination');
            return false;
        }
     //   alert('here'+value);
        chrome.storage.local.set({hotKey:value});
        keyState.innerText=`Key ${value} saved successfullly`;
        console.log('Key saved successfully');
    });


    startBtn.addEventListener('click',()=>{
        if(clicker){
            chrome.storage.local.set({startClick:false});
            console.log('clicking stopped successfully');
            startBtn.innerText='Start(click twice)';
            clicker=false;
        }
        else{
            if(ceaseState==false){
            chrome.storage.local.set({startClick:true});
        // chrome.storage.local.set({isRunning:true});
            console.log('clicking started successfully');
            startBtn.innerText='Running...';
            clicker=true;
        }
        else{
            clicker=false;
            chrome.storage.local.set({startClick:false});
        }
    }
    
    });


    timeSelect.addEventListener('change',(Event)=>{

        switch(Event.target.value){
            case 'millisec':interval.max='5000'; chrome.storage.local.set({max:'5000'}); break;
            case 'sec':interval.max='60'; chrome.storage.local.set({max:'60'}); break;
            case 'mins':interval.max='60'; chrome.storage.local.set({max:'60'}); break;
            case 'hours':interval.max='12'; chrome.storage.local.set({max:'12'}); break;
        }

        chrome.storage.local.set({timeFrame:Event.target.value});
//        window.location.reload();
        console.log('time frame saved successfully');
     //   alert('time frame saved successfully');
    });


    window.addEventListener('change',()=>{
      setTimeout(() => {
     //   window.location.reload();
      }, 800);  
    });

    //----------default startup values
 //   chrome.storage.local.set({timeFrame:currentTimeFrame});
 //   chrome.storage.local.set({clickInterval:currentInterval});
    chrome.storage.local.set({startClick:clicker});
    chrome.storage.local.set({hotKey:'Space'});
}

