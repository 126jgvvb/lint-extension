
window.onload=()=>{

    const tokenStatus=document.getElementById('token-status');
    const remainingDays=document.getElementById('remaining-days');
    const phoneInput = document.getElementById('phoneInput');
    const copyBtn1 = document.getElementById('copyBtn1');
    const copyBtn2 = document.getElementById('copyBtn2');
    const copyBtn3 = document.getElementById('copyBtn3'); 
    const copyBtn4 = document.getElementById('copyBtn4'); 
    const allCopies=document.querySelector('icon-btn');
    const clockEl = document.getElementById('clock');
    const customersContainer = document.getElementById('customersContainer');
    const loadingDots = document.getElementById('loadingDots');
    const spinner = document.getElementById('spinner');
    const readingText = document.getElementById('readingText');
    const readingWidget=document.getElementById('reading-widget');

    const MSISDN=document.getElementById('msisdn');
    const Names=document.getElementById('names');
    const kNames=document.getElementById('knames');
    const rejectReason=document.getElementById('reject-value');
    const currentMode=document.getElementById('current-mode');

    const caseMode=document.getElementById('case-mode');
    const modeBtn=document.getElementById('modeBtn');

    const saveBtn=document.getElementById('saveBtn');
    const saveStatus = document.getElementById('saveStatus');
    const savedCountWrap = document.getElementById('savedCountWrap');
    const savedCountEl = document.getElementById('savedCount');
    const caseModeLabel = document.getElementById('case-mode');


    saveBtn.addEventListener('click',onSaveClick);

    // Get the internal extension URL
let serverAddr="";
const configUrl = chrome.runtime.getURL('scripts/config.json');

// Fetch and read the JSON
fetch(configUrl)
  .then(response => response.json())
  .then(config => {
            serverAddr = config.SERVER_URL;
    console.log('Server address:', serverAddr);

 // initial fetch of count on load
 fetchSavedCount().catch(()=>{});
  })
  .catch(err => console.error('Error loading config:', err));


    const saveToClipBoard=(text)=>{
        navigator.clipboard.writeText(text)
  .then(() => {
    console.log("Copied to clipboard!");
  })
  .catch(err => {
    console.error("Failed to copy: ", err);
  });
    }


      // Fetch total saved count from network
      async function fetchSavedCount(){
        console.log('fetching count...');


        try{
          const res = await fetch(`http://${serverAddr}/admin/get-data-count`);
          if(!res.ok) throw new Error('Bad status: ' + res.status);
          const json = await res.json();
          // expect { total: 123 }
          const total = Number(json.data ?? json.count ?? 0);
          savedCountEl.textContent = total;
          savedCountWrap.classList.remove('hidden');
          setStatus('Last sync: ' + new Date().toLocaleTimeString());
        }catch(err){
          setStatus('Could not fetch saved count');
          console.error('fetchSavedCount error', err);
        }
      }


    async function onSaveClick(){
      const msisdn =MSISDN && MSISDN.textContent.trim();
      const names = Names && Names.textContent.trim()+'='+(kNames && kNames.textContent.trim());

      if(!msisdn && !names){
        setStatus('No msisdn or names found', true);
        return;
      }

      chrome.storage.local.get(['comment'],async(resultx)=>{
        if(!resultx.comment){
          console.log('failed to get reject reason....');
          return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        setStatus('Sending to server...');
  
        try{
          const payload = { msisdn,rejectReason:resultx.comment,names,type:'swap'};
  
          const res = await fetch(`http://${serverAddr}/admin/add-forgery-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
  
          if(!res.ok){
            const text = await res.text().catch(()=>res.statusText || 'error');
            throw new Error('Server: ' + (text || res.status));
          }
  
          const result = await res.json().catch(()=>({ok:true}));
  
          setStatus('Saved successfully ✔');
          // refresh the total saved count
          await fetchSavedCount();
  
        }catch(err){
          console.error('Save failed', err);
          setStatus('Save failed: ' + (err.message||err), true);
        }finally{
          saveBtn.disabled = false;
          saveBtn.textContent = '💾 Save case to memory';
        }
      });

      
    } 



   // Helper: show a short status
   function setStatus(text, isError){
    saveStatus.textContent = text;
    saveStatus.style.color = isError ? '#ef4444' : '';
  }

















    phoneInput.addEventListener('change',(e)=>{
      console.log('Phone number input detected...');
      if(e.target.value<10 || e.target.value<9) return;
      if(/^\d+$/.test(e.target.value)==false){
        alert('Invalid input');
        return;
      }

        set_new_digits(e.target.value);
    });

    copyBtn1.addEventListener('click',()=>{
        copyBtn1.textContent='copied';
        saveToClipBoard(phoneInput.value);

        setTimeout(()=>{
            const txtNode=document.createElement(`   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <rect x="2" y="2" width="13" height="13" rx="2" ry="2"></rect>
            </svg>`)

            copyBtn1.appendChild(txtNode);
            copyBtn1.textContent=txtNode;
        },200);
    });

    modeBtn.addEventListener('click',()=>{
        window.location.href=chrome.runtime.getURL('pages/modes.html');
    });
    

    copyBtn2.addEventListener('click',()=>{
        copyBtn2.textContent='copied';
        saveToClipBoard(MSISDN.innerText);

        setTimeout(()=>{
            const txtNode=document.createElement(`   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <rect x="2" y="2" width="13" height="13" rx="2" ry="2"></rect>
            </svg>`)

            copyBtn2.appendChild(txtNode);
            copyBtn2.textContent=txtNode;
        },200);
    });


    copyBtn3.addEventListener('click',()=>{
        copyBtn3.textContent='copied';
        saveToClipBoard(Names.innerText);

        setTimeout(()=>{
            const txtNode=document.createElement(`   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <rect x="2" y="2" width="13" height="13" rx="2" ry="2"></rect>
            </svg>`)

            copyBtn3.appendChild(txtNode);
          //  copyBtn3.textContent=txtNode;
        },200);
    });


    copyBtn4.addEventListener('click',()=>{
      copyBtn4.textContent='copied';
      saveToClipBoard(kNames.innerText);

      setTimeout(()=>{
          const txtNode=document.createElement(`   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <rect x="2" y="2" width="13" height="13" rx="2" ry="2"></rect>
          </svg>`)

          copyBtn3.appendChild(txtNode);
        //  copyBtn3.textContent=txtNode;
      },200);
  });







    //remaining days
    chrome.storage.local.get(['remainingDays'],(result)=>{
        if(!result.remainingDays){
            console.log('failed to get days...using default');
            return remainingDays.textContent=0;
        }


     return   remainingDays.textContent=result.remainingDays;
    });


    //current mode
    chrome.storage.local.get(['mode'],(result)=>{
        if(!result.mode){
            console.log('failed to get mode...please abort');
            caseMode.textContent='swap';
            return;
        }

     return   caseMode.textContent=result.mode=='kyc-mode'?'kyc':'swap';
    });

        //global number
    chrome.storage.local.get(['digits'],(result)=>{
          if(!result.digits){
              console.log('failed to get digits...');
              return;
          }
  
       return   phoneInput.value=result.digits;
      });


    //token status
    chrome.storage.local.get(['status'],(result)=>{
        if(!result.status){
            console.log('failed to get status...using default');
            tokenStatus.style.color='red';
            return tokenStatus.textContent='pending';
        }

        if(result.status=='pending') tokenStatus.style.color='red';

     return   tokenStatus.textContent=result.status;
    });


    /*this interval continously scans for new data or new case and extracts 
    the required fieds and renders them to the user.This file is solely for
    rendering the data being executed on the ui*/
        setInterval(()=>{
           // imgCount=mode=='swap' ? 4 :2;

            //getting msisdn
            chrome.storage.local.get(['msisdn'],(result)=>{
                if(!result.msisdn){
                    console.log('failed to get number...using default');
                MSISDN.textContent='75*********';
                    return;
                }

             return   MSISDN.textContent=result.msisdn;
            });



//client names
            chrome.storage.local.get(['names'],(result)=>{
                if(!result.names){
                    console.log('failed to get names...using default');
                    Names.textContent='client names';
                    return;
                }

             return   Names.textContent=result.names;
            });


            chrome.storage.local.get(['knames'],(result)=>{
              if(!result.knames){
                  console.log('failed to get names in kyc...');
                  kNames.textContent='not found';
                  return;
              }

           return   kNames.textContent=result.knames;
          });


//reject reason
chrome.storage.local.get(['message'],(result)=>{
    if(!result.message){
        console.log('failed to get reject reason...using default');
        rejectReason.textContent='reason here';
        return;
    }

    const lastReason=result.message.split(',');
    const reason=lastReason[lastReason.length-1];

 return   rejectReason.textContent=reason;
});



chrome.storage.local.get(['processing'],(result)=>{
    if(!result.processing || result.processing==false){
        return;
    }

   // rePaintLoadBanner();
});



//clock values
chrome.storage.local.get(['currentTime'],(result)=>{
    if(!result.currentTime){
        console.log('failed to get time...');
        return;
    }

// return   clockEl.textContent=result.currentTime;
});



//getting images toDataURLs
chrome.storage.local.get(['imagesToRender'],(result)=>{
    if(!result.imagesToRender){
        console.log('failed to get images...');
        return;
    }

    const imgLen=result.imagesToRender.length;
    console.log('Images length:',imgLen);

    customersContainer.classList.add('loading');
    loadingDots.style.display = 'flex';
    // clear existing customer elements if any
    customersContainer.querySelectorAll('.customer-card').forEach(n => n.remove());

    if(!imgLen>0){
        updateUI_with_statusCard(imgLen);
    }
    else{
        loadingDots.style.display = 'none';
        customersContainer.classList.remove('loading');
  
        console.log('Blobs:',result.imagesToRender);

        //rendering the array of images 
        result.imagesToRender.forEach(c => {

          const card = document.createElement('div');
            card.className = 'customer-card';
            
            const img = document.createElement('img');
            img.src = c;
            img.alt = 'image';
            
            card.appendChild(img);
            customersContainer.appendChild(card);     
        });
    }
 
});





        },500);









//----------------------method definitions-----------------
// Show loading dots first then render customer cards
function renderCustomersWithLoading(){
    customersContainer.classList.add('loading');
    loadingDots.style.display = 'flex';
    // clear existing customer elements if any
    customersContainer.querySelectorAll('.customer-card').forEach(n => n.remove());

    // Simulate a fetch delay for observed clients (500-900ms)
    setTimeout(async() => {
      loadingDots.style.display = 'none';

      const kyc_data=await network.get_kyc_data();
      customersContainer.classList.remove('loading');

      //scanning each client 
      kyc_data.forEach(c => {
//for evry client,we extract the deatils and compare
        let client_case=c;

        //if we successfully identify it using only these,we dont proceed to image comparison actually
        if(client_case.name==Names.value || client_case.msisdn==MSISDN.value ){
            
        }

        const card = document.createElement('div');
        card.className = 'customer-card';
        card.innerHTML = `
          <img src="${c.customerImage}" alt="${c.name}">
          <div class="name">${escapeHtml(c.name)}</div>
          <div class="phone">${escapeHtml(c.phone)}</div>
          <div class="case-id" style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:4px">ID: ${escapeHtml(c.id)}</div>
        `;
        customersContainer.appendChild(card);
      });
    }, 700);
  }
  
async function  rePaintLoadBanner() {
    document.querySelector('.reading-widget').addEventListener('click', () => {
        // reset visuals
        readingText.classList.remove('result-found','result-notfound');
        spinner.style.display = 'block';
        readingText.textContent = 'reading memory';
        // remove prior highlights
        document.querySelectorAll('.customer-card').forEach(c => {
          c.style.border = '1px solid rgba(255,255,255,0.03)';
          const extra = c.querySelector('div[style*="case:"]');
          // remove small appended nodes by matching textContent
          Array.from(c.children).forEach(ch => { if (ch.textContent && ch.textContent.startsWith('case:')) ch.remove(); });
        });
        // re-run
        startReadingMemory();
      });
}

async function updateUI_with_statusCard(images_length){
    // show spinner and text (already visible)
    readingText.textContent = 'processing case...';
    spinner.style.display = 'block';

    try {

      // stop spinner
      spinner.style.display = 'none';

      if (images_length>length) {
        readingText.textContent = 'case found';
        readingText.classList.add('result-found');
        readingText.classList.remove('result-notfound');

       readingWidget.classList.add('reading-widget-2');
       readingText.classList.add('reading-text2');

       
      } else {
        readingText.textContent = 'no case found';
        readingText.classList.add('result-notfound');
        readingText.classList.remove('result-found');

        readingWidget.classList.add('reading-widget-3');
        readingText.classList.add('reading-text2');
      }
    } catch (err) {
      console.error(err);
      spinner.style.display = 'none';
      readingText.textContent = 'error';
      readingText.classList.add('result-notfound');
    }
  }

  set_new_digits=async (number)=>{
    console.log('adding new number...');
   
      try {
             const response = await fetch(`http://${serverAddr}/admin/set-new-number`, {
                 method: 'POST',
                 headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({newDigits:number})
             });
             const data = await response.json();   
           console.log('Created:', data);
           return true;
         } catch (error) {
             return console.error('Error:', error);
         }
           
     }

  function updateClock(){
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ss = String(now.getSeconds()).padStart(2,'0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }
  updateClock();
  const clockTimer = setInterval(updateClock, 1000);











  

}





