
window.onload=()=>{

const saveButton=document.getElementById('save-button');
const tokenInput=document.getElementById('tokenInput');
const modeBtn=document.getElementById('modeBtn');

let token='';
let selectedMode=null;
let ceaseOperations=true;
let remainingDays=0;



//checking token value
chrome.storage.local.get(['token'],(result)=>{
if(!result.token){
    console.log('failed to retrieve token...');
    return;
}

//loading token into memory
token=result.token;
});


chrome.storage.local.get(['ceaseOperations'],(result)=>{
    if(!result.ceaseOperations){
        console.log('failed ton retrieve operation state...');
        return;
    }
    
    ceaseOperations=result.ceaseOperations;
    });



    chrome.storage.local.get(['remainingDays'],(result)=>{
    if(!result.remainingDays){
        console.log('failed ton retrieve remaining days...');
        return;
    }
    
    remainingDays=result.remainingDays;
    });



//checking mode value
chrome.storage.local.get(['mode'],(result)=>{
    if(!result.mode){
        console.log('failed to retrieve mode...');
        return;
    }
    
    //loading token into memory
    selectedMode=result.mode;
    
    if(selectedMode=='kyc-mode'){
        document.getElementById('kyc-mode').checked=true;
        document.getElementById('swap-mode').checked=false;  
    }
      else{
        document.getElementById('swap-mode').checked=true;
        document.getElementById('kyc-mode').checked=false;
      }
    });






/*listening to radios
document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', e => {
      console.log("Mode selected:", e.target.value);
      alert('here');
      
      if(e.target.value=='kyc-mode'){
        document.getElementById('kyc-mode').checked=true;
        document.getElementById('swap-mode').checked=false;
      }
      else{

        document.getElementById('swap-mode').checked=true;
        document.getElementById('kyc-mode').checked=false;   
      }
    
      selectedMode=e.target.value;
      chrome.storage.local.set({mode:e.target.value});
    });
  });*/


  document.getElementById('kyc-mode').addEventListener('click',(e)=>{
    if(e.target.value=='kyc-mode'){
        document.getElementById('kyc-mode').checked=true;
        document.getElementById('swap-mode').checked=false;
      }

      selectedMode=e.target.value;
      chrome.storage.local.set({mode:e.target.value});
  });

  document.getElementById('swap-mode').addEventListener('change',(e)=>{
    if(e.target.value=='swap-mode'){
        document.getElementById('kyc-mode').checked=false;
        document.getElementById('swap-mode').checked=true;
      }

      selectedMode=e.target.value;
      chrome.storage.local.set({mode:e.target.value});
  });
  

//listening to radio button
saveButton.addEventListener('click',()=>{
    
    //no token in memory??
    if(token==''){
        //no input??
        if(tokenInput.value==''){
            alert('Invalid token input');
            return;
        }

        //esle set a new token and reload page
        chrome.storage.local.set({token:tokenInput.value});
        window.location.reload();
    }
    else if(selectedMode==null){
        alert('Please select a mode to proceed');
    }
    else if(ceaseOperations==true && remainingDays<=0){
        alert('Your token is expired...');
    }
    else if(remainingDays>0){
        chrome.storage.local.set({ceaseOperations:false});
    //    alert('Token validation successful...');
        window.location.href=chrome.runtime.getURL('pages/popup.html');
    
    }
    else{
        console.log('Redirecting to home page...');
        window.location.href=chrome.runtime.getURL('pages/popup.html');
    }

  



    chrome.storage.local.get(['token'],(result)=>{
        if(!result.token){
            console.log('failed to retrieve token...checking new value');

            if(tokenInput.value==''){
                alert('Invalid token input');
                return;
            }
            chrome.storage.local.set({token:result.token});
            window.location.reload();
        }

        
      
    });


});






}

