
console.log('background worker runTime started...');
let activeTabs=new Set();  //to avoid duplicates
let maxTabs=4;

chrome.storage.local.get(['extensionAlreadyRunning'],(result)=>{
if(result.extensionAlreadyRunning==true){
    console.log('Another instance of this extension is running...shutting down');
}
else{
    console.log('No other extension detecetd...commencing');
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

