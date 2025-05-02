console.log('Page injection successfull...'); 

const element='.table-responsive .ng-scope button';
const secret='my-spiral-andromeda-galaxy-2345678901223433543ijfhgirutg5454059954';
let hotKey='Space';
let clickInterval=5000;
let defaultClickValue=5000;
let buttonPresent=false;
let ceaseOperations=true;
let clickTimer=null;
let timeFrame=null;
 let shouldClick=false;
let captureMultipleCalls=0;
let maxTabs=0;
let allTabs=null;
let multipleInstances=false;


    
const decryptToken=(token)=>{
        console.log('decrypting token....');
        const stringifiedObj=atob(token);
        let str='';

        for(let i=0; i<stringifiedObj.length; ++i){
            str+=String.fromCharCode(stringifiedObj.charCodeAt(i)^secret.charCodeAt(i%secret.length));
        }

//console.log(`parsed object: ${JSON.parse(str).days}`);
return JSON.parse(str);
}


        setInterval(()=>{

            chrome.storage.local.get(['hotKey'],(result)=>{
                if(!result.hotKey){
                    console.log('No-key-configured,using-default:'+hotKey);
                 chrome.storage.local.set({hotKey:hotKey});
                 return false;
               }
    
               console.log(`Configured key:${result.hotKey}`);
               hotKey=result.hotKey;
               return true;
            });
            

            
            chrome.storage.local.get(['token'],(result)=>{
                if(!result.token){
                    ceaseOperations=true;
                    console.log('failed to get token...');
                    chrome.storage.local.set({status:'pending'});
                    chrome.storage.local.set({remainingDays:0});
                    chrome.storage.local.set({ceaseOperations:true});
                    return false;
               }    
    
    
               chrome.storage.local.get(['ceaseOperations'],(result)=>{
                if(result.ceaseOperations==undefined){
             //       shouldClick=false;
                    console.log('failed to get operation state...');
                    chrome.storage.local.set({ceaseOperations:true});
                    ceaseOperations=true;
                    return false;
               }
                
          else if(result.ceaseOperations==true){
            chrome.storage.local.set({ceaseOperations:true}); //can ignore this
           }
            });

            console.log('token obtained...continuing with decryption');
            //code decryption algorithm
               const storedObj=decryptToken(result.token);
                if(!storedObj.days){
                 console.log('Error in token....declining');
                 return;
                }
     
               const remainingDays=storedObj.days;
                const absoluteDate=storedObj.initialDate;
                const currentDate=Date.now();
                const daysAfterConversion=(currentDate-absoluteDate)/(1000*60*60*24);
     
                maxTabs=storedObj.tabCount;
                chrome.storage.local.set({tabCount:maxTabs});
                chrome.storage.local.set({days:remainingDays});
                
     
                if(!((daysAfterConversion)<remainingDays)){
                 ceaseOperations=true;
             chrome.storage.local.set({status:'pending'});
             chrome.storage.local.set({remainingDays:0});
             chrome.storage.local.set({ceaseOperations:true});
            // console.log(absoluteDate+">>"+(daysAfterConversion));
                 console.log('Expiry reached....all operations ceased');
                }
                else{
                 chrome.storage.local.set({remainingDays:Math.floor(remainingDays-(daysAfterConversion))});
                 chrome.storage.local.set({status:'active'});
                 chrome.storage.local.set({ceaseOperations:false});
                 ceaseOperations=false;
                 console.log('Token vaildation successfull...');
                }
   
          });


            
            chrome.storage.local.get(['tabCount'],(result)=>{
            if(!result.tabCount){
                console.log('failed to get tab count...using default: 0');
                timeFrame=5000;  //5 secs
                return false;
           }
        
           maxTabs=result.tabCount;
           allTabs=result.allTabIds;  //not important at the moment
           return true;
          });
            
            

            chrome.storage.local.get(['timeFrame'],(result)=>{
                if(!result.timeFrame){
                    console.log('failed to get timeframe...using default');
                    timeFrame='millisec';  //5 secs
                    return false;
               }
            
               timeFrame=result.timeFrame;
               return true;
            });



            chrome.storage.local.get(['clickInterval'],(result)=>{
                if(!result.clickInterval){
                  
                    console.log('failed to get click-interval...using default');   
                    clickInterval=defaultClickValue;
                    return false;
               }
    
        
               switch(timeFrame){
                case 'millisec':clickInterval=result.clickInterval; break;
                case 'sec':clickInterval=result.clickInterval*1000; break;
                case 'mins':clickInterval=result.clickInterval*60000; break;
                case 'hours':clickInterval=result.clickInterval*3600000; break;
                case 'default':clickInterval=defaultClickValue; break;
               }
            
               console.log(`Current time frame: ${timeFrame} and interval: ${clickInterval}`);
            });
            

            
            chrome.storage.local.get(['startClick'],(result)=>{
                if(!result.startClick){
                    console.log('current click is disabled...waiting for hot key');
                  //  shouldClick=false;
                  chrome.storage.local.set({isRunning:false});
                  return false;
               }
               else{
                chrome.storage.local.set({isRunning:true});
                console.log(ceaseOperations+' Start button inititiated click...commencing',result.startClick);
                if(result.startClick && ceaseOperations==false)  toggleClicking();
                chrome.storage.local.set({startClick:false});
               }
     
            });
            
            
        },4000);  //4000
    
    
    
    
    const toggleClicking=async()=>{
    
      const stopClicking=()=>{
        if(!shouldClick){
                clearInterval(clickTimer);
                chrome.storage.local.set({isRunning:false});
                console.log('stopped clicking...waiting for next key press');
                return null;
            }
      }
    
      const startClicking=()=>{
        chrome.storage.local.set({isRunning:true});
        const button=document.querySelector(element);
              if(button){
                    buttonPresent=true;
                    button.click();
                    console.log('Button clicked...');
                }
                else{
                    alert('Button not available');
                    console.log('No button found.... or invalid subscription');
                    clearInterval(clickTimer);
                    buttonPresent=false;
                }
      }
    
        console.log('initiating-click...'+clickTimer);
        shouldClick=shouldClick?false:true;
    
        await chrome.runtime.sendMessage({message:'validate-tab'},(response)=>{
            console.log('response recieved...');
            if(response.answer){
                clickTimer=clickTimer!=null?stopClicking():setInterval(()=>{
                    startClicking();
        
                },clickInterval); 
            }
            else{
                alert('Permission denied...tab subscription failed');
                console.log('Permission denied');
                return;
            }
        });  
    
    }
    
    
   
    




 document.addEventListener('keydown',(event)=>{
    if(multipleInstances){
        alert('Another instance of chrome is using this service...please close one');
        return false;
    }
    
        if(event.code===hotKey){
         console.log('control key detected...initiating click module');
           if(ceaseOperations==false){
             toggleClicking();
           }
           else{
            alert('Subscription expired...please recharge');
            return false;
           }
        }
    });
        

window.addEventListener('unload',()=>{
    console.log('cleaning up extension');
chrome.storage.local.set({extensionAlreadyRunning:false});
});




//------------------calls-------------------------------------

//toggleClicking();
//encryptObj({days:10,dateOfCreation:(new Date()).toISOString()});

//checkButton();
