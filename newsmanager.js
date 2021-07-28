// Default SortableJS
import Sortable from "sortablejs";

$(function(){
	$('body').on('click','.list__action[data-ajax]',function(e){
		e.preventDefault();
		var button = $(this);
		var id = button.closest('.list__line').data('id');
		var action = button.data('ajax');
		var url = button.attr('href');
		var blnRequest = true;
		button.closest('.list__line').addClass('loading');
		if (action.indexOf('delete') != -1)
			blnRequest = confirm($('#confirmDelete').text());
		if(blnRequest){
			app.requestLine(id,action,url).then(function(data){
				// console.log(data);
				if(!data.callback)
					button.closest('.list__line').removeClass('loading');
				if (data.status=="success" && data.callback){
					switch(data.callback){
						case 'reloadPage':
						window.location.reload();
						break;
						case 'getRow':
							// console.log(data.callback);
							app.requestLine(id,data.callback,url).then(function(data){
								// console.log(data);
								if (data.status=="success")
									button.closest('.list__line').replaceWith(data.row);
								button.closest('.list__line').removeClass('loading');
							});
						break;
						case 'deleteRow':
							button.closest('.list__line').remove();
						break;
						case 'displayModal':
							new app.ModalFW({
								name: 'list__modal--'+utils.uniqid(),
								content: data.content || 'No content',
								width: '1000px',
								blnOpen: true,
								onClose: function(){
									this.destroy();
									button.closest('.list__line').addClass('loading');
									app.requestLine(id,'getRow',url).then(function(data){
										if (data.status=="success")
											button.closest('.list__line').replaceWith(data.row);
										button.closest('.list__line').removeClass('loading');
									});
								}
							});
							button.closest('.list__line').removeClass('loading');
						break;
						default:
							button.closest('.list__line').removeClass('loading');
						break;
					}
				}	
			});
		} else {
			button.closest('.list__line').removeClass('loading');
		}
	});


	$('body').on('click','.list__action--toggler',function(e){
		$(this).closest('.list__cell').toggleClass('toggled');
	});

	$('.list__filters--check input[type="checkbox"][value="all"]').on('change',function(e){
		e.preventDefault();
		if ($(this).isChecked()){
			$(this).closest('.list__filters--check').find('input').not($(this)).prop("checked", false);
			$(this).closest('form').submit();
		}
	})
	$('.list__filters--2').find('select,input').not('[type="checkbox"][value="all"]').on('change',function(){
		$(this).closest('form').submit();
	});
	$('.list__filters button[type="reset"]').on('click',function(){
		$(this).closest('form').find('select,input').val('').attr('value','').trigger('change');
	});

	$('.list__line.separator').on('click',function(){
		var lines = $(this).nextUntil('.list__line.separator','.list__line');
		if ($(this).hasClass('inactive'))
			$(this).removeClass('inactive').nextUntil('.list__line.separator','.list__line').show();
		else
			$(this).addClass('inactive').nextUntil('.list__line.separator','.list__line').hide();
	});

	$('.list__sort').on('click',function(){
		var $filters = $('.list__filters[data-container="'+$(this).closest('.list__container').attr('data-name')+'"]');
		if ($(this).attr('data-by') != 'asc')
			$(this).attr('data-by','asc');
		else
			$(this).attr('data-by','desc');
		$filters.find('input[name=sort]').remove();
		$filters.append('<input type="hidden" name="sort" value="'+$(this).attr('data-sort')+' '+$(this).attr('data-by')+'">');
		$filters.closest('form').submit();
	})

	if($('.list__footer').length){
		var $item = $('.list__footer')
		var $clone = $item.clone();
		$clone.addClass('sticky').insertAfter($item);

		var footer_resize_event = $(window).resize(function(){
			$clone.outerWidth($item.outerWidth());
		}).trigger('resize');
		var footer_scroll_event = $(window).on('scroll',function(){
			if($(window).scrollTop() + viewport.height <= $item.offset().top)
				$clone.addClass('active');
			else
				$clone.removeClass('active');
		}).trigger('scroll');
	}

	// LANG
	$('.wem_nm_select_lang').on('submit',function(e){
		e.preventDefault();
	});
	$('body').on('click','.nm__selectLang',function(e){
		var $form = $(this).closest('form');
		$form.find('input[name=lang]').val($(this).attr('data-lang'));
		$form.submit();
	});

	
	if ($('.wem_nm__nav').length)
		app.setupSections();
	if ($('.wem_nm__vb').length)
		app.setupVB();
	// tests
	// $('.nav__stepFiller').eq(2).trigger('click')
});


app.setupVB = function(){
	// VB  EVENTS
	$('body').on('click','.wem_nm__vb__item.empty',function(e){
		$('.wem_nm__vb__item.empty').removeClass('replace');
		$(this).addClass('replace');
	});

	$('body').on('change','.wem_nm__vb__item.columns .wem_nm__vb__item__header select',function(e){
		var $item = $(this).closest('.wem_nm__vb__item');
		$item.attr('data-nbCols',$(this).val());
		if ($item.find('.wem_nm__vb__item').length < $(this).val())
			$item.append($('<div class="wrapper--trash"></div>').html('<div class="wem_nm__vb__item empty" data-modal="modal_select_content"></div>'.repeat($(this).val() - $item.find('.wem_nm__vb__item').length)))
		if ($item.find('.wem_nm__vb__item').length > $(this).val())
			$item.find('.wem_nm__vb__item').slice($(this).val() - $item.find('.wem_nm__vb__item').length).remove();
		$('.wem_nm__vb__item').unwrap('.wrapper--trash');
	});

	$('body').on('click','.wem_nm__vb__item__header .action.delete',function(e){
		var $item = $(this).closest('.wem_nm__vb__item');
		if ($item.hasClass('confirmDelete')) {
			if ($item.closest('.wem_nm__vb__item.columns').not($item).length)
				$item.replaceWith($('<div class="wrapper--trash"></div>').html('<div class="wem_nm__vb__item empty" data-modal="modal_select_content"></div>'));
			else
				$item.remove();
			$('.wem_nm__vb__item').unwrap('.wrapper--trash');
		} else {
			$item.addClass('confirmDelete');
			notif_fade.info($('#confirmDeleteByClickingTwice').text());
			setTimeout(function(){
				$item.removeClass('confirmDelete');
			},5000)
		}
	});

	$('body').on('click','.addNewElement',function(e){
		e.preventDefault();
		addNewElement($(this).attr('data-element'));
	});

	// FUNCTIONS
	var addNewElement = function(typeEl,data = {}){
		var nbItem = $('.wem_nm__vb .wem_nm__vb__item').not('.empty,.construct').length;
		console.log('add '+typeEl);
		// forbid adding columns into columns
		if (typeEl == 'columns' && $('.wem_nm__vb .wem_nm__vb__item.empty.replace').closest('.wem_nm__vb__item.columns').length) {
			notif_fade.warning($('#cannotAddColumnsIntoColumns').text());
			return false;
		}

		var $newEl = $('.wem_nm__vb__sampler .wem_nm__vb__item.'+typeEl).clone();
		if (typeEl == 'columns'){
			var nbcols = 2;
			if (typeof data.columns !== 'undefined')
				nbcols = data.columns.all;
			var $select = $newEl.find('select')
			$select.attr('id',utils.uniqid());
			$select.val(nbcols);
			$newEl.attr('data-nbCols',nbcols);
			$newEl.append('<div class="wem_nm__vb__item empty" data-modal="modal_select_content"></div>'.repeat(nbcols));
			setColumnsGrid($newEl.get(0))
		}
		// console.log($newEl);
		// console.log(data);
		$newEl.find('input,select,textarea').each(function(i,item){
			var name = $(item).attr('id').replace('field_','').replace('_sample','');
			// console.log(name, data[name]);
			if (data.hasOwnProperty(name)){
				// console.log($(item), name, data[name]);
				if ($(item).attr('type') == 'file') 
					$(item).attr('data-files',data[name]);
				else 
					$(item).val(data[name]);
			} 
			$(item).removeClass('custom').attr('id', $(item).attr('id').replace('_sample','_'+nbItem)); 
		});
		$newEl.find('label').each(function(i,item){$(item).attr('for', $(item).attr('for').replace('_sample','_'+nbItem)); });

		$('.wem_nm__vb .wem_nm__vb__item.empty.replace').replaceWith($('<div class="wrapper--trash"></div>').html($newEl));
		
		if ($newEl.find('.tinymce').length)
			createEditor($newEl.find('.tinymce').get(0));
		if ($newEl.find('input[type=file]').length)
			$newEl.find('input[type=file]').fileUploader('get').setupForNewsManager();

		if (!$('.wem_nm__vb>.wem_nm__vb__item.empty').length)
			$('.wem_nm__vb').append($('<div class="wrapper--trash"></div>').html('<div class="wem_nm__vb__item empty" data-modal="modal_select_content"></div>'));
		$('.wem_nm__vb__item').unwrap('.wrapper--trash');
		$('.wrapper--trash').remove();
		$('.wem_nm__modal--addContent').modalFW('get').close();
		return $newEl;
	}

	var setColumnsGrid = function(el){
		Sortable.create(el, {
		    draggable: '.wem_nm__vb__item',
		    handle: '.wem_nm__vb__item:not(.empty)>.wem_nm__vb__item__header .action.move',
		    mirror: {
		      appendTo: el,
		      constrainDimensions: true,
		      xAxis: false,
		    },
		    onStart: function(e){$('.ck-editor').addClass('no-events'); },
		    onEnd: function(e){$('.ck-editor').removeClass('no-events'); },
		});
	}

	// SETUPS
	// set sortable lists
	for(var grid of document.querySelectorAll('.wem_nm__vb')){
    	Sortable.create(grid, {
		    draggable: '.wem_nm__vb>.wem_nm__vb__item:not(.empty)',
		    handle: '.wem_nm__vb>.wem_nm__vb__item:not(.empty)>.wem_nm__vb__item__header .action.move',
		    mirror: {
		      appendTo: grid,
		      constrainDimensions: true,
		      xAxis: false,
		    },
		    onStart: function(e){$('.ck-editor').addClass('no-events'); },
		    onEnd: function(e){$('.ck-editor').removeClass('no-events'); },
		});
	}

	// Setup some special samplers
	$('.wem_nm__vb__sampler .wem_nm__vb__item.headline').each(function(){
		var $item = $(this);
		var $wrapper = $item.find('select[id*=hlevel]').closest('.input--wrapper');
		$item.find('select[id*=hlevel]').appendTo($item.find('.wem_nm__vb__item__header .headline'));
		$wrapper.remove();
	});
	$('.wem_nm__vb__sampler .wem_nm__vb__item.headline,.wem_nm__vb__sampler .wem_nm__vb__item.text').find('.input--wrapper label').addClass('hidden')

	// setups existing items
	$('.wem_nm__vb__item.construct').each(function(){
		var $el = $(this);
		var data = $el.data();
		$el.remove();
		$('.wem_nm__vb .wem_nm__vb__item.empty').first().addClass('replace');
		var $newEl = addNewElement(data.type,data);
	});
	$('.wem_nm__vb__item.placeholder').toggleClass('empty placeholder');

	// tests
	// $('.wem_nm__vb .wem_nm__vb__item.empty').last().addClass('replace');
	// addNewElement('headline');
	// $('.wem_nm__vb .wem_nm__vb__item.empty').last().addClass('replace');
	// addNewElement('text');
	// $('.wem_nm__vb .wem_nm__vb__item.empty').last().addClass('replace');
	// addNewElement('columns');
	// $('.wem_nm__vb .wem_nm__vb__item.empty').last().addClass('replace');
	// addNewElement('picture');
}


app.setupSections = function(){
	var $nav = $('.wem_nm__nav');
	var $content = $('.wem_nm__sections');
	var $actions = $('.wem_nm__actions');

	// setup navigation
	var strNav = `<div class="nav__text"><span class="nav__currentStep">1</span> / <span class="nav__totalStep">${$content.find('.wem_nm__section').length}</span> </div> <div class="nav__gauge">`;
	for (var i = 0; i < $content.find('.wem_nm__section').length; i++) 
		strNav += '<div class="nav__stepFiller '+(i==0?'active':'deactivate')+'" data-step="'+i+'">'+$content.find('.wem_nm__section').eq(i).attr('data-title')+'</div>';
	strNav += '</div';
	strNav = $(strNav);
	strNav.find('.nav__stepFiller').on('click',function(){
		if (!$(this).hasClass('complete') && !$(this).prev().hasClass('complete'))
			return false;
		var posNext = $(this).index() - strNav.find('.nav__stepFiller.active').index();
		if (posNext < 0)
			for (var i = 0; i > posNext; i--)
				switchStep('prev');
		else{
			var checkStep = app.checkFormValidity('.wem_nm__section[data-step="'+$content.find('.wem_nm__section.active').attr('data-step')+'"]');
			if (checkStep.valid) 
				for (var i = 0; i < posNext; i++)
					switchStep('next');
		} 
	});
	$nav.append(strNav);


	// STEPS MANAGEMENT
	$('body').on('click','.wem_nm__actions .step',function(e){
		// console.log('here',this);
		var checkStep = app.checkFormValidity('.wem_nm__section[data-step="'+$content.find('.wem_nm__section.active').attr('data-step')+'"]');
    	$('.ck-editor__editable').each(function(){
    		this.ckeditorInstance.updateSourceElement();
    	});
		if($(this).attr('data-dir') != 'prev'){
			if(checkStep.valid)
				$content.find('.wem_nm__section.active').addClass('complete');
			else
				$content.find('.wem_nm__section.active').removeClass('complete');
			// DEBUG
			// $content.find('.wem_nm__section.active').addClass('complete');
		}
		if($(this).attr('data-dir') != 'final'){
			switchStep($(this).attr('data-dir'));
		}
		else if($content.find('.wem_nm__section.active').hasClass('complete')){
			if(checkStep.valid){
				publishNews().then(function(data){
					console.log('success');
				}).catch(function(e){
					console.log(e);
				})
			}
		}
		if ($(this).attr('data-dir') == 'final') {}
	});

	var switchStep = function(dir){
		return new Promise(function(resolve,reject){
			var items = $content.find('.wem_nm__section').not('.deactivate');
			var current = items.toArray().indexOf($content.find('.wem_nm__section.active').get(0));
			var next;
			// console.log(dir,current);
			if (dir == "prev" && current != 0)
				next = current-1;
			else if(dir == "next" && current != items.length-1)
				next = current+1;

			if(dir == 'prev' || (dir == 'next' && items.eq(current).hasClass('complete'))){
				items.removeClass('active');
				items.eq(next).addClass('active');

				$actions.find('.step').removeClass('hidden');
				if(next == 0){ // first
					$actions.find('.step[data-dir="prev"]').addClass('hidden');
					if (!$content.hasClass('isComplete'))
						$actions.find('.step[data-dir="final"]').addClass('hidden');
				}
				if(next == items.length-1){ // last
					$actions.find('.step[data-dir="next"]').addClass('hidden');
				} else { // others
					if (!$content.hasClass('isComplete'))
						$actions.find('.step[data-dir="final"]').addClass('hidden');
				}
				updateNav(next+1)
			} else {}

			var indexRea = next;
			if (next >= $('.reassurance__item').length)
				indexRea = next - $('.reassurance__item').length;
			$('.reassurance__item').removeClass('active');
			$('.reassurance__item').eq(indexRea).addClass('active');

			resolve();
		});
	};

	var updateNav = function(pos){
		// var fillPercent = Math.round((pos)*100/$content.find('.wem_nm__section').not('.deactivate').length);
		$nav.find('.nav__currentStep').html(pos);
		$nav.find('.nav__totalStep').html($content.find('.wem_nm__section').not('.deactivate').length);
		// $nav.find('.nav__filler').attr('data-fill',fillPercent);
		// $nav.find('.nav__filler').css('left',$nav.find('.nav__filler').outerWidth() * fillPercent / 100);
		$nav.find('.nav__stepFiller').removeClass('active');
		$nav.find('.nav__stepFiller[data-step='+(pos-1)+']').removeClass('deactivate').addClass('active').prevAll().addClass('complete');
	};

	var getDataVB = function(){
		var obj = {};

		return obj;
	}


	var publishNews = function(){
		return new Promise(function(resolve,reject){
			var checkForm = app.checkFormValidity('.wem_nm__sections');
			console.log(checkForm);
			if (checkForm.valid) {
       			var fields = {};
       			$.each(checkForm.inputs,function(){
       				if (this.name != 'id' && this.name != 'lang'){
        		    	fields[this.name] = this.value;
        		    	if ((this.name == 'image' || this.name == 'document') && this.value === undefined) 
        		    		fields[this.name] = '';
       				}
        		});
       			var content = [];
        		$('.wem_nm__vb .wem_nm__vb__item').each(function(i,item){
        			content[i] = {type: $(item).attr('data-content') };
    				if ($(item).hasClass('empty') && $(item).closest('.wem_nm__vb__item.columns').length)
    					content[i] = {type: 'html', html:'<div></div>'}
    				if (content[i].type != 'columns'){
	        			$(item).find('input,select,textarea').filter('[id*=field_]').each(function(f,field){
	        				if ($(field).val())
	        					content[i][$(field).attr('id').split('_')[1]] = $(field).val();
	        				if ($(field).hasClass('fileUploader') && $(field).siblings('.fileUploader__input').val())
	        					content[i].image = $(field).siblings('.fileUploader__input').val();
	        			});
    				} else {
    					if ($(item).children('input[id*=field_id]').val())
    						content[i].id = $(item).children('input[id*=field_id]').val();
    					var nbcols = parseInt($(item).attr('data-nbcols'));
    					content[i].columns = {
    						all : nbcols,
    						lg	: nbcols>2? ((Math.ceil(nbcols/2)+1)	> 0 ? (Math.ceil(nbcols/2)+1)	:1 ) : 2,
    						md	: nbcols>2? ((Math.ceil(nbcols/2))		> 0 ? (Math.ceil(nbcols/2))		:1 ) : 2,
    						sm	: nbcols>2? ((Math.ceil(nbcols/2)-1)	> 0 ? (Math.ceil(nbcols/2)-1)	:1 ) : 2,
    						xs	: 2,
    						xxs	: 1,
    					}
    				}
        		});
        		console.log(content);
        		fields.content = content;
       			var data = {
       				'TL_AJAX':true ,
					'REQUEST_TOKEN':rt ,
					'action': 'save',
					'lang': checkForm.inputs.lang.value,
					'data': fields
       			};
       			if (checkForm.inputs.id)
       				data.id = checkForm.inputs.id.value;
       			console.log(data);
       			// return false; resolve();
        		$.ajax({
					timeout: 10000,
					url: window.location.pathname,
					type: 'post',
					data: data,
					// beforeSend: function(xhr) {console.log(xhr); },
				}).done(function(data){
          			try{var results = $.parseJSON(data); } catch(e){throw e;}
          			// console.log(results);
          			notif_fade[results.status](results.msg);
      				if (results.status == 'success'){
      					setTimeout(function(){
      						window.location.href=results.href;
      					},3000);
      				}

		    		resolve();
				}).fail(function(jqXHR, textStatus){
		         	console.log(jqXHR, textStatus);
		         	reject();
		        });
			} else
				reject('Form not complete');
		});
	}
	
	// FILEUPLOADERS
	$('.wem_nm__section .fileUploader__wrapper input[type=file]').each(function(){
		var uploader = $(this).fileUploader('get');
		uploader.setupForNewsManager();
	});
	// setTimeout(function(){
		if (!$content.hasClass('isNew')) {
			var checkAll = app.checkFormValidity($content);
			if(checkAll.valid){
				$content.addClass('isComplete');
				$content.find('.wem_nm__section').addClass('complete');
				$nav.find('.nav__stepFiller').removeClass('deactivate').addClass('complete');
				$actions.find('.step[data-dir=final]').removeClass('hidden');
			} else {
				$content.find('.wem_nm__section').each(function(){
					var $section = $(this)
					if ((parseInt($section.attr('data-step'))+1) != $content.find('.wem_nm__section').length) {
						var check = app.checkFormValidity($section);
						if (check.valid){
							$section.addClass('complete')
							switchStep('next');
						}
					}
				});
			}
		}
	// },1);

}

app.FileUploader.prototype.setupForNewsManager = function(){
	var fileUploader = this;
	fileUploader.$label.html(`
		<i class="fa fa-file-${fileUploader.$el.attr('data-type')!='picture'?fileUploader.$el.attr('data-type'):'image'}"></i>
		<span>${(fileUploader.maxSize / 1000).toFixed(1)}Mo max</span>	
		<span>${fileUploader.allowed}</span>
	`);
	fileUploader.$error.insertBefore(fileUploader.$wrapper);
	if (fileUploader.files.length) {
  		for(var file of fileUploader.files){
				fileUploader.$wrapper.append('<input type="hidden" class="fileUploader__input" '+fileUploader.dataAttr+'="'+fileUploader.name+'" value="'+file+'" data-filename="'+file.split('/')[file.split('/').length-1]+'" />');
  		}
	}
	fileUploader.$label.on('click',function(){
		if (!fileUploader.$preview.find('.preview__item').length) {
			fileUploader.$el.val(null)
		}
	})

	fileUploader.$el.off('change').on('change',function(){
		if (this.files.length){
			fileUploader.displayError(false);
		    fileUploader.$wrapper.find('input[type=hidden]').remove();
		    fileUploader.$preview.find('.preview__item').remove();
			var i = 1;
			for(var file of this.files){
				var valid = true;
				console.log(i , fileUploader.maxFiles);
				if (fileUploader.maxFiles && i > fileUploader.maxFiles){
          			fileUploader.displayError('You can\'t upload more than '+fileUploader.maxFiles+' files.');
					valid = false;
				}
				if (fileUploader.allowed && !fileUploader.allowed.includes(file.type.split('/')[1])){
          			fileUploader.displayError('You can\'t upload a '+file.type.split('/')[1]+' file. Allowed extensions: '+fileUploader.allowed.join(', '));
					valid = false;
				}
				if (valid) {
					if (fileUploader.mode == "custom") 
						fileUploader.uploadFileThenSavePath(file);
				}
				i++;
			}
		}
	});

}

app.FileUploader.prototype.uploadFileThenSavePath = function(file){
  var fileUploader = this;
  console.log('uploadFileThenSavePath');
  return new Promise(function(resolve,reject){
  		fileUploader.addBase64File(file).then(function($input){
  			console.log('b64 added');
  			var $loader = $('<div class="loader"><i class="fas fa-circle-notch fa-spin"></i></div>');
  			$input.closest('.fileUploader__wrapper').find('label').append($loader);
  			$('.wem_nm__actions button[data-dir=final]').addClass('no-events opa-5');
			$.ajax({
				timeout: 20000,
				url: window.location.pathname,
				type: 'post',
				data:{
					'TL_AJAX':true ,
					'REQUEST_TOKEN':rt ,
					'action': 'saveFile',
					'id': $('.wem_nm__sections input[name=id]').val(),
					'b64': $input.val(),
					'name': $input.attr('data-filename'),
					'headline': $('.mod_wem_nm_editnews .wem_nm__section[data-step=0] input#field_headline').val(),
					'extension': $input.attr('data-filename').split('.')[1],
				}
				// ,beforeSend: function(xhr) {console.log(xhr); },
			}).done(function(data){
				console.log('saveFile - data: ',data);
				try{var results = $.parseJSON(data); } catch(e){throw e;}
				console.log('saveFile - results: ',results);
				if (results.status == 'success'){
					fileUploader.addPreviewImg(file);
					$input.val(results.path)
				} else {
					notif[results.status](results.msg);
					console.log(results.status+': ',results.msg);
					console.log(results.trace);
				}
				console.log('unlock form');
				$loader.remove();
				$('.wem_nm__actions button[data-dir=final]').removeClass('no-events opa-5');
				resolve();
			}).fail(function(jqXHR, textStatus){
				console.log(jqXHR, textStatus);
				console.log('unlock form');
				$loader.remove();
				notif.error('error: '+textStatus);
				$('.wem_nm__actions button[data-dir=final]').removeClass('no-events opa-5');
				reject();
			});
  		})
	}).catch(function(e){
		console.log(e);
	});
}

/**
* [refreshRow description]
* @param  {String} containerClass [class name of the list__container's parent]
* @param  {Object} data           [data used to fill cells]
* @param  {Object} actions        [optionnal array of object containing actions to display in the line]
* action = {
*   action : 'actionName',
*   title  : 'buttonTitle',
*   icon   : 'buttonIcon',
*   ajax   : 'optionalAjaxRequestName',
* }
*/
app.refreshRow = function(containerClass,data,actions){
	var list = $('.'+containerClass+' .list__container');
	if(list.find('.list__line[data-id="'+data.id+'"]').length){
		list.find('.list__line[data-id="'+data.id+'"]').addClass('loading');
		$.each(data,function(k,v){
			list.find('.list__line[data-id="'+data.id+'"]').find('.list__cell[data-name="'+k+'"').text(v);
		})
		list.find('.list__line[data-id="'+data.id+'"]').removeClass('loading');
	} else {
		var line = list.find('.list__headline').clone();
		line.attr('data-id',data.id);
		line.toggleClass('list__headline list__line').find('th').replaceWith(function(){
			return $('<td></td>').addClass('list__cell').attr('data-name',$(this).attr('data-name'));
		});
		$.each(data,function(k,v){
			line.find('.list__cell[data-name="'+k+'"').text(v);
		});
		line.find('.list__cell[data-name="actions"]').html('');
		if(utils.getObjSize(actions)){
			$.each(actions,function(){
				var $action = $(`<a href="`+window.location.pathname+`" data-action="`+this.action+`" class="list__action" title="`+this.title+`"><i class="`+this.icon+`"></i></a>`);
				if(this.ajax)
					$action.attr('data-ajax',this.ajax);
				line.find('.list__cell[data-name="actions"]').append($action);
			});
		}
		list.append(line);
	}
};

app.requestLine = function(id,action,url){
	return new Promise(function(resolve,reject){
		$.ajax({
			timeout: 10000,
			url: url,
			type: 'post',
			data:{
				'TL_AJAX':true ,
				'REQUEST_TOKEN':rt ,
				'action': action,
				'id': id,
			}
			// beforeSend: function(xhr) {console.log(xhr); },
		}).done(function(data){
			// console.log(data);
			try{var results = $.parseJSON(data); } catch(e){throw e;}
			resolve(results);
		}).fail(function(jqXHR, textStatus){
			console.log('requestLine',id,action,url);
			console.log(jqXHR, textStatus);
			reject();
		});
	});
}


// check form's validity, return an object containing the result's status and use renderError() to display error messages
// params:
// jquery object container = form's container (don't need to be a form html mark up)
// NB:
// - to work properly, the container needs to have only one css class and contain a div.error-container.
// - only inputs with a required html attribute will be checked.
// - specials rules can be added to inputs (example: myInput_1 can be required if myInput_2 is filled).
//   In order to do this, the input need to have a "data-required" attribute, filled like this: "nameInputReferent/valueInputReferent/optionalLogicalOperator".
//   optionalLogicalOperator can be "and", "or", "xor". By default, the logical operator used is "and".
app.checkFormValidity = function checkFormValidity(container) {
    // var formInputs = $(container).find('input,textarea,select').filter('[name]');
    var formInputs = $(container).find('input,textarea,select').filter(function(i){return this.name != "" && !$(this).hasClass('fileUploader__input');});
    var specialInputs = new Object();
    var results = new Object();
    results.valid = true;
    results.inputs = new Object();

    var arrNames = [];
    var arrTemp = formInputs.filter(function(i,el){
        if (arrNames.indexOf(el.name) == -1){
            arrNames.push(el.name);
            return el;          
        }
    });

    $.each(formInputs, function(index, input){
        var valid = true;
        var inputRow;
        switch(input.nodeName) {
          case 'SELECT':
          case 'TEXTAREA':
          case 'INPUT':
            if($(input).val() == '' && $(input).attr('required'))
              valid = false;
            break;
          default: break;
        }
        if ($(input).attr('name') === undefined)
          return false;
        inputRow = {
          'name' : $(input).attr('name').replace('[]', ''),
          'type' : input.nodeName,
          'value' : $(input).val(),
          'valid' : valid
        };

        if($(input).is(':invalid')) // regular check if inout is invalid, then result is false by default
            inputRow['valid'] = false;

        // FILEUPLOADER
        if ($(input).attr('type') == 'file' && $(input).hasClass('fileUploader')) {
        	var fileUploader = $(input).fileUploader('get');
            inputRow.valid = true;
        	if (fileUploader.multiple) {
                inputRow.value = [];
        		fileUploader.$wrapper.find('.fileUploader__input').each(function(){
        			inputRow.value.push(this.value);
        		});
        		if ($(input).attr('required') && !inputRow.value.length)
                    inputRow.valid = false;
        	} else {
        		inputRow.value = fileUploader.$wrapper.find('.fileUploader__input').val();
        		if ($(input).attr('required') && inputRow.value == '')
                    inputRow.valid = false;
        	}
        }

        // CHECKBOXES
        if ($(input).attr('type') == 'checkbox') {
            inputRow.valid = true;
            if ($(container).find('input').filter('[name="'+$(input).attr('name')+'"]').length > 1) { // multiple checkbox, should return array of values
                inputRow.value = [];
                $(container).find('input').filter('[name="'+$(input).attr('name')+'"]').each(function(){
                    if ($(this).isChecked())
                        inputRow.value.push(this.value);
                });
                if ($(input).attr('required') && !inputRow.value.length)
                    inputRow.valid = false;
            } else { // unique checkbox, should return 1 or 0
                inputRow.value = ($(input).isChecked()) ? 1 : 0;
                if ($(input).attr('required') && inputRow.value == 0)
                    inputRow.valid = false;
            }
        }

        // RADIOS
        if ($(input).attr('type') == 'radio') {
            inputRow.valid = true;
            inputRow.value = false;
            $(container).find('input').filter('[name="'+$(input).attr('name')+'"]').each(function(){
                if ($(this).isChecked())
                    inputRow.value = (this.value);
            });
            if ($(input).attr('required') && !inputRow.value)
                inputRow.valid = false;
        }

        // DATEPICKERS
        if($(input).hasClass('datepicker'))
          inputRow.value = $(input).attr('data-tstamp');


        // WIZARDS
        if($(input).hasClass('wizard')){
          var fields = $(container).find('[data-wizard="'+inputRow.name+'"]');
          inputRow.value={};
          fields.each(function(i,group){
            if($(this).find('input.key').length && $(this).find('input.value').length){
              if ($(this).find('input.key').val() != "")
                inputRow.value[$(this).find('input.key').val()] = $(this).find('input.value').val();
            } else {
              inputRow.value[i] = {};
              $(this).find('input,select').each(function(){
                if ($(this).attr('data-wizardKey')){
                  renderError(input.name.replace('[]', '')+'_'+$(this).attr('data-wizardKey'), $(container).attr('class'),false);
                  inputRow.value[i][$(this).attr('data-wizardKey')] = $(this).val();
                  if($(this).val() == '' && $(this).attr('required')){
                    console.log('invalid wizard');
                    var labelError = input.name.replace('[]', '');
                    if($(container).find('label[for*="'+input.name.replace('[]', '')+'"]').first().length)
                      labelError = '"'+ $(container).find('label[for*="'+input.name.replace('[]', '')+'"]').first().html().replace(':','').trim() + '"';
                    renderError(input.name.replace('[]', '')+'_'+$(this).attr('data-wizardKey'), $(container).attr('class'), 'Le champ '+labelError+' ('+$(this).attr('data-wizardKey')+') est invalide ou incomplet.');
                  }
                }
              })
            }
          })
        }
        
        // FORM VALIDATION
        if($(input).attr('required') && !$(input).hasClass('nofill')){  // regular required input
          if(!inputRow['valid']){
          	// console.log(input, inputRow);
            results.valid = false;
          }
          results.inputs[inputRow.name] = inputRow;
        }
        else if($(input).attr('data-required') && !$(input).hasClass('nofill')){ // required input according to another input (aka "special inputs")
          var params = $(input).attr('data-required').split('/');
          requiredParams = {
            'inputName' : params[0],
            'inputValue' : params[1],
            'operator' : params[2]
          };
          if(!specialInputs[requiredParams.inputName]) {
            specialInputs[requiredParams.inputName] = new Object();
            specialInputs[requiredParams.inputName].params = requiredParams;
            specialInputs[requiredParams.inputName].inputs = [];
            specialInputs[requiredParams.inputName].inputs[inputRow.name] = inputRow;
          } else {
            specialInputs[requiredParams.inputName].inputs[inputRow.name] = inputRow;
          }
        } else { // input not required
          results.inputs[inputRow.name] = inputRow;
        }
    });


    if(Object.keys(specialInputs).length > 0){  // do this if we have special inputs registred
        $.each(specialInputs, function(index, mode){
          var refInput;
          for(var i = 0; i < formInputs.length; i++) {
            if(formInputs[i].className === mode.params.inputName)
              refInput = formInputs[i];
          }
          var refInputValue = $(refInput).val();
          if(refInputValue == mode.params.inputValue) {
            var arrayCheck = [];
             $.each(mode.inputs, function(index, input){
                if(!input.valid)
                    arrayCheck.push(0);
                else
                    arrayCheck.push(1);
                results.inputs.push(input);
            });
            switch(mode.params.operator) {
              case 'or':
                if(arrayCheck.indexOf(1) == -1)
                    results.valid = false;
                break;
              case 'xor':
                var indexes = [], i = -1;
                while ((i = arrayCheck.indexOf(1, i+1)) != -1){
                    indexes.push(i);
                }
                if(indexes.length != 1)
                    results.valid = false;
                break;
              case 'and':
              default:
                $.each(mode.inputs, function(index, input){
                    if(!input.valid)
                        results.valid = false;
                    results.inputs.push(input);
                });
                break;
            }
          }
        });
    }
    // console.log(results);
    // console.log(formInputs);
    if(!results.valid && $(container).find('.error-container').first()){  // display errors - the container need to have a div.error-container
      $.each(formInputs, function(index, input){
        renderError(input.name.replace('[]', ''), $(container).attr('class'), false); // clean all error messages
      });
      $.each(results.inputs, function(index, input){
        var labelError = input.name.replace('[]', '');
          // console.log(input.name,$(container).find('label[for="'+input.name.replace('[]', '')+'"]').first().length);
        if($(container).find('label[for="'+input.name.replace('[]', '')+'"]').first().length){ // if exist, get label of the input
          labelError = '"'+ $(container).find('label[for="'+input.name.replace('[]', '')+'"]').first().html().replace(':','').trim() + '"';
        }
        if(!input.valid){
          renderError(input.name.replace('[]', ''), $(container).attr('class'), $('#fillThisField').text()+' '+ labelError);
        }
        else
          renderError(input.name.replace('[]', ''), $(container).attr('class'), false);
      });
    }
    else if($(container).find('.error-container').first()){ // form is valid, clean all error messages
      $.each(formInputs, function(index, input){
        // console.log(input);
          renderError(input.name.replace('[]', ''), $(container).attr('class'), false);
      });
    }

    // console.log(results);
    return results; // return the global results
}

// display error message in specified container
// params:
// string selector = error's name
// string parent = id of the error's container
// string msg = error's message. take false as value to delete the message
// bool success = if true, the message displayed is a success message. default state is false
var renderError = function renderError(selector, parent, msg, success)
{
    // DEBUG
    // console.log(selector)
    // console.log(parent)
    // console.log(msg)
    // console.log(success)
    // console.log('----------------------------------')
    if($('#'+parent+' .error-container').length === 0 && msg !== false) {
        if( typeof success !== 'undefined' && success == true)
            notif_fade.success(msg);
        else
            notif_fade.error(msg);
    }
    else {
        var selectors = selector.replace(' ','.');
        if( typeof success !== 'undefined' && success == true)
            selector = selector + ' confirm';
        $('#'+parent+' .error-container blockquote.'+selectors).fadeOut().remove();
        if(msg) {
            $('#'+parent+' .error-container').append('<blockquote class="'+selector+'"><p>'+msg+'</p></blockquote>');
            $('#'+parent+' .error-container blockquote.'+selectors).hide().fadeIn();
            if ($('#'+parent).closest('.modalFW').length) {
              $('#'+parent).closest('.modalFW').animate({
                  scrollTop: $('#'+parent+' .error-container').offset().top - 200
              }, 500);
            } else{
              $('html,body').animate({
                  scrollTop: $('#'+parent+' .error-container').offset().top - 200
              }, 500);
            }
        }
    }
}