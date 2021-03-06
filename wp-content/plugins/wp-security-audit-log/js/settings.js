jQuery(document).ready(function(){
	var RemoveSecToken = function(){
		var $this = jQuery(this).parents('span:first');
		$this.addClass('sectoken-del').fadeOut('fast', function(){
			$this.remove();
		});
	};

	jQuery( '#ViewerQueryBox, #EditorQueryBox, #ExRoleQueryBox, #ExUserQueryBox, #CustomQueryBox, #IpAddrQueryBox, #ExCPTsQueryBox' ).keydown( function( event ) {
		if ( event.keyCode === 13 ) {
			var type = jQuery(this).attr('id').substr(0, 6);
			console.log( type );
			jQuery('#'+type+'QueryAdd').click();
			return false;
		}
	} );

	jQuery( '#ViewerQueryAdd, #EditorQueryAdd, #ExRoleQueryAdd, #ExUserQueryAdd, #CustomQueryAdd, #IpAddrQueryAdd, #ExCPTsQueryAdd' ).click(function(){
		var type 	= jQuery(this).attr('id').substr(0, 6);
		var value 	= jQuery.trim(jQuery('#'+type+'QueryBox').val());
		var existing = jQuery('#'+type+'List input').filter(function() { return this.value === value; });

		if( ! value || existing.length ) return; // if value is empty or already used, stop here

		jQuery('#'+type+'QueryBox, #'+type+'QueryAdd').attr('disabled', true);
		jQuery.post(jQuery('#ajaxurl').val(), {action: 'AjaxCheckSecurityToken', token: value}, function(data){
			jQuery('#'+type+'QueryBox, #'+type+'QueryAdd').attr('disabled', false);
			if (type != 'Custom' && type != 'IpAddr') {
				if(data === 'other') {
					alert('The specified token is not a user nor a role!');
					jQuery('#'+type+'QueryBox').val('');
					return;
				}
			}
			jQuery('#'+type+'QueryBox').val('');
			jQuery('#'+type+'List').append(jQuery('<span class="sectoken-'+data+'"/>').text(value).append(
				jQuery('<input type="hidden" name="'+type+'s[]"/>').val(value),
				jQuery('<a href="javascript:;" title="Remove">&times;</a>').click(RemoveSecToken)
			));
		});
	});

	jQuery( '#ViewerList>span>a, #EditorList>span>a, #ExRoleList>span>a, #ExUserList>span>a, #CustomList>span>a, #IpAddrList>span>a, #ExCPTsList>span>a' ).click( RemoveSecToken );

	jQuery('#RestrictAdmins').change(function(){
		var user = jQuery('#RestrictAdminsDefaultUser').val();
		var fltr = function() { return this.value === user; };
		if (this.checked) {
			if (jQuery('#EditorList input').filter(fltr).length === 1) {
				jQuery('#EditorList .sectoken-user').each(function(){
		            if (jQuery(this).find('input[type=hidden]').val() === user) {
		            	jQuery(this).remove();
		            }
		        });
			}
			jQuery('#EditorList').append(jQuery('<span class="sectoken-user"/>').text(user).prepend(jQuery('<input type="hidden" name="Editors[]"/>').val(user)));
		} else if (!this.checked){
			jQuery('#EditorList .sectoken-user').each(function(){
	            if (jQuery(this).find('input[type=hidden]').val() === user) {
	            	jQuery(this).remove();
	            }
	        });
		}
	});

	var usersUrl = ajaxurl + "?action=AjaxGetAllUsers&wsal_nonce=" + wsal_data.wp_nonce;
	jQuery("#ExUserQueryBox").autocomplete({
	    source: usersUrl,
	    minLength:1
	});

	var rolesUrl = ajaxurl + "?action=AjaxGetAllRoles&wsal_nonce=" + wsal_data.wp_nonce;
	jQuery("#ExRoleQueryBox").autocomplete({
	    source: rolesUrl,
	    minLength:1
	});

	var cptsUrl = ajaxurl + "?action=AjaxGetAllCPT&wsal_nonce=" + wsal_data.wp_nonce;
	console.log( cptsUrl );
	jQuery( '#ExCPTsQueryBox' ).autocomplete( {
	    source: cptsUrl,
	    minLength: 1,
	} );

	// Enable setting.
	function wsal_enable_setting( setting ) {
		setting.removeProp( 'disabled' );
	}

	// Disable setting.
	function wsal_disable_setting( setting ) {
		setting.prop( 'disabled', 'disabled' );
	}

	// Enable/disable file changes.
	var file_changes = jQuery( 'input[name=wsal-file-changes]' );

	// File change settings.
	var file_changes_settings = [
		jQuery( '#wsal-file-alert-types' ),
		jQuery( '#wsal-scan-frequency' ),
		jQuery( '#wsal-scan-directories' ),
		jQuery( '#wsal-scan-exclude-extensions' ),
		jQuery( '#wsal-scan-time fieldset' ),
		jQuery( '#wsal_add_file_name' ),
		jQuery( '#wsal_add_file' ),
		jQuery( '#wsal_remove_exception_file' ),
		jQuery( '#wsal_add_file_type_name' ),
		jQuery( '#wsal_add_file_type' ),
		jQuery( '#wsal_remove_exception_file_type' ),
		jQuery( '#wsal_files input[type=checkbox]' ),
		jQuery( '#wsal_files_types input[type=checkbox]' ),
	];

	// Update settings of file changes on page load.
	if ( file_changes.prop( 'checked' ) ) {
		file_changes_settings.forEach( wsal_enable_setting ); // Enable the settings.
	} else {
		file_changes_settings.forEach( wsal_disable_setting ); // Disable the settings.
	}

	// Update settings when file changes is enabled or disabled.
	file_changes.on( 'change', function() {
		if ( file_changes.prop( 'checked' ) ) {
			file_changes_settings.forEach( wsal_enable_setting ); // Enable the settings.
		} else {
			file_changes_settings.forEach( wsal_disable_setting ); // Disable the settings.
		}
	} );

	// Scan frequency.
	var scan_frequency = jQuery( 'select[name=wsal-scan-frequency]' ); // Frequency.
	var scan_days = jQuery( 'span#wsal-scan-day'); // Day of the week.
	var scan_date = jQuery( 'span#wsal-scan-date'); // Date of the month.
	wsal_update_scan_time( scan_frequency, scan_days, scan_date ); // Update on page load.

	// Update when frequency is changed.
	scan_frequency.change( function() {
		wsal_update_scan_time( scan_frequency, scan_days, scan_date );
	} );

	/**
	 * Updates the display of days and date option based on
	 * selected frequency.
	 *
	 * @param {object} frequency Frequency selector.
	 * @param {object} days Days selector.
	 * @param {object} date Date selector.
	 */
	function wsal_update_scan_time( frequency, days, date ) {
		if ( frequency.val() === 'weekly' ) {
			date.addClass( 'hide' );
			days.removeClass( 'hide' );
		} else if ( frequency.val() === 'monthly' ) {
			days.addClass( 'hide' );
			date.removeClass( 'hide' );
		} else {
			date.addClass( 'hide' );
			days.addClass( 'hide' );
		}
	}

	// Add file to scan file exception list.
	jQuery( '#wsal_add_file' ).click( function() {
		wsal_add_scan_exception( 'file' );
	} );

	// Add file extension to scan extension exception list.
	jQuery( '#wsal_add_file_type' ).click( function() {
		wsal_add_scan_exception( 'extension' );
	} );

	/**
	 * Add exception for file changes scan.
	 *
	 * @param {string} type Type of exception added. For example, a `file` or an `extension`.
	 */
	function wsal_add_scan_exception( type ) {
		if ( type === 'file' ) {
			var setting_input = jQuery( '#wsal_add_file_name' );
			var setting_value = setting_input.val();
			var setting_container = jQuery( '#wsal_files' );
			var setting_nonce = jQuery( '#wsal_scan_exception_file' ).val();
			var setting_error = jQuery( '#wsal_file_name_error' );
		} else if ( type === 'extension' ) {
			var setting_input = jQuery( '#wsal_add_file_type_name' );
			var setting_value = setting_input.val();
			var setting_container = jQuery( '#wsal_files_types' );
			var setting_nonce = jQuery( '#wsal_scan_exception_file_type' ).val();
			var setting_error = jQuery( '#wsal_file_type_error' );
		}
		setting_error.addClass( 'hide' );

		// Validate file name.
		var pattern = /^\s*[a-z-._\d,\s]+\s*$/i;

		if ( setting_value.match( pattern ) ) {
			// Ajax request to add file to scan file exception list.
			jQuery.ajax( {
				type: 'POST',
				url: ajaxurl,
				async: true,
				dataType: 'json',
				data: {
					action: 'wsal_scan_add_exception',
					nonce: setting_nonce,
					data_name: setting_value,
					data_type: type,
				},
				success: function( data ) {
					if ( data.success ) {
						var file = jQuery( '<span></span>' );
						var file_input = jQuery( '<input />' );
						file_input.prop( 'type', 'checkbox' );
						file_input.prop( 'id', setting_value );
						file_input.prop( 'value', setting_value );

						var file_label = jQuery( '<label></label>' );
						file_label.prop( 'for', setting_value );
						file_label.text( setting_value );

						file.append( file_input );
						file.append( file_label );

						setting_container.append( file );
						setting_input.removeAttr( 'value' );
					} else {
						console.log( data.message );
						setting_error.text( data.message );
						setting_error.removeClass( 'hide' );
					}
				},
				error: function( xhr, textStatus, error ) {
					console.log( xhr.statusText );
					console.log( textStatus );
					console.log( error );
				}
			} );
		} else {
			if ( type === 'file' ) {
				alert( 'Filename cannot be added because it contains invalid characters.' );
			} else if ( type === 'extension' ) {
				alert( 'File extension cannot be added because it contains invalid characters.' );
			}
		}
	}

	// Remove files from scan file exception list.
	jQuery( '#wsal_remove_exception_file' ).click( function() {
		wsal_remove_scan_exception( 'file' );
	} );

	// Remove file extensions from scan file extensions exception list.
	jQuery( '#wsal_remove_exception_file_type' ).click( function() {
		wsal_remove_scan_exception( 'extension' );
	} );

	/**
	 * Remove exception for changes scan.
	 *
	 * @param {string} type Type of exception removed. For example, a `file` or an `extension`.
	 */
	function wsal_remove_scan_exception( type ) {
		if ( type === 'file' ) {
			var setting_values = jQuery( '#wsal_files input[type=checkbox]' ); // Get files.
			var removed_values = [];
			var setting_nonce  = jQuery( '#wsal_scan_remove_exception_file' ).val(); // Nonce.

			// Make array of files which are checked.
			for ( var index = 0; index < setting_values.length; index++ ) {
				if ( jQuery( setting_values[ index ] ).is( ':checked' ) ) {
					removed_values.push( jQuery( setting_values[ index ] ).val() );
				}
			}
		} else if ( type === 'extension' ) {
			var setting_values = jQuery( '#wsal_files_types input[type=checkbox]' ); // Get files.
			var removed_values = [];
			var setting_nonce  = jQuery( '#wsal_scan_remove_exception_file_type' ).val(); // Nonce.

			// Make array of files which are checked.
			for ( var index = 0; index < setting_values.length; index++ ) {
				if ( jQuery( setting_values[ index ] ).is( ':checked' ) ) {
					removed_values.push( jQuery( setting_values[ index ] ).val() );
				}
			}
		}

		// Ajax request to remove array of files from file exception list.
		jQuery.ajax( {
			type: 'POST',
			url: ajaxurl,
			async: true,
			dataType: 'json',
			data: {
				action: 'wsal_scan_remove_exception',
				nonce: setting_nonce,
				data_type: type,
				data_removed: removed_values,
			},
			success: function( data ) {
				if ( data.success ) {
					// Remove files from list on the page.
					for ( index = 0; index < removed_values.length; index++ ) {
						var setting_value = jQuery( 'input[value="' + removed_values[ index ] + '"]' );
						if ( setting_value ) {
							setting_value.parent().remove();
						}
					}
				} else {
					console.log( data.message );
				}
			},
			error: function( xhr, textStatus, error ) {
				console.log( xhr.statusText );
				console.log( textStatus );
				console.log( error );
			}
		} );
	}

	// Scan now start button.
	jQuery( '#wsal-scan-now' ).click( function( event ) {
		event.preventDefault();

		// Change button text.
		var scan_btn = jQuery( this );
		scan_btn.attr( 'disabled', 'disabled' );
		scan_btn.text( 'Scan in Progress' );

		// Stop scan button.
		var stop_scan_btn = jQuery( '#wsal-stop-scan' );
		stop_scan_btn.removeAttr( 'disabled' );


		// Get start scan nonce.
		var manual_scan_nonce = jQuery( '#wsal-scan-now-nonce' ).val();

		// Ajax request to remove array of files from file exception list.
		jQuery.ajax( {
			type: 'POST',
			url: ajaxurl,
			async: true,
			dataType: 'json',
			data: {
				action: 'wsal_manual_scan_now',
				nonce: manual_scan_nonce,
			},
			success: function( data ) {
				if ( data.success ) {
					// Change button text.
					scan_btn.text( 'Scan Now' );
					scan_btn.removeAttr( 'disabled' );
					stop_scan_btn.attr( 'disabled', 'disabled' );
				} else {
					scan_btn.text( 'Scan Failed' );
					console.log( data.message );
				}
			},
			error: function( xhr, textStatus, error ) {
				console.log( xhr.statusText );
				console.log( textStatus );
				console.log( error );
			}
		} );
	} );

	// Stop scan start button.
	jQuery( '#wsal-stop-scan' ).click( function( event ) {
		event.preventDefault();

		// Change button attributes.
		var stop_scan_btn = jQuery( this );
		stop_scan_btn.attr( 'disabled', 'disabled' );

		// Ajax request to remove array of files from file exception list.
		jQuery.ajax( {
			type: 'POST',
			url: ajaxurl,
			async: true,
			dataType: 'json',
			data: {
				action: 'wsal_stop_file_changes_scan',
				nonce: jQuery( '#wsal-stop-scan-nonce' ).val(),
			},
			success: function( data ) {
				if ( data.success ) {
					// Change button text.
					// stop_scan_btn.removeAttr( 'disabled' );
				} else {
					console.log( data.message );
				}
			},
			error: function( xhr, textStatus, error ) {
				console.log( xhr.statusText );
				console.log( textStatus );
				console.log( error );
			}
		} );
	} );
});
