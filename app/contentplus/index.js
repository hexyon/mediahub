
            $(document).ready(function() {
                let media = [];
                let fileNames = [];
                let fileTypes = [];
                let currentIndex = 0;
                let blurEnabled = false;
                let preloadedImages = {};
                let currentBlurIndex = 0;
                
                const $galleryGrid = $('#gallery-grid');
                const $viewerModal = $('.viewer-modal');
                const $viewerImage = $('.viewer-image');
                const $viewerBackground = $('.viewer-background');
                const $fileListModal = $('.file-list-modal');
                const $fileList = $('.file-list');
                const $emptyState = $('.empty-state');
                const $galleryInfo = $('.gallery-info');
                
                function updateGalleryGrid() {
                    $galleryGrid.empty();
                    
                    if (media.length === 0) {
                        $galleryGrid.append($emptyState);
                        return;
                    }
                    
                    let loadedCount = 0;
                    const totalImages = media.length;
                    
                    media.forEach((mediaUrl, index) => {
                        const thumbnailHtml = `
                            <div class="thumbnail-container" data-index="${index}" style="opacity: 0;">
                                <img class="thumbnail" src="${mediaUrl}" alt="${fileNames[index]}">
                                <div class="thumbnail-info">${fileNames[index]}</div>
                            </div>
                        `;
                        $galleryGrid.append(thumbnailHtml);
                        
                        // Preload image
                        const img = new Image();
                        img.onload = function() {
                            loadedCount++;
                            if (loadedCount === totalImages) {
                                // All images loaded, now show them with animation
                                media.forEach((_, idx) => {
                                    setTimeout(() => {
                                        $(`.thumbnail-container[data-index="${idx}"]`).css('opacity', '1').addClass('slide-up');
                                    }, idx * 30);
                                });
                                showGalleryInfo(`${media.length} items in your gallery`);
                            }
                        };
                        img.src = mediaUrl;
                    });
                }
                
                function showViewer(index) {
                    currentIndex = index;
                    const currentMedia = media[currentIndex];
                    
                    $viewerImage.show().attr('src', currentMedia);
                    
                    if (blurEnabled) {
                        const $blurs = $('.viewer-background');
                        const nextBlurIndex = 1 - currentBlurIndex;
                        $blurs.eq(nextBlurIndex).css({
                            'background-image': `url(${currentMedia})`,
                            'display': 'block',
                            'opacity': 0.9
                        }).addClass('visible');
                        $blurs.eq(currentBlurIndex).removeClass('visible').css('opacity', 0);
                        currentBlurIndex = nextBlurIndex;
                        preloadAdjacentImages(currentIndex);
                    }
                    
                    $('.file-list-item').removeClass('active');
                    $(`.file-list-item[data-index="${currentIndex}"]`).addClass('active');
                    
                    $viewerModal.css('display', 'flex').addClass('fade-in');
                    
                    updateFileList();
                    
                    preloadAdjacentImages(currentIndex);
                }
                
                function preloadAdjacentImages(index) {
                    if (!blurEnabled) return;
                    
                    const prevIndex = (index - 1 + media.length) % media.length;
                    const nextIndex = (index + 1) % media.length;
                    
                    [prevIndex, nextIndex].forEach(idx => {
                        if (!preloadedImages[idx]) {
                            const img = new Image();
                            img.src = media[idx];
                            preloadedImages[idx] = img;
                        }
                    });
                }
                
                function closeViewer() {
                    $viewerModal.removeClass('fade-in');
                    setTimeout(() => {
                        $viewerModal.hide();
                    }, 300);
                }
                
                function showGalleryInfo(text) {
                    $('#gallery-info-text').text(text);
                    $galleryInfo.addClass('active');
                    
                    setTimeout(() => {
                        $galleryInfo.removeClass('active');
                    }, 3000);
                }
                
                function updateFileList() {
                    $fileList.empty();
                    
                    media.forEach((mediaUrl, index) => {
                        const isActive = index === currentIndex;
                        const itemHtml = `
                            <li class="file-list-item ${isActive ? 'active' : ''}" data-index="${index}">
                                <div class="file-icon">🖼️</div>
                                <div class="file-details">
                                    <div class="file-name">${fileNames[index]}</div>
                                    <div class="file-index">#${index + 1}</div>
                                </div>
                            </li>
                        `;
                        $fileList.append(itemHtml);
                    });
                }
                
                $('#upload-trigger, #empty-upload-trigger').click(function() {
                    $('#file-input').click();
                });
                
                $('.blur-toggle').click(function() {
                    blurEnabled = !blurEnabled;
                    $(this).toggleClass('active');
                    
                    const $blur = $('.viewer-background');
                    if (blurEnabled) {
                        $blur.css('display', 'block');
                        if (media[currentIndex]) {
                            const $blurs = $('.viewer-background');
                            const nextBlurIndex = 1 - currentBlurIndex;
                            $blurs.eq(nextBlurIndex).css({
                                'background-image': `url(${media[currentIndex]})`,
                                'display': 'block',
                                'opacity': 0.9
                            }).addClass('visible');
                            currentBlurIndex = nextBlurIndex;
                            preloadAdjacentImages(currentIndex);
                        }
                    } else {
                        $blur.removeClass('visible');
                        setTimeout(() => $blur.css('display', 'none'), 150);
                    }
                    
                    showGalleryInfo(blurEnabled ? 'Background effects enabled' : 'Background effects disabled');
                });
                
                $galleryGrid.on('click', '.thumbnail-container', function() {
                    const index = $(this).data('index');
                    showViewer(index);
                });
                
                $('.arrow-left').click(function(e) {
                    e.stopPropagation();
                    currentIndex = (currentIndex - 1 + media.length) % media.length;
                    showViewer(currentIndex);
                });
                
                $('.arrow-right').click(function(e) {
                    e.stopPropagation();
                    currentIndex = (currentIndex + 1) % media.length;
                    showViewer(currentIndex);
                });
                
                $('.close-list-btn').click(function() {
                    $fileListModal.removeClass('fade-in');
                    setTimeout(() => {
                        $fileListModal.hide();
                    }, 300);
                });
                
                $fileList.on('click', '.file-list-item', function() {
                    const index = $(this).data('index');
                    showViewer(index);
                    
                    $fileListModal.removeClass('fade-in');
                    setTimeout(() => {
                        $fileListModal.hide();
                    }, 300);
                });
                
                $(document).keydown(function(e) {
                    if ($viewerModal.is(':visible')) {
                        if (e.key === 'ArrowRight' || e.key === ' ') {
                            currentIndex = (currentIndex + 1) % media.length;
                            showViewer(currentIndex);
                        } else if (e.key === 'ArrowLeft') {
                            currentIndex = (currentIndex - 1 + media.length) % media.length;
                            showViewer(currentIndex);
                        } else if (e.key === 'Escape') {
                            closeViewer();
                        }
                    }
                });
                
                $('#file-input').on('change', function(event) {
                    const files = event.target.files;
                    let newFiles = 0;
                    
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            media.push(e.target.result);
                            fileNames.push(file.name);
                            fileTypes.push(file.type);
                            newFiles++;
                            
                            if (newFiles === files.length) {
                                updateGalleryGrid();
                                showGalleryInfo(`Added ${newFiles} new items`);
                                $('body').addClass('blurry-background');
                            }
                        };
                        
                        reader.readAsDataURL(file);
                    }
                });
                
                updateGalleryGrid();
            });
        
