var base_url = $('#base_url').val();
var cur = $('#currency').val();
$(document).ready(function() { 

    $(".select2").select2();

	if ($($('#date')).length) {
		$('#date').flatpickr({
			minDate: "today",             
			dateFormat: "Y-m-d",                
		});
	}

    var proQty = $('.pro-qty');		
	var price = $('#ticket_price').val(); 
    var tax_total = $('#tax_total').val(); 
	
    var total = 0;
	proQty.on('click', '.qtybtn', function () {
		var $button = $(this);
		var currency_code = $('#currency_code').val();
		var tpo = parseInt($('#tpo').val());
		var available = parseInt($('#available').val()); 
		var oldValue = $button.parent().find('input').val();
		if ($button.hasClass('inc')) {		
			if(oldValue < tpo && oldValue < available){	
				var newVal = parseFloat(oldValue) + 1;
			}
			else{
				newVal = oldValue;
			}
		} else {
			if (oldValue > 1) {
				var newVal = parseFloat(oldValue) - 1;
			} else {
				newVal = 1;
			}
		}
		$button.parent().find('input').val(newVal);
		$('.event-middle .qty').html(newVal);
		total =parseInt(parseInt(newVal* price) + parseInt(tax_total));	
		$('.event-total .total').html(cur+ total);
		$('#payment').val(total);
		if(currency_code == 'USD' || $currency_code == 'EUR')
		{
			total = total * 100;
		}
		$('#stripe_payment').val(total);
		if($('input[name=payment_type]').val()=="STRIPE")
		{
			var pay = $('#stripe_payment').val();
			$('#form_submit').hide();
			$('.stripe-form-section').show();
			$('.stripe-form').show();
			$('.stripe-form').html('<script src="https://checkout.stripe.com/checkout.js" class="btn-primary stripe-button" data-key= '+$("#stripePublicKey").val()+' data-amount='+pay+' data-name="abc" data-description="nothing" data-image = "https://stripe.com/img/documentation/checkout/marketplace.png" data-locale="auto" data-currency='+currency_code+' ></script>');
		}
	});


	$(".btn-bio").click(function(){		
		$('.bio-control').show(1000);		
	});

	$(".bio-control").focusout(function(){		
		var bio = this.value;
		$.ajax({ 
			headers: {
				'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
			},       
			type:"POST",
			url:base_url+'/add-bio',
			data:{
				bio:bio,			
			},
			success: function(result){
			  if(result.success==true){			
				$('.bio-section').html('<p class="detail-bio">'+bio+'</p>');
			  }			   
			},
			error: function(err){
			  console.log('err ',err)
			}
		});
	});
	
	$('#OpenImgUpload').click(function(){
		$('#imgUpload').trigger('click'); 
	});
	$("#imgUpload").change(function() {
		readURL(this);
	});

	
	$(".event-data").click(function(){
		$('.event-data').removeClass('active');
		$(this).addClass('active');
		var id= $(this).attr('id').split('-')[1];
		$.ajax({      
			type:"GET",
			url:base_url+'/getOrder/'+id,
			success: function(result){				
				if(result.success==true){
					if(result.data.event.type=="online"){	var type = "Online Event";	}
					else{ var type = result.data.event.address;	}				
					if(result.data.order_status=="Pending"){
						var status = 'badge-warning';
					}
					else if(result.data.order_status=="Complete"){
						var status = 'badge-success';
					}
					else if(result.data.order_status=="Cancel"){
						var status = 'badge-danger';
					}
					if(result.data.payment_status==1){
						var payment_status_class = 'badge-success';
						var payment_status = 'Paid';
					}
					if(result.data.payment_status==0){
						var payment_status_class = 'badge-warning';
						var payment_status = 'Waiting';
					}
					if(result.data.review==null && result.data.order_status =="Complete" || result.data.order_status =="Cancel"){
						var review_content = '<div><button class="btn open-addReview"  data-toggle="modal" data-id="'+result.data.id+'" data-order="'+result.data.order_id+'"  data-target="#reviewModel"><i class="fa fa-star"></i></button><p>Review</p></div>';											
					}
					else{											
						var review_content ='';							
					}
					if(result.data.review!=null){
						var review_content ='';
					}
					var rating = result.data.review!=null?'<div class="rating order-rate"></div>':''						
					
					var payment_token  = result.data.payment_token==null?'-':result.data.payment_token;

					$('.single-order').html('<div class="single-order-top"></div><div class="order-bottom"></div>')
					$('.single-order-top').append('<p class="text-light mb-0">'+result.data.order_id+'</p><h2>'
					+result.data.time+'</h2><span class="badge '+status+'">'+result.data.order_status+'</span>'
					+rating+'<div class="row mt-2"><div class="col-lg-2"><img class="w-100" src="'+base_url+'/images/upload/'+result.data.event.image+'">\
					</div><div class="col-5"><h6 class="mb-0">'
					+result.data.event.name+'</h6><p class="mb-0">By: '+result.data.organization.first_name+' '+result.data.organization.last_name+
					'</p><p class="mb-0">'+result.data.start_time+' to </p><p class="mb-0">'+result.data.end_time+'</p><p class="mb-0">'
					+type+'</p></div><div class="col-5 "> <div class="right-data text-center"><div><button class="btn" onclick="viewPayment()"><i class="fa fa-credit-card"></i></button><p>Payment</p></div>'+review_content+'<div>\
					<a class="btn" target="_blank" href="'+base_url+'/order-invoice-print/'+result.data.id+'"><i class="fa fa-print"></i></a><p>Print</p></div> </div><div class="payment-data hide" ><p class="mb-0"><span>Payment Method : </span>'+result.data.payment_type+'</p><p class="mb-1"><span>Payment Token : </span>'+payment_token+'</p><span class="badge '+payment_status_class+'">'+payment_status+'</span></div></div></div>');

					if(result.data.ticket.type=="free"){
						$('.order-bottom').append('<div class="order-ticket-detail mb-4"><div><p>'+result.data.ticket.name+'</p></div><div> '+result.data.quantity+' tickets</div></div><div class="order-total"> <p>Ticket Price</p><p> FREE</p></div><div class="order-total"> <p>Coupon discount</p><p> 0.00</p></div><div class="order-total"><p>Tax</p><p> 0.00</p></div><div class="order-total"> <h6>Total</h6><h6>FREE</h6></div>');
					}
					else{
						$('.order-bottom').append('<div class="order-ticket-detail mb-4"><div><p>'+result.data.ticket.name+'</p></div><div> '+result.data.quantity+' * '+result.data.ticket.price+'</div></div><div class="order-total"> <p>Ticket Price</p><p> '+(result.data.ticket.price*result.data.quantity)+'</p></div><div class="order-total"> <p>Coupon discount</p><p>(-) '+result.data.coupon_discount+'</p></div><div class="order-total"><p>Tax</p><p>(+) '+result.data.tax+'</p></div><div class="order-total"> <h6>Total</h6><h6>'+result.data.payment+'</h6></div>');
					}	
					if(result.data.review!=null){					
						for ( i = 1; i <= 5; i++) {							
							var active = result.data.review.rate >= i?'active':'';
							$('.single-order-top .order-rate').append('<i class="fa fa-star '+active+' mr-1"></i>');							
						}	
					}				
			  	}      
			},
			error: function(err){
			  console.log('err ',err)
			}
		});
	});
	
	$(".chip-button").click(function(){
		var type = $(this).attr('id').split('-')[0];
		var id = $(this).attr('id').split('-')[1];			
		window.location.replace(base_url+'/all-events');           
	});	

	$("#duration").change(function(){	
		if(this.value=="date"){			
			$('.date-section').removeClass('hide');
			$('.date-section').addClass('show');
		}
	});	
		
	$(document).on("click", ".open-addReview", function () {
		var id = $(this).data('id');		
		var myBookId = $(this).data('order');
		$(".modal-body #order_id").val( id );
		$('#exampleModalLongTitle').html('Add Review to '+myBookId );
		
   });
	
	
	$(".payments input[type=radio][name=payment_type] ").change(function(){	
		$('#paypal-button-container').html(''); 
		$('.paypal-button-section').hide();
		if(this.value=="STRIPE"){	

			var pay = $('#stripe_payment').val();
			var cur_code = $('#currency_code').val();		

			$('#form_submit').hide();           

            $('.stripe-form-section').show();

            $('.stripe-form').show();

			$('.stripe-form').html('<script src="https://checkout.stripe.com/checkout.js" class="btn-primary stripe-button" data-key= '+$("#stripePublicKey").val()+' data-amount='+pay+' data-name="abc" data-description="nothing" data-image = "https://stripe.com/img/documentation/checkout/marketplace.png" data-locale="auto" data-currency='+cur_code+' ></script>');
		}
		else if(this.value=="PAYPAL"){
			$('#form_submit').attr('disabled', true);
			paypal_sdk.Buttons({
                createOrder: function(data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: $('#payment').val()
                            }
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {                         
                        $('#payment_token').val(details.id);
                        $('#form_submit').attr('disabled', false);
                    });
                }
              }).render('#paypal-button-container');

              $('.paypal-button-section').show(500);
		}
		else if(this.value=="RAZOR"){
			$('#form_submit').attr('disabled', true);			
            var options = {
                key: $('#razor_key').val(),
                amount: $('#payment').val()*100,
                name: 'CodesCompanion',
                description: 'test',
                image: 'https://i.imgur.com/n5tjHFD.png',
                handler: demoSuccessHandler
            }
            window.r = new Razorpay(options);        
            r.open();
		}
	});	

	$('#imageUploadForm').submit(function(e) {
		e.preventDefault();
		let formData = new FormData(this);		 
		$.ajax({
			headers: {
				'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
			}, 
		   type:'POST',
		   url: base_url+'/upload-profile-image',
			data: formData,
			contentType: false,
			processData: false,
			success: function(result){
			  if (result) {				
				$('#profileDropdown .header-profile-img').attr('src',base_url+'/images/upload/'+result.data);				
			  }
			},
			error: function(err){
			   	console.log(err);			   	
			}
		});
   });

});



function addFavorite(id,type){		
	$.ajax({      
        type:"GET",
        url:base_url+'/add-favorite/'+id+'/'+type,
        success: function(result){
		  if(result.success==true){
			Swal.fire({
                icon: 'success',                
                text: result.msg
            })
			setTimeout(() => {
				window.location.reload();
			}, 800);
		  }      
        },
        error: function(err){
          console.log('err ',err)
        }
    });
}
function demoSuccessHandler(transaction) {	
	$('#payment_token').val(transaction.razorpay_payment_id)
	$('#form_submit').attr('disabled', false);
}

function viewPayment(){	
	$('.payment-data').slideToggle();
}

function addRate(id){
    $('.rating i').css('color','#d2d2d2');
    $('#reviewModel input[name="rate"]').val(id);
    for (let i = 1; i <= id; i++) {
      $('.rating #rate-'+i).css('color','#fec009');
    }
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#imagePreview').attr('src', e.target.result );          
        }
        reader.readAsDataURL(input.files[0]);
    }
	$("#imageUploadForm").submit();
}

function follow(id){	
	$.ajax({      
        type:"GET",
        url:base_url+'/add-followList/'+id,
        success: function(result){
		  if(result.success==true){
			Swal.fire({
                icon: 'success',                
                text: result.msg
            })
			setTimeout(() => {
				window.location.reload();
			}, 800);
		  }      
        },
        error: function(err){
          console.log('err ',err)
        }
    });
}