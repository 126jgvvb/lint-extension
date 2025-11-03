console.log('Page injection successfull...');
let serverAddr="";
let isTabActive=true;
let resendReq=false;
let reached_last_item=false;
let currentTabId="";

// Get the internal extension URL
const configUrl = chrome.runtime.getURL('dist/config.json');
// Fetch and read the JSON
fetch(configUrl)
  .then(response => response.json())
  .then(config => {
            serverAddr = config.SERVER_URL;
    console.log('Server address:', serverAddr);
  })
  .catch(err => console.error('Error loading config:', err));


chrome.runtime.onMessage.addListener((msg,sender,sendResponse) => {
  if(currentTabId==""){
    currentTabId=msg.tabId;
  }
  else if(currentTabId!=msg.tabId) {
console.log('This message is not for this gae....aborting');
return;
  }

    if (msg.type === 'SHOW_NOTIFICATION') {
      
      if(msg.text.split('|')[0]=='unknown_case'){
            showSimpleNotification();
      }
      else if(msg.text.split('|')[1]=='no_case'){
        showNoCaseNotification();
      }
      else if(msg.text.split('|')[0]==null){
        return;
      }
      else{ showNotification(msg.text); }
      sendResponse({ status: "ok" });
    }
  });


//--------------------network object---------------------
let reqLock=false;

class networkObj{

    get_kyc_data=async ()=>{
       try {
            const response = await fetch(`http://${serverAddr}/admin/get-kyc-data`);
            const data = await response.json();
            console.log(data); // handle your data here
            return data.data;
        } catch (error) {
            console.error('Error:', error);
        }
      
    }

    get_digits=async ()=>{
      try {
           const response = await fetch(`http://${serverAddr}/admin/get-number-to-read`);
           const data = await response.json();
           console.log(data); // handle your data here
           return data.data;
       } catch (error) {
           console.error('Error:', error);
       }
     
   }

    get_swap_data=async ()=>{
       try {
            const response = await fetch(`http://${serverAddr}/admin/get-swap-data`);
            const data = await response.json();
            console.log(data); // handle your data here
            return data.data;
        } catch (error) {
            console.error('Error:', error);
        }
    }


    update_case=async (obj,button,handler)=>{
        if(reqLock){
            console.log('captured multiples calls...');
            return;
        }

        reqLock=true;
        console.log(`${JSON.stringify(obj)}`);

       try {
            const response = await fetch(`http://${serverAddr}/admin/update-case-property`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            });
            if(!response.ok){
              console.log('Retrying submission using the right method...');
              resendReq=true;
            }

            const data = await response.json();
            button.removeEventListener('click',handler);
            setTimeout(()=>{
                reqLock=false;
            },500);

          console.log('Created:', data);
       return true;
        } catch (error) {
            return console.error('Error:', error);
        }
          
    }


    add_new_case=async (obj,button,handler)=>{
      if(reqLock){
        console.log('captured multiples calls...');
        return;
    }

    console.log('adding new case request...');
    reqLock=true;
   
      try {
             const response = await fetch(`http://${serverAddr}/admin/add-forgery-item`, {
                 method: 'POST',
               //  headers: { 'Content-Type': 'application/json' },
                 body: obj
             });
             const data = await response.json();
             setTimeout(()=>{
              reqLock=false;
          },500);
           button.removeEventListener('click',handler);
           console.log('Created:', data);
           return true;
         } catch (error) {
             return console.error('Error:', error);
         }
           
     }


     set_new_digits=async (number)=>{
    console.log('adding new number...');
   
      try {
             const response = await fetch(`http://${serverAddr}/admin/set-new-number`, {
                 method: 'POST',
               //  headers: { 'Content-Type': 'application/json' },
                 body: {newDigits:number}
             });
             const data = await response.json();   
           console.log('Created:', data);
           return true;
         } catch (error) {
             return console.error('Error:', error);
         }
           
     }

    delete_case=async (obj)=>{
      if(reqLock){
        console.log('captured multiples calls...');
        return;
    }

    reqLock=true;

        console.log(`${JSON.stringify(obj)}`);

        try {
             const response = await fetch(`http://${serverAddr}/admin/delete-case-data`, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json'
                 },
                 body: JSON.stringify(obj)
             });
             const data = await response.json();
             setTimeout(()=>{
              reqLock=false;
          },500);
             return console.log('Created:', data);
         } catch (error) {
             return console.error('Error:', error);
         }
           
     }

  }





//page element references

/*-------------for swap-----------------------
const swapMSISDN='#msisdn';
const swapNames='#names';
const swapFirstName='#first_name';
const swapSecName='#sec_name';
const swapLastName='#last_name';
const swapID='#img-1';
const swap_Customer_Img='#img-2';
const swap_kyc_id_Img='#img-1';
const swap_kyc_customer_img='#img-3';
*/

const swapMSISDN='[ng-bind="subscriberSimSwap.msisdn"]';
const swapNames='#names';
const swapFirstName='[ng-bind="subscriberSimSwap.simswapSubscriberDetailsDto[0].firstName"]';
const swapSecName='[ng-bind="subscriberSimSwap.simswapSubscriberDetailsDto[0].middleName"]';
const swapLastName='[ng-bind="subscriberSimSwap.simswapSubscriberDetailsDto[0].lastName"]';
const swapID='#img-1';
const swap_Customer_Img='#img-2';
const swap_kyc_id_Img='#img-1';
const swap_kyc_customer_img='#img-3';





//-------------for kyc-----------------------
const kyc_number='[ng-bind="subscriberkyc.msisdn"]';
const kyc_names='#names';
const kycFirstName='[ng-bind="subscriberKyc.firstName"]';
const kycLastName='[ng-bind="subscriberKyc.lastName"]';
const kyc_id_image='#img-2';
const kyc_customer_img='#img-3';

//for decrypting the token
const secret='my-spiral-andromeda-galaxy-2345678901223433543ijfhgirutg5454059954';
let mode=null;
let token="";
let currentNumberInput='';

const swapInterval=null;
const kycInterval=null;
let ceaseOperations=true;
let rejectMonitor=null;
let isAlreadyMonitoring=false;

const approveButton='[ng-if="currentAction==Approve"]';
const rejectButton='[ng-if="currentAction==REJECTED"]';
const rejectionSelector='[name="comment_reject"]';
let isListeningToRejections=false;


const netObj=new networkObj();
let lock=false;
let wasCaseApprovedOrRejected=false;
let currentCaseId="";
let objectUnderInspection=null;
let currentNetworkObjectVersion=null;
let listenerAdded=false;
let approve_listenerAdded=false;


//data collected
let matchFound=null;
let whatChanged=null;
let message=null;
let message_seen=null;
let matchedFeature=null;
      


const startRejectMonitoring=()=>{
if(isAlreadyMonitoring) return;

rejectMonitor=setInterval(()=>{
const rejectBtn=document.querySelector(rejectButton);
if(rejectBtn!=null){
    rejectBtn.addEventListener('click',()=>{
            const rejectComment=document.querySelector(rejectionSelector);
            if(rejectComment!=null){  //reject reason found??
                rejectComment=rejectComment.value;
            }

            //check if it already exuists in db
            chrome.storage.local.get(['matchFound'],(result)=>{
                if(!result.matchFound || result.matchFound==false){
                    console.log('failed to get a match,creating a new object...');
           
                    if(mode=='kyc-mode'){
                        const number=document.querySelector(kyc_number);
                        const names=document.querySelector(kyc_names);
                        const id=document.querySelector(kyc_id_image);
                        const customer_face=document.querySelector(kyc_customer_img);
                   
                        const newObject=new FormData();
                        newObject.append("names",names);
                        newObject.append("msisdn",number);
                        newObject.append("rejectReason",rejectComment);
                        newObject.append("type","kyc");
                        [id,customer_face].forEach((image)=>newObject.append("images",image));
                   
                        netObj.add_new_case(newObject);
                    }
                    else if(mode=='swap-mode'){
                        const number=document.querySelector(swapMSISDN);
                        const names=document.querySelector(swapNames);
                        const id=document.querySelector(swapID);
                        const id2=document.querySelector(swap_kyc_id_Img);
                        const customer_face_1=document.querySelector(swap_Customer_Img);
                        const customer_face_2=document.querySelector(swap_kyc_customer_img);
            
                        const newObject=new FormData();
                        newObject.append("names",names);
                        newObject.append("msisdn",number);
                        newObject.append("type","swap");
                        newObject.append("rejectReason",rejectComment);
                        [id,id2,customer_face_1,customer_face_2].forEach((image)=>newObject.append("images",image));
                   
                        netObj.add_new_case(newObject);
                    }
           
                }
                else{  //comaparing all fields to see where to update
                    const temp={
                        namesChanged:false,
                        msisdnChanged:false,
                        rejectReasonChanged:false,
                        imagesChanged:false
                    };

                    const analyzer=(names,number,image_array)=>{

                        const network_obj_names=currentNetworkObjectVersion.name.split(',');
                        const network_obj_numbers=currentNetworkObjectVersion.msisdn.split(',');
                        const network_obj_rejectReason=currentNetworkObjectVersion.rejectReason.split(',');
                        const network_obj_images=currentNetworkObjectVersion.images;
           
                            //scanning if this current name does not exist already and we add it
                            for(let i=0; i<network_obj_names.length; ++i){
                                if(network_obj_names.length-1==i && network_obj_names[i]!=names){
                                    temp.namesChanged=true;
                                }
                            }
    
                            for(let i=0; i<network_obj_rejectReason.length; ++i){
                                if(network_obj_rejectReason.length-1==i && network_obj_rejectReason[i]!=rejectComment){
                                    temp.rejectReasonChanged=true;
                                }
                            }
    
    
                            for(let i=0; i<network_obj_numbers.length; ++i){
                                if(network_obj_numbers.length-1==i && network_obj_numbers[i]!=number){
                                    temp.msisdnChanged=true;
                                }
                            }
    
                            //same for images..we have to rotate and comapre each of the images
                            let newImageDetected=false;
                            let newImages=[];
    
                           image_array.forEach((local_image)=>{
                                for(let i=0; i<network_obj_images.length; ++i){
                                   /* if at any point we find a match btn these two,we break..coz this means we already have it  */
                                    if(handleCompare(local_image,network_obj_images[i])){
                                        break;
                                    }
    
                                    //if we reach the end...and its also not a match,we save this new image
                                    else if(!handleCompare(local_image,network_obj_images[i]) && i==network_obj_images.length-1 ) {
                                        newImageDetected=true;
                                        newImages.push(local_image);
                                    }
                                }
                            });
    
                            if(newImages.length>0) { temp.imagesChanged=true; }
                           
                            const newObj=new FormData();
                            if(temp.namesChanged) newObj.append("names",names);
                            if(temp.msisdnChanged) newObj.append("msisdn",number);
                            if(temp.rejectReasonChanged) newObj.append("rejectReason",rejectComment);
                            if(temp.imagesChanged)
                                image_array.forEach((img)=>newObj.append("images",img));
    
                            netObj.update_case(newObj);
                    }

                    //detect mode first
                    if(mode=='swap'){
                        const {names,number,idIMG,customer_img,kyc_id,kyc_customer_img}=objectUnderInspection;
                        analyzer(names,number,[idIMG,customer_img,kyc_id,kyc_customer_img]);
                    }
                    else if(mode=='kyc'){
                      const  { names,number,idIMG,customerIMG}= objectUnderInspection;
                        analyzer(names,number,[idIMG,customerIMG]);
                    }

                }
            });

    });
}
},2000);
}

const monitorRejectReasons=()=>{
console.log('monitoring reject reason.......');

  const rejectComment=document.querySelector(rejectionSelector);
  if(rejectComment!=null){
    if(isListeningToRejections) return;

    rejectComment.addEventListener('change',(e)=>{
      const index=e.target.selectedIndex;
      const val=e.target.options[index];
      console.log(index,'..............reject reason obtained as...........',val.text);
      chrome.storage.local.set({comment:val.text});      
    })
  }
  else{
    isListeningToRejections=false;
  }

   
}

// Create the notification element
const showNotification = (message,duration = 22000) => {
      if(isTabActive==false) return;

        // Remove any existing notification
        const old = document.getElementById('xLinterNotification');
        if (old) old.remove();

        const finder=message.split('|')[1];
        const rejections=message.split('|')[0].split(',');
        message=rejections[rejections.length-1];
      
        const bannerStyle = document.createElement('style');
        bannerStyle.textContent = `
          #xLinterNotification {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 999999;
            width: 320px;
            padding: 18px;
            color: #fff;
            font-family: "Segoe UI", sans-serif;
            background: linear-gradient(135deg, rgb(0, 234, 255), rgb(0, 4, 255));
            border-radius: 14px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            backdrop-filter: blur(6px);
            border: 2px solid rgba(255,255,255,0.3);
            transform: translateX(-200%);
            opacity: 0;
            transition: all 0.6s ease;
            overflow: hidden;
          }
      
          #xLinterNotification.show {
            transform: translateX(0);
            opacity: 1;
          }
      
          #xLinterNotification h2 {
            font-size: 17px;
            font-weight: 700;
            text-shadow: 0 0 6px rgba(255,255,255,0.8);
            border-bottom: 1px solid rgba(255,255,255,0.3);
            padding-bottom: 8px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
      
          #xLinterNotification h2::before {
            content: "🔥";
            font-size: 18px;
            animation: pulseGlow 1.5s infinite alternate;
          }
      
          #xLinterNotification p {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 6px 0;
            font-size: 14px;
            opacity: 0;
            transform: translateX(-20px);
            animation: slideIn 0.6s forwards;
          }
      
          #xLinterNotification p:nth-child(3) { animation-delay: 0.6s; }
          #xLinterNotification p:nth-child(4) { animation-delay: 1.2s; }
          #xLinterNotification p:nth-child(5) { animation-delay: 1.8s; }
      
          #xLinterNotification .dot {
            width: 10px;
            height: 10px;
            border: 2px solid #fff;
            border-radius: 50%;
            animation: spinDot 1.2s ease-in-out;
          }
      
          #xLinterNotification .caution {
            margin-top: 14px;
            font-weight: bold;
            font-size: 13px;
            color: #ffcc00;
            text-align: center;
            text-shadow: 0 0 4px rgba(0,0,0,0.5);
            animation: fadeIn 2.4s ease-in-out forwards;
          }
      
          #xLinterNotification .close-btn {
            position: absolute;
            top: 8px;
            right: 10px;
            border: none;
            background: transparent;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            transition: transform 0.3s ease;
          }
      
          #xLinterNotification .close-btn:hover {
            transform: scale(1.2);
            color: #ff6b6b;
          }
      
          @keyframes pulseGlow {
            from { text-shadow: 0 0 5px rgba(255,255,255,0.4); }
            to { text-shadow: 0 0 15px rgba(255,255,255,0.9); }
          }
      
          @keyframes spinDot {
            0% { transform: rotate(0deg) scale(0.8); opacity: 0.5; }
            50% { transform: rotate(180deg) scale(1.2); opacity: 1; }
            100% { transform: rotate(360deg) scale(1); opacity: 1; }
          }
      
          @keyframes slideIn {
            from { transform: translateX(-25px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
      
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          #mess{
            color:red
          }

          .other-header{
          align-items:center;
          }

          .other-header p{
                    font-size:46px;
                    }

        .finder{
        color:yellow;
        font-size:18px;
        }
        `;
      
        document.head.appendChild(bannerStyle);
      
        const notif = document.createElement('div');
        notif.id = 'xLinterNotification';
      
        notif.innerHTML = `
          <button class="close-btn">&times;</button>
          <h2>This case was previously rejected with <em id="mess">"${message.trim()}"</em></h2>
          <div class="caution other-header" ><p>Other rejections</p></div>
        `;

        for(let elem of rejections){
            const dynamicPs=document.createElement("p");
            const span=document.createElement('span');
            span.classList.add('dot');
            dynamicPs.appendChild(span);

            const txt=document.createTextNode(`${elem}`);
            dynamicPs.appendChild(txt);
            notif.appendChild(dynamicPs);
        }

        const finderDiv=document.createElement('div');
        finderDiv.classList.add('finder');
        finderDiv.textContent=`Matched using:${finder}`;
        notif.appendChild(finderDiv);


        const lastDiv=document.createElement('div');
        lastDiv.classList.add('caution');
        lastDiv.textContent=`⚠️ Please go slow ⚠️`;
        notif.appendChild(lastDiv);
      
        document.body.appendChild(notif);
      
        // Slide in the entire banner
        setTimeout(() => notif.classList.add('show'), 100);
      
        // Close button action
        notif.querySelector(".close-btn").onclick = () => {
          notif.classList.remove("show");
          setTimeout(() => notif.remove(), 600);
        };
      
        // Auto remove after duration
        setTimeout(() => {
          notif.classList.remove("show");
          setTimeout(() => notif.remove(), 600);
        }, duration);
      };


      const showNoCaseNotification = (
        message = "⚠️ No case detected",
        duration = 10000
      ) => {
        if (isTabActive == false) return;
      
        // Remove any existing notification
        const old = document.getElementById("xLinterSimpleNotif");
        if (old) old.remove();
      
        const style = document.createElement("style");
        style.textContent = `
          #xLinterSimpleNotif {
            position: fixed;
            bottom: 25px;
            right: 25px;
            z-index: 999999;
            background: linear-gradient(135deg, #3a3a3a, #5a5a5a);
            color: #f5f5f5;
            font-family: "Segoe UI", sans-serif;
            font-size: 15px;
            font-weight: 600;
            padding: 14px 18px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            transform: translateY(150%);
            opacity: 0;
            transition: all 0.6s ease;
            animation: pulseGrey 2.5s infinite alternate;
            min-width: 260px;
            max-width: 100px;
          }
      
          #xLinterSimpleNotif.show {
            transform: translateY(0);
            opacity: 1;
          }
      
          #xLinterSimpleNotif .close-btn {
            background: transparent;
            border: none;
            color: #f5f5f5;
            font-size: 20px;
            cursor: pointer;
            line-height: 1;
            transition: transform 0.3s ease, color 0.3s ease;
          }
      
          #xLinterSimpleNotif .close-btn:hover {
            transform: scale(1.2);
            color: #ffeb3b;
          }
      
          @keyframes pulseGrey {
            0% { background: linear-gradient(135deg, #4b4b4b, #6d6d6d); }
            100% { background: linear-gradient(135deg, #2f2f2f, #4e4e4e); }
          }
        `;
        document.head.appendChild(style);
      
        const notif = document.createElement("div");
        notif.id = "xLinterSimpleNotif";
        notif.innerHTML = `
          <span>${message}</span>
          <button class="close-btn" title="Close">&times;</button>
        `;
      
        document.body.appendChild(notif);
      
        // Animate entry
        setTimeout(() => notif.classList.add("show"), 100);
      
        // Close button functionality
        notif.querySelector(".close-btn").onclick = () => {
          notif.classList.remove("show");
          setTimeout(() => notif.remove(), 600);
        };
      
        // Auto-remove after duration
        setTimeout(() => {
          notif.classList.remove("show");
          setTimeout(() => notif.remove(), 600);
        }, duration);
      };
      

const showSimpleNotification = (message = "This is a fresh one, be careful.", duration = 12000) => {
        if(isTabActive==false) return;
    
        // Remove any existing notification
        const old = document.getElementById('xLinterSimpleNotif');
        if (old) old.remove();
      
        const style = document.createElement('style');
        style.textContent = `
          #xLinterSimpleNotif {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 999999;
            background: linear-gradient(135deg, #00c853, #009624);
            color: white;
            font-family: "Segoe UI", sans-serif;
            font-size: 15px;
            font-weight: 600;
            padding: 14px 18px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            transform: translateX(-150%);
            opacity: 0;
            transition: all 0.6s ease;
            animation: pulseGreen 2s infinite alternate;
            min-width: 260px;
            max-width: 300px;
            max-height:50px;
          }
      
          #xLinterSimpleNotif.show {
            transform: translateX(0);
            opacity: 1;
          }
      
          #xLinterSimpleNotif .close-btn {
            background: transparent;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            line-height: 1;
            transition: transform 0.3s ease, color 0.3s ease;
          }
      
          #xLinterSimpleNotif .close-btn:hover {
            transform: scale(1.2);
            color: #ffeb3b;
          }
      
          @keyframes pulseGreen {
            0% { background: linear-gradient(135deg, #00e676, #00c853); }
            100% { background: linear-gradient(135deg, #00c853, #64dd17); }
          }
        `;
        document.head.appendChild(style);
      
        const notif = document.createElement('div');
        notif.id = 'xLinterSimpleNotif';
        notif.innerHTML = `
          <span>${message}</span>
          <button class="close-btn" title="Close">&times;</button>
        `;
      
        document.body.appendChild(notif);
      
        // Animate entry
        setTimeout(() => notif.classList.add('show'), 100);
      
        // Close button functionality
        notif.querySelector('.close-btn').onclick = () => {
          notif.classList.remove('show');
          setTimeout(() => notif.remove(), 600);
        };
      
        // Auto-remove after duration
        setTimeout(() => {
          notif.classList.remove('show');
          setTimeout(() => notif.remove(), 600);
        }, duration);
      };
      
      
      
const compareNumbers=(client_case,case_number,matchObserved)=>{
      console.log('checking numbers...');

        const msisdn_array=client_case.msisdn.split(',');
        for (let i = 0; i < msisdn_array.length; i++) {
            if(msisdn_array[i]==case_number){
                matchObserved=true;
                break;
            }
        }
        
        //if we successfully identify it using only these,we dont proceed to image comparison actually
        if(matchObserved){
          matchFound=true;
          whatChanged='number';
          message=client_case.rejectReason;
          message_seen=false;
          matchedFeature='phone number';
          
          /*
            chrome.storage.local.set({matchFound:true});
            chrome.storage.local.set({whatChanged:'number'});
                //sending message
                chrome.storage.local.set({message:client_case.rejectReason});
                chrome.storage.local.set({message_seen:false});
                chrome.storage.local.set({matchedFeature:"phone number"});
               //adding this object to a global scope for inspection
            
            */
               currentNetworkObjectVersion=client_case;
           return true;
        }

        return false;
      }
      

const compareNames=(client_case,case_names,matchObserved)=>{
//->name:'fistName|secName|lastName=fistName|secName|lastName=fistName|secName|lastName"
let names_array=client_case.name.split('=');
//names_array=names_array.join(','); 

for(let nf=0; nf<names_array.length; ++nf){
  namesCount=0;

  const n=names_array[nf].split('|');  //fistName|secName|lastName
  console.log('from network:',n);
  console.log("case names are:", case_names);

  for (let i = 0; i < n.length; i++) {
  const case_namesN=case_names.split('|');  //in the assignment below
   // break;

    for(nameN of case_namesN){
      if(n[i]==nameN){
         namesCount++;
        matchObserved=true;
        console.log(`********A Name match has been observed:<<${n[i]}:${nameN}*******\n count is:${namesCount}`);
      }
    else{
      matchObserved=false;  //making sure all the names match..or else we dont equate
    }
    }
}

if(namesCount>=2){  //if atkeast two names matched,break from checing the names from the kyc part
  console.log('breaking from loop comparing names from the kyc part..');
  matchObserved=true;
  break;
}
}

console.log('match count:'+namesCount,'<->match obtained:',matchObserved);

//if we successfully identify it using only these,we dont proceed to image comparison actually
if(matchObserved && namesCount>=2){
  matchFound=true;
  whatChanged='number';
  message=client_case.rejectReason;
  message_seen=false;
  matchedFeature='names';
       currentNetworkObjectVersion=client_case;
    return true;
}

return false;
 }
  


  

const decryptToken=(token)=>{
    console.log('decrypting token....');
    const stringifiedObj=atob(token);
    let str='';

    for(let i=0; i<stringifiedObj.length; ++i){
        str+=String.fromCharCode(stringifiedObj.charCodeAt(i)^secret.charCodeAt(i%secret.length));
    }

return JSON.parse(str);
}

const processCase=async(case_names,case_number,isKYC=true)=>{  
    const data_1=isKYC ? await netObj.get_kyc_data(): await netObj.get_swap_data();
    let obtainedImages=[];
    let object_id=null;

    const data=data_1;
    let currentIndex=0;
    let listenForUpdates=false;

    console.log('Data length:',data.length);

for(const c of data){
  currentIndex++;

console.log('current item number:',currentIndex);

  //for every client,we extract the deatils and compare
const client_case=c;
let namesCount=0;
let matchObserved=false;

object_id=client_case.id;
chrome.storage.local.set({processing:true});


matchObserved=compareNumbers(client_case,case_number,matchObserved);
if(matchObserved==false) console.log(`A match was not found using msisdn, proceeding to names`);
else{
  console.log('A match was found using phone number...');
  listenForUpdates=true;
}

if(!listenForUpdates){
  matchObserved=compareNames(client_case,case_names,matchObserved);
  if(matchObserved==false){
    console.log(`A match was not found using names, declining`);
    matchFound=null;
    matchedFeature=null;
  } 
  else{
    listenForUpdates=true;
  }
}

}

console.log(matchFound,'#########',matchedFeature);

if(matchFound!=null && matchedFeature!=null){
  chrome.storage.local.set({matchFound:matchFound});
  chrome.storage.local.set({whatChanged:whatChanged});
      //sending message
  chrome.storage.local.set({message:message});
  chrome.storage.local.set({message_seen:message_seen});
  chrome.storage.local.set({matchedFeature:matchedFeature});
  chrome.storage.local.set({tabId:currentTabId});
}
else{
  console.log('declining parameters....');
  chrome.storage.local.set({message:'unknown_case'});
  chrome.storage.local.set({message_seen:false});
  chrome.storage.local.set({matchedFeature:'unknown_case'});
  chrome.storage.local.set({tabId:currentTabId});
}



  }


  const trackToken=()=>{
    
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
        
        console.log(`Time laps: ${daysAfterConversion}/${remainingDays}`);

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
  }


  
  

//------------------scannning page continously----------------
chrome.storage.local.set({imagesAvailable:[]});
chrome.storage.local.set({names:""});
chrome.storage.local.set({msisdn:""});
chrome.storage.local.set({status:""});
chrome.storage.local.set({ceaseOperations:true});
//chrome.storage.local.set({token:""});
chrome.storage.local.set({remainingDays:0});
chrome.storage.local.set({rejectReason:""});






const analyzePage=async()=>{
  const numberN=await netObj.get_digits();
  if(numberN){
    chrome.storage.local.set({digits:numberN});
  }
  
  monitorRejectReasons();

    if(mode=='kyc-mode'){
               if(ceaseOperations==true) return;
               console.log('operating in kyc mode...');
       
          //     trackToken();
               const number=document.querySelector(kyc_number).value;
               const N1=document.querySelector(kycFirstName).value;
               const N2=document.querySelector(kycSecName).value;
               const N3=document.querySelector(kycLastName).value;
               let names=N1+"|"+N2+"|"+N3;
                names=names.toString();


       if(number!=undefined || number!=null){  //we use this coz an id is ssurely only visible on the dialog
           chrome.storage.local.set({processing:true});
           objectUnderInspection={names,number};
           processCase(names,number,true);
       }
       else{
        chrome.storage.local.set({matchedFeature:'no_case'});  
       }
       
       
       }
       
       else if(mode=='swap-mode'){
       if(ceaseOperations==true) return;
       
       console.log('operating in swap mode...');
         if(document.querySelector(swapMSISDN)==null){
          console.log('No-msisdn-field-found....');
          chrome.storage.local.set({matchedFeature:'no_case'});  
          chrome.storage.local.set({message:'no_case'}); 
        }
         else{
          console.log('&&&&&&&&&-msisdn-field-found....');
          const number=document.querySelector(swapMSISDN).textContent;
          const N1=document.querySelector(swapFirstName).textContent;
          const N2=document.querySelector(swapSecName).textContent;
          const N3=document.querySelector(swapLastName).textContent;
          const names=`${N1}|${N2}|${N3}`;

          const kN1=document.querySelector(kycFirstName).textContent;
          const kN3=document.querySelector(kycLastName).textContent;
          let knames=kN1+"|"+kN3;
           knames=knames.toString();


           console.log('number:::',number);
           console.log('names:::',names);
           console.log('kyc names::',knames);
      
          if(number!=null || number!=undefined){
              chrome.storage.local.set({processing:true});
              objectUnderInspection={names,number};
              chrome.storage.local.set({names:names});
              chrome.storage.local.set({knames:knames});
              chrome.storage.local.set({msisdn:number});
              processCase(names,number,false);
           }
         }
         
        
       }
}










//-------------------------interval to track environment variables-------------------------
setInterval(()=>{

    chrome.storage.local.get(['token'],(result)=>{
        if(!result.token){
            ceaseOperations=true;
            console.log('failed to get token...');
            chrome.storage.local.set({status:'pending'});
            chrome.storage.local.set({remainingDays:0});
            chrome.storage.local.set({ceaseOperations:true});
            chrome.storage.local.set({message:null});
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
    ceaseOperations=true;
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
        
        console.log(`Time laps: ${daysAfterConversion}/${remainingDays}`);

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
         console.log('Token validation successfull...');
        }

        chrome.storage.local.get(['mode'],(result)=>{
            if(!result.mode){
                console.log('failed to retrieve mode...');
                return;
            }
            
            console.log('mode retrieval successfull......');
            //loading token into memory
            mode=result.mode;

     //       chrome.storage.local.set({message:'unknown_case'});
            chrome.storage.local.set({message_seen:false});
            chrome.storage.local.set({matchedFeature:null});

            analyzePage();
            });

    
    });



},1000);


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


document.addEventListener('visibilitychange', () => {
    console.log("The document visibility has changed to:",document.visibilityState);
  isTabActive=document.visibilityState;
  });                     

//reseting the mode
window.addEventListener('unload',()=>{
    console.log('cleaning up extension');
    if(swapInterval){clearInterval(swapInterval);}
    if(kycInterval){clearInterval(kycInterval)}
    isAlreadyMonitoring=false;

chrome.storage.local.set({XextensionAlreadyRunning:false});
//chrome.storage.local.set({mode:false});
chrome.storage.local.set({message:undefined});
clearInterval(clockTimer);
});
