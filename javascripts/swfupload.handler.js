SwfUploadHandlers = {
	file_queue_error : function(file, errorCode, message) {
		try {
			var imageName = "error.gif";
			var errorName = "";
			if (errorCode === SWFUpload.errorCode_QUEUE_LIMIT_EXCEEDED) {
				errorName = "You have attempted to queue too many files.";
			}

			if (errorName !== "") {
				alert(errorName);
				return;
			}

			switch (errorCode) {
			case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
				imageName = "zerobyte.gif";
				break;
			case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
				imageName = "toobig.gif";
				break;
			case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
			case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
			default:
				alert(message);
				break;
			}

			SwfUploadHandlers.add_image("images/" + imageName);

		} catch (ex) {
			this.debug(ex);
		}

	},

	file_dialog_complete : function(numFilesSelected, numFilesQueued) {
		try {
			if (numFilesQueued > 0) {
				this.startUpload();
			}
		} catch (ex) {
			this.debug(ex);
		}
	},

	upload_progress : function(file, bytesLoaded) {

		try {
			var percent = Math.ceil((bytesLoaded / file.size) * 100);

			var progress = new FileProgress(file,  this.customSettings.upload_target);
			progress.setProgress(percent);
			if (percent === 100) {
				progress.setStatus("Creating thumbnail...");
				progress.toggleCancel(false, this);
			} else {
				progress.setStatus("Uploading...");
				progress.toggleCancel(true, this);
			}
		} catch (ex) {
			this.debug(ex);
		}
	},

	upload_success : function(file, serverData) {
		try {
			alert("hoo" + serverData);
			
			SwfUploadHandlers.add_image("thumbnail.php?id=" + serverData);

			var progress = new FileProgress(file,  this.customSettings.upload_target);

			progress.setStatus("Thumbnail Created.");
			progress.toggleCancel(false);
			
			
		} catch (ex) {
			this.debug(ex);
		}
	},

	upload_complete : function (file) {
		try {
			/*  I want the next upload to continue automatically so I'll call startUpload here */
			if (this.getStats().files_queued > 0) {
				this.startUpload();
			} else {
				var progress = new FileProgress(file,  this.customSettings.upload_target);
				progress.setComplete();
				progress.setStatus("All images received.");
				progress.toggleCancel(false);
			}
		} catch (ex) {
			this.debug(ex);
		}
	},

	upload_error : function(file, errorCode, message) {
		var imageName =  "error.gif";
		var progress;
		try {
			switch (errorCode) {
			case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
				try {
					progress = new FileProgress(file,  this.customSettings.upload_target);
					progress.setCancelled();
					progress.setStatus("Cancelled");
					progress.toggleCancel(false);
				}
				catch (ex1) {
					this.debug(ex1);
				}
				break;
			case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
				try {
					progress = new FileProgress(file,  this.customSettings.upload_target);
					progress.setCancelled();
					progress.setStatus("Stopped");
					progress.toggleCancel(true);
				}
				catch (ex2) {
					this.debug(ex2);
				}
			case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
				imageName = "uploadlimit.gif";
				break;
			default:
				alert(message);
				break;
			}

			SwfUploadHandlers.add_image("images/" + imageName);

		} catch (ex3) {
			this.debug(ex3);
		}

	},

	add_image : function(src) {
		var newImg = document.createElement("img");
		newImg.style.margin = "5px";

		document.getElementById("thumbnails").appendChild(newImg);
		if (newImg.filters) {
			try {
				newImg.filters.item("DXImageTransform.Microsoft.Alpha").opacity = 0;
			} catch (e) {
				// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
				newImg.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + 0 + ')';
			}
		} else {
			newImg.style.opacity = 0;
		}

		newImg.onload = function () {
			SwfUploadHandlers.fade_In(newImg, 0);
		};
		newImg.src = src;
	},

	fade_in : function(element, opacity) {
		var reduceOpacityBy = 5;
		var rate = 30;	// 15 fps


		if (opacity < 100) {
			opacity += reduceOpacityBy;
			if (opacity > 100) {
				opacity = 100;
			}

			if (element.filters) {
				try {
					element.filters.item("DXImageTransform.Microsoft.Alpha").opacity = opacity;
				} catch (e) {
					// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
					element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + opacity + ')';
				}
			} else {
				element.style.opacity = opacity / 100;
			}
		}

		if (opacity < 100) {
			setTimeout(function () {
				SwfUploadHandlers.fade_in(element, opacity);
			}, rate);
		}
	}
}