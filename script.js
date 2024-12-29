document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');
    const compressAllBtn = document.getElementById('compressAllBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const batchList = document.getElementById('batchList');

    let imageItems = [];

    // 上传区域点击事件
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#007AFF';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#86868b';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#86868b';
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.match('image.*'));
        if (files.length > 10) {
            alert('最多只能选择10张图片！');
            return;
        }
        handleMultipleFiles(files);
    });

    // 文件选择处理
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 10) {
            alert('最多只能选择10张图片！');
            return;
        }
        handleMultipleFiles(files);
    });

    // 质量滑块变化事件
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value + '%';
        if (originalImage) {
            compressImage(originalImage, e.target.value / 100);
        }
    });

    // 处理多个文件
    function handleMultipleFiles(files) {
        imageItems = [];
        batchList.innerHTML = '';
        previewContainer.style.display = 'block';

        files.forEach((file, index) => {
            const imageItem = createImageItem(file, index);
            batchList.appendChild(imageItem.element);
            imageItems.push(imageItem);
        });
    }

    // 创建单个图片项
    function createImageItem(file, index) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'image-item';
        itemDiv.innerHTML = `
            <div class="preview-pair">
                <img class="preview-image original" alt="原图">
                <img class="preview-image compressed" alt="压缩后">
            </div>
            <div class="size-info">
                <span>原始：<span class="original-size">计算中...</span></span>
                <span>压缩后：<span class="compressed-size">等待压缩...</span></span>
            </div>
            <div class="status">等待压缩...</div>
        `;

        const item = {
            element: itemDiv,
            file: file,
            originalImage: null,
            compressedDataUrl: null
        };

        // 加载原图
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                item.originalImage = img;
                itemDiv.querySelector('.original').src = e.target.result;
                itemDiv.querySelector('.original-size').textContent = formatFileSize(file.size);
            };
        };
        reader.readAsDataURL(file);

        return item;
    }

    // 压缩所有图片
    compressAllBtn.addEventListener('click', () => {
        const quality = qualitySlider.value / 100;
        imageItems.forEach(item => {
            if (item.originalImage) {
                const compressedData = compressImage(item.originalImage, quality);
                item.compressedDataUrl = compressedData.dataUrl;
                
                const element = item.element;
                element.querySelector('.compressed').src = compressedData.dataUrl;
                element.querySelector('.compressed-size').textContent = formatFileSize(compressedData.size);
                element.querySelector('.status').textContent = '压缩完成';
            }
        });
    });

    // 下载所有压缩后的图片
    downloadAllBtn.addEventListener('click', () => {
        imageItems.forEach((item, index) => {
            if (item.compressedDataUrl) {
                const link = document.createElement('a');
                link.download = `compressed-image-${index + 1}.jpg`;
                link.href = item.compressedDataUrl;
                link.click();
            }
        });
    });

    // 修改压缩图片函数，返回压缩数据
    function compressImage(img, quality) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const size = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 3/4);

        return {
            dataUrl: dataUrl,
            size: size
        };
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 