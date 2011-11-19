$(document).ready(function() {

	tour();
	
	sliders_enabled = false;
	
	$('.alfa_sign').slideto({
		target: '.dest',
		speed: 'slow'
	});
	
	

	
	$('a.pageslide').pageSlide({ width: "350px", direction: "left" });
					
	function toogle_sliders(force) {
		if (typeof force == "undefined"){
			if (sliders_enabled) {
				$("#blur_slider").slider({ disabled: true});
				$("#segmentation_slider").slider({ disabled: true});
			
				sliders_enabled = false;
			}else {
				$("#blur_slider").slider({ disabled: false});
				$("#segmentation_slider").slider({ disabled: false});
			
				sliders_enabled = true;
			}
		}else{
				$("#blur_slider").slider({ disabled: !force.to});
				$("#segmentation_slider").slider({ disabled: !force.to});
				sliders_enabled = force.to
		}
	}
	
	$(".logout_link").click( function() { FB.logout(); });
	
	$("#blur_slider").slider({
		disabled: true,
		min: 1,
		max: 10,
		change: function() {
			$.ajax({
				url: 'http://localhost:3000/process',
				type: 'POST',
				data: 'blur_slider='+$("#blur_slider").slider('value') +"&" + 'segmentation_slider='+$("#sementation_slider").slider('value') + '&authenticity_token='+encodeURIComponent(authenticity_token),
				beforeSend: function() { 
					$('.spinner').css({visibility: 'visible'})		
					toogle_sliders(); 				
					}, 

				success: function(data) { 
					$('#result_image').html(data); 
					toogle_sliders(); 
					$('.spinner').css({visibility: 'hidden'})
				}
			})
		},
		slide: function () {
			$('#blur_slider_value').html($("#blur_slider").slider('value'));

		}
	});
	
	$("#segmentation_slider").slider({
		disabled: true,
		min: 0,
		max: 20,
		change: function() {
			$.ajax({
				url: 'http://localhost:3000/process',
				type: 'POST',
				data: 'blur_slider='+$("#blur_slider").slider('value') +"&" + 'segmentation_slider='+$("#segmentation_slider").slider('value') + '&authenticity_token='+encodeURIComponent(authenticity_token),
				beforeSend: function() {
				$('.spinner').css({visibility: 'visible'})
					toogle_sliders(); 
					$("#result_image").animate({borderColor: 'yellow'}, "fast").animate({borderColor: '#DEDEDE'}, "fast");
				}, 
				success: function(data) { 
					$('#result_image').html(data); 
					toogle_sliders(); 
					$('.spinner').css({visibility: 'hidden'}) 
				}
			})
		},
		slide: function () {
			$('#segmentation_slider_value').html($("#segmentation_slider").slider('value'));

		}
	});
	
	$("#progress_bar").progressbar({
		value: 0, 
		create: function() { 
			$("#progress_bar").hide();
			}, 
		complete: function(event, ui) { 
			$("#progress_bar").fadeOut('slow'); 
			} 
	});

	function setup_drop_here_block() {
			$('.image').Jcrop();
			
			
		drop_here = document.getElementById('drop_here');
		
		drop_here.addEventListener("dragenter", do_nothing, false);
		drop_here.addEventListener("dragexit", out_drop_block, false);
		drop_here.addEventListener("dragover", over_drop_block, false);
		
		drop_here.addEventListener("drop", droped_something, false);
		
		$(".zoom_to").click(function(evt) {
							evt.stopPropagation();
							evt.preventDefault();

							$(this).zoomTo({debug:true});
		})
		
		$(window).click(function(evt) {
							evt.stopPropagation();
							$("body").zoomTo({targetsize:1.0});
		});
		

	}

	function set_border_color_normal() {
		$('#drop_here').css({'border-color': '#DEDEDE'});	
	}
	
	function out_drop_block(event){
		prevent_default(event);
		set_border_color_normal();
	}
	
	function over_drop_block(event) {
		prevent_default(event);
		$('#drop_here').css({'border-color': 'red'});
	}

	function prevent_default(event) {
	   event.stopPropagation();
	   event.preventDefault();
	 }
 
	function do_nothing(event) {
	   	prevent_default(event);
	 }
	
	function do_funky_stuff_with_droped_file(file) {
		reader = new FileReader();
		
		reader.onload = function (finished_reading_file_event) {
			var f_content = finished_reading_file_event.target.result;
			var f_name = file.name;
			var f_size = finished_reading_file_event.total;
			
			var boundary = "xxxxxxxxx";
			
			xhr = new XMLHttpRequest();
			
			xhr.open("POST", app_root_path + "/upload", true);
			
			xhr.setRequestHeader("Content-Type", "multipart/form-data, boundary="+boundary);
			xhr.setRequestHeader("Content-Length", f_size);
			
			xhr.overrideMimeType('text/plain; charset=utf-8');
			
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200) {
					document.getElementById('dest').innerHTML = xhr.response;
					toogle_sliders( {to: true} );
					setup_drop_here_block();
				}
			}
			
			xhr.upload.addEventListener("progress", function(e) {  
			        if (e.lengthComputable) {  
			          var percentage = Math.round((e.loaded * 100) / e.total);  
			          $( "#progress_bar" ).progressbar( {value:  percentage} );
			        }  
			      }, false);
		    
		    xhr.upload.addEventListener("load", function(e) {  
				          $("#progress_bar").progressbar({value: 100});
				      }, false);
			
			var body = "--" + boundary + "\r\n";  
		  	body += "Content-Disposition: form-data; name=image; filename=" + f_name + "\r\n";  
		  	//body += "Content-Type: image/jpeg\r\n\r\n";  
			body += "Content-Type: application/octet-stream\r\n\r\n";  
		  	//body += $.base64Encode(f_content) + "\r\n";  
			body += f_content + "\r\n";  
		  	body += "--" + boundary + "--"; 
		
			xhr.send(body);
					   
		}
		
		$("#progress_bar").fadeIn('slow');
		
		reader.readAsDataURL(file);
	}
	
	function droped_something(event) {
	  	prevent_default(event);
	  
		files_droped = event.dataTransfer.files;
		var file = files_droped[0];
		
		if (file.size > 100000){
			$.gritter.add({title: 'File size error!', text: 'Please use smaller image file! File should be less then 100KB!', image: error_img_path });
			set_border_color_normal();
			
			return false;
		}
		
		var imageType = /image\/jpeg/;

	    if (!file.type.match(imageType)) {
			$.gritter.add({title: 'File type error!', text: 'Please use only JPG files.', image: error_img_path });

	        set_border_color_normal();
			return false;
	    }
	
		if (files_droped.length >= 1)
			do_funky_stuff_with_droped_file(files_droped[0]);
		
		return false;
	}
	
	if (FB.getUserID() != 0) {
		setup_drop_here_block();
	}
});