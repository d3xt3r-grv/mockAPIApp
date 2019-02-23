

let token=JSON.parse(localStorage.getItem('token'));
$(function(){
 const $form = $('#events');
 //reset form
 function resetForm(){
     $form[0].reset();
     $form.find('.hold_items').html('');
 }

 let $item = $('.item').detach();

 //add rules and coordinators
 const $cor_container = $('#items .hold_items');
 $('#add_item').on('click',function(e){
     e.preventDefault();
     e.stopPropagation();
     let $newItem = $item.clone();

     $newItem.find('.close_modal').on('click',function(e){
         $(this).parent().remove();
     })
     $cor_container.prepend($newItem);
 });



})





// let token=JSON.parse(localStorage.getItem('jwtToken'));
$(function(){
 const $form1 = $('#events1');
 //reset form
 function resetForm1(){
     $form1[0].reset();
     $form1.find('.hold_items1').html('');
 }
 let $item1 = $('.item1').detach();

 //add rules and coordinators
 const $cor_container = $('#items1 .hold_items1');
 $('#add_item1').on('click',function(e){
     e.preventDefault();
     e.stopPropagation();
     let $newItem1 = $item1.clone();
     $newItem1.find('.close_modal').on('click',function(e){
         $(this).parent().remove();
     })
     $cor_container.prepend($newItem1);

 });

 //handle submit construct json object
 // let project= $('#project').val();
 // let path= $('#path').val();
 // let radioCheck=$("input[name='optradio']:checked").val();
 // let txtString=$("#txtArea").val();
 // if(project!=null && path !=null && radioCheck!=null && txtString!="")
 // {
 $("#submitForm").on('click',function(e){
     e.preventDefault();
     e.stopPropagation();
     let jsonForm = {

         items:[],
         items1:[],

     };
     func();
     function func(){
         const $form = $('#events');
         jsonForm.items = [];
         $form.find('.item').each(function(){
             let key = $(this).find('.item_name').val();
             let value = $(this).find('.item_price').val();
             // price=Number(price);
             // let subCategory=$(this).find('.item_sub_category').val();
             jsonForm.items.push({key:key,value:value});
         })
         func2();
     }
     function func2()
     {
         console.log(1);
         const $form1 = $('#items1');
         jsonForm.items1 = [];
         $form1.find('.item1').each(function(){
             let key = $(this).find('.item1_name').val();
             let value = $(this).find('.item1_price').val();
             // price=Number(price);
             // let subCategory=$(this).find('.item_sub_category').val();
             jsonForm.items1.push({key:key,value:value});
         })
     }

     console.log(jsonForm);
     let arr=jsonForm.items1;
     // console.log(arr);
     let header={};
     for(let i=0;i<arr.length;i++)
     {
         let z=i+1;
        let x="key"+z.toString();
        let y="value"+z.toString();
        // header[x]=arr[i].key;
        // header[y]=arr[i].value;
        header[arr[i].key]=arr[i].value;

     }


     let project= $('#project').val();
     let path= $('#path').val();
     let radioCheck=$("input[name='optradio']:checked").val();
     let txtString=$("#txtArea").val();
     let radioCheck2=$("input[name='optradio2']:checked").val();
     console.log(radioCheck2);
     // let msgBox={key1:txtString};
     let msgBox=txtString;
     if(radioCheck2=='JSON')
     {
        msgBox=JSON.parse(msgBox);
     }
     console.log(msgBox);
     // msgBox[key1]=txtString;
     let jsonToSend={

      };
     if(radioCheck=="GET" || radioCheck=="DELETE")
     {
         let params={};
         let arr=jsonForm.items;
         for(let i=0;i<arr.length;i++)
        {
            let z=i+1;
            let x="key"+z.toString();
            let y="value"+z.toString();
            // params[x]=arr[i].key;
            // params[y]=arr[i].value;
            params[arr[i].key]=arr[i].value;

         }
         jsonToSend={
             project:project,
             type:radioCheck,
             route:path,
             headers:header,
             params:params,
             response:msgBox,

        };
     }
     else if(radioCheck=="POST" || radioCheck=="PUT")
     {
         let body={};
         let arr=jsonForm.items;
         for(let i=0;i<arr.length;i++)
        {
            let z=i+1;
            let x="key"+z.toString();
            let y="value"+z.toString();
            // body[x]=arr[i].key;
            // body[y]=arr[i].value;
            body[arr[i].key]=arr[i].value;

         }
         jsonToSend={
             project:project,
             type:radioCheck,
             route:path,
             headers:header,
             body:body,
             response:msgBox,

        };
     }



     console.log(jsonToSend);
    // let token=JSON.parse(localStorage.getItem('jwtToken'));
	let baseURL='https://us-central1-mockapiserver.cloudfunctions.net/api/serve';
	console.log(token);
	if(token==null|| token==undefined)
	{
		alert('please login!');
		window.location.href="./index.html"
	}
     $.ajax({

        url: "https://us-central1-mockapiserver.cloudfunctions.net/api/addAPI",
        type: "POST",
        data: jsonToSend,
        headers:{
	                     'Content-Type': "application/x-www-form-urlencoded",
                     'Authorization': token
                 },
        success: function(result, status) {

            console.log("query baji");
            if(status === 'success') {

                console.log(result);
                if(result.success === true) {
                    alert('Copy the following Api link: '+baseURL+"/"+localStorage.getItem('sub')+"/"+project.replace(/\ /g,"")+"/"+path.replace(/\ /g,""));

                    location.reload(true);
                }
				else{
					alert(result.message);
				}
            }
            else {

                console.log("error occured while requesting");
            }

        }
    })

 });


})
