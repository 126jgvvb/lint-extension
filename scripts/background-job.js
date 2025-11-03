
console.log('background worker runTime started...');
let activeTabs=new Set();  //to avoid duplicates
let maxTabs=4;

/*
chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
    chrome.tabs.sendMessage(tabs[0].id, {
        type: 'SHOW_NOTIFICATION',
        text: `🔥 This was initially rejected with ....,please be careful`
      },(response)=>{
        if(chrome.runtime.lastError){
            console.log('No reciever found',chrome.runtime.lastError.message);
        }
      });
      
});
*/

setInterval(()=>{
  

chrome.storage.local.get(["message"],(result2)=>{
    if(!result2.message||result2.message==null ){
        console.log('failed to get any new messages..returning');
        return;
    }

    let matchFinder="";

    chrome.storage.local.get(['matchedFeature'],(result)=>{
        if(!result.matchedFeature){
            console.log('failed to get matched feature...');
            return;
        }

        chrome.storage.local.get(['tabId'],(resN)=>{
            if(!resN.tabId || resN.tabId==""){
                console.log('failed to get tab id...');
            }


            matchFinder=result.matchedFeature;
            console.log('====>',matchFinder);
    
            chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
                const lastTabIdEntry=Array.from(activeTabs).pop();
             
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'SHOW_NOTIFICATION',
                    text: `${result2.message}|${result.matchedFeature}`,
                    other:result.matchedFeature,
                    tabId:resN.tabId || lastTabIdEntry
                  },(response)=>{
                    if(chrome.runtime.lastError){
                        console.log('No reciever found',chrome.runtime.lastError.message);
                    }
                  });
    
                  chrome.storage.local.set({matchedFeature:null});
                  chrome.storage.local.set({message:null});
                  
            });
        })    

    });
    
 
    //---------tesing using above..dont follow below for now
return;
    chrome.storage.local.get(["message_seen"],(result)=>{
        if(!result.message_seen){
            console.log("---------->failed to get message status");   
            return;
        }

        if(result.message_seen==false){
            console.log('failed to read message status....');
            chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'SHOW_NOTIFICATION',
                    text: `🔥 This was initially rejected with ${result.message}....,please be careful`
                  },(response)=>{
                    if(chrome.runtime.lastError){
                        console.log('No reciever found',chrome.runtime.lastError.message);
                    }
                  });
                  
            });         
        }
       else if(result.message_seen){
        console.log('Message has been observed');
            return;
        }
    });
    
   
})


},8000);


chrome.storage.local.get(['XextensionAlreadyRunning'],(result)=>{
if(result.extensionAlreadyRunning==true){
    console.log('Another instance of this extension is running...shutting down');
}
else{
    console.log('No other extension detected...commencing');
    chrome.storage.local.set({extensionAlreadyRunning:true});

    
chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab)=>{
    if(changeInfo.status==='complete' /*&& tab.url.startsWith('https://172')*/){
        if(activeTabs.size<maxTabs){
            activeTabs.add(tabId);
            console.log(`Tab ${tabId} has been added`);
        }
        else{
            console.log('maximum tab number reached');
        //    alert('This tab will not be operated on...maximum tab number reached');
        }
    }
});


chrome.tabs.onRemoved.addListener((tabId)=>{
if(activeTabs.has(tabId)){
    activeTabs.delete(tabId);
    chrome.storage.local.set({message_seen:false});
    console.log(`Tab ${tabId} has been removed`);
}
});



setInterval(()=>{
    chrome.storage.local.get(['tabCount'],(result)=>{
        if(!result.tabCount){
            console.log('Invalid tab count noticed...using default:',maxTabs);
            chrome.storage.local.set({tabCount:maxTabs});
      //      chrome.storage.local.set({allTabIds:activeTabs});
        }
        else{
            maxTabs=result.tabCount;
        }
    });
},2000);


chrome.runtime.onMessage.addListener((request,sender,resp)=>{
   console.log('validation request recieved with id:',sender.tab.id);
    if(request.message=='validate-tab'){
   
            if(activeTabs.has(sender.tab.id)){
                resp({answer:true});
            }
            else{
                resp({answer:false});
            }
        
    }
});
}
});

