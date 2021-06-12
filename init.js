//import example from './src/example.js';


//module.require('.src/example.js');

( function () {
    //  function fnAddScript() {
    //     var url = "./src/example.js";
    //     var script = document.createElement("script");
    //     script.src = url;
    //     script.type = "module";
    //     document.head.appendChild(script);
    //  }
     function fnAddButtons() {
         
         var btn = document.createElement("input");
         btn.value = "Connect Magic Band";
         btn.id = "connect-bluetooth";
         btn.type = "submit";
         document.querySelector(".div1").appendChild(btn);
     }
     function fnDefineEvents () {
         document.getElementById("connect-bluetooth")
         .addEventListener("click", function(event) {
             //alert("Bluetooth Event Fired");
             document.getElementById("result").innerHTML = 'Bluetooth Event Fired';
             //addExampleButtons();
             f3();
         })
     }

     //fnAddScript();
     fnAddButtons();
     fnDefineEvents();
 })();